import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import axiosInstance from "../api/axiosInstance";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);
import DeviationHistoryChart from "../components/DeviationHistoryChart";

export default function AthleteDashboard() {
  const [deviationData, setDeviationData] = useState([]);
  const [injuryDates, setInjuryDates] = useState([]);

  useEffect(() => {
    async function fetchDeviations() {
      try {
        const res = await axiosInstance.get("/score/deviations");
        const { deviations, injuryDates } = res.data;

        console.log(injuryDates);

        const parsed = deviations.map((entry) => ({
          ...entry,
          cognitive_function_score: Number(entry.cognitive_function_score),
          chemical_marker_score: Number(entry.chemical_marker_score),
          cognitive_function_deviation: Number(
            entry.cognitive_function_deviation
          ),
          chemical_marker_deviation: Number(entry.chemical_marker_deviation),
          combined_deviation_score: Number(entry.combined_deviation_score),
        }));

        setDeviationData(parsed);
        setInjuryDates(injuryDates);
      } catch (error) {
        console.error("Error fetching deviations:", error);
      }
    }

    fetchDeviations();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="dashboard-title">Athlete Dashboard</h2>

      {deviationData.length > 0 ? (
        <DeviationHistoryChart
          deviations={deviationData}
          injuryDates={injuryDates}
        />
      ) : (
        <p>
          No test scores available. Submit a baseline and test score to begin
          tracking.
        </p>
      )}
    </div>
  );
}

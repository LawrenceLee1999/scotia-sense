import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
  const [deviations, setDeviations] = useState([]);

  async function fetchDeviations() {
    try {
      const res = await axiosInstance.get("/score/deviations");
      setDeviations(res.data);
    } catch (error) {
      console.error("Error fetching deviations:", error);
    }
  }

  useEffect(() => {
    fetchDeviations();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="dashboard-title">Dashboard</h2>

      {deviations && deviations.length > 0 ? (
        <DeviationHistoryChart deviations={deviations} />
      ) : (
        <p>
          No test scores available. Submit a baseline and test score to begin
          tracking.
        </p>
      )}
    </div>
  );
}

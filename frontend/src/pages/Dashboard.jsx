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
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    async function fetchDeviations() {
      try {
        const res = await axios.get("http://localhost:3000/score/deviations", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const deviations = res.data;

        const labels = deviations.map((entry) =>
          new Date(entry.created_at).toLocaleDateString()
        );

        const chemicalDeviations = deviations.map(
          (entry) => entry.chemical_marker_deviation
        );

        const cognitiveDeviations = deviations.map(
          (entry) => entry.cognitive_function_deviation
        );

        setChartData({
          labels,
          datasets: [
            {
              label: "Chemical Marker Deviation",
              data: chemicalDeviations,
              borderColor: "rgba(255, 99, 132, 1)",
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              tension: 0.3,
            },
            {
              label: "Cognitive Function Deviation",
              data: cognitiveDeviations,
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching deviations:", error);
      }
    }

    fetchDeviations();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Deviation from Baseline</h2>
      {chartData ? (
        <Line
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: { position: "top" },
              title: {
                display: true,
                text: "Baseline vs Test Score Deviations",
              },
            },
            scales: {
              x: {
                title: { display: true, text: "Date" },
              },
              y: {
                title: { display: true, text: "Deviation Score" },
              },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
}

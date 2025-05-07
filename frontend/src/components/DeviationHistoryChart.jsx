import PropTypes from "prop-types";
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

export default function DeviationHistoryChart({ deviations, maxTicks = 6 }) {
  if (!deviations || deviations.length === 0)
    return <p>No score history found.</p>;

  const labels = deviations.map((entry) =>
    new Date(entry.created_at).toLocaleDateString()
  );

  const chemicalDeviations = deviations.map((entry) =>
    parseFloat(entry.chemical_marker_deviation)
  );
  const cognitiveDeviations = deviations.map((entry) =>
    parseFloat(entry.cognitive_function_deviation)
  );

  const extraData = deviations.map((entry) => ({
    cognitiveScore: entry.cognitive_function_score ?? "N/A",
    chemicalScore: entry.chemical_marker_score ?? "N/A",
    scoreType: entry.score_type ?? "N/A",
  }));

  const data = {
    labels,
    datasets: [
      {
        label: "Chemical Marker Deviation (%)",
        data: chemicalDeviations,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        tension: 0.3,
      },
      {
        label: "Cognitive Function Deviation (%)",
        data: cognitiveDeviations,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Deviation from Baseline (%)",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const datasetLabel = tooltipItem.dataset.label;
            const deviationValue = tooltipItem.raw.toFixed(2) + "%";

            if (extraData[index]) {
              const { cognitiveScore, chemicalScore, scoreType } =
                extraData[index];

              const lines = [`${datasetLabel}: ${deviationValue}`];

              if (datasetLabel.includes("Cognitive")) {
                lines.push(`Cognitive Score: ${cognitiveScore}`);
              }

              if (datasetLabel.includes("Chemical")) {
                lines.push(`Chemical Score: ${chemicalScore}`);
              }

              lines.push(`Test Type: ${scoreType}`);

              return lines;
            }

            return [`${datasetLabel}: ${deviationValue}`];
          },
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: { autoSkip: true, maxTicksLimit: maxTicks },
      },
      y: {
        title: { display: true, text: "Deviation (%)" },
        min: -20,
        suggestedMax: 60,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  const backgroundShadingPlugin = {
    id: "backgroundShading",
    beforeDatasetsDraw(chart) {
      const {
        ctx,
        chartArea: { left, right, top, bottom },
        scales: { y },
      } = chart;

      if (!y) return;

      const getY = (value) => y.getPixelForValue(value);

      const zones = [
        { min: -20, max: 10, color: "rgba(0, 255, 0, 0.3)" }, // Safe
        { min: 10, max: 25, color: "rgba(255, 255, 0, 0.3)" }, // Caution
        { min: 25, max: 40, color: "rgba(255, 165, 0, 0.3)" }, // Watch
        { min: 40, max: y.max, color: "rgba(255, 0, 0, 0.3)" }, // Danger
      ];

      ctx.save();
      ctx.beginPath();
      ctx.rect(left, top, right - left, bottom - top);
      ctx.clip();

      zones.forEach((zone) => {
        const zoneTop = getY(zone.max);
        const zoneBottom = getY(zone.min);
        ctx.fillStyle = zone.color;
        ctx.fillRect(left, zoneTop, right - left, zoneBottom - zoneTop);
      });

      ctx.restore();
    },
  };

  return (
    <div className="deviation-chart-container">
      <Line data={data} options={options} plugins={[backgroundShadingPlugin]} />
    </div>
  );
}

DeviationHistoryChart.propTypes = {
  deviations: PropTypes.arrayOf(
    PropTypes.shape({
      created_at: PropTypes.string.isRequired,
      cognitive_function_score: PropTypes.number,
      chemical_marker_score: PropTypes.number,
      cognitive_function_deviation: PropTypes.number,
      chemical_marker_deviation: PropTypes.number,
      score_type: PropTypes.string,
    })
  ).isRequired,
  maxTicks: PropTypes.number,
};

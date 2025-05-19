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
  TimeScale,
} from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";
import "chartjs-adapter-date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin,
  TimeScale
);

export default function DeviationHistoryChart({
  deviations,
  injuryDates = [],
}) {
  if (!deviations || deviations.length === 0)
    return <p>No score history found.</p>;

  const labels = deviations.map((entry) => new Date(entry.created_at));

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
    recoveryStage: entry.recovery_stage ?? null,
  }));

  const annotationObjects = {};
  injuryDates.forEach(({ date }, index) => {
    const ts = new Date(date);
    annotationObjects[`injury-${index}`] = {
      type: "line",
      xMin: ts,
      xMax: ts,
      borderColor: "rgba(255, 0, 0, 0.8)",
      borderWidth: 1,
      label: {
        display: false,
      },
    };
  });

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
          title: (tooltipItems) => {
            const iso = tooltipItems[0].label;
            const date = new Date(iso);
            return date.toLocaleString(undefined, {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          },
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const datasetLabel = tooltipItem.dataset.label;
            const deviationValue = tooltipItem.raw.toFixed(2) + "%";

            if (extraData[index]) {
              const {
                cognitiveScore,
                chemicalScore,
                scoreType,
                recoveryStage,
              } = extraData[index];

              const lines = [`${datasetLabel}: ${deviationValue}`];

              if (datasetLabel.includes("Cognitive")) {
                lines.push(`Cognitive Score: ${cognitiveScore}`);
              }

              if (datasetLabel.includes("Chemical")) {
                lines.push(`Chemical Score: ${chemicalScore}`);
              }

              if (recoveryStage) {
                lines.push(`Recovery Stage: ${recoveryStage}`);
              }

              lines.push(
                `Test Type: ${
                  scoreType.charAt(0).toUpperCase() + scoreType.slice(1)
                }`
              );
              return lines;
            }

            return [`${datasetLabel}: ${deviationValue}`];
          },
        },
      },
      annotation: {
        annotations: annotationObjects,
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          tooltipFormat: "dd MMM yyyy, HH:mm",
          displayFormats: {
            minute: "dd MMM HH:mm",
            hour: "dd MMM HH:mm",
            day: "dd MMM",
          },
        },
        title: { display: true, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 7,
        },
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
  injuryDates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      reason: PropTypes.string,
    })
  ),
  maxTicks: PropTypes.number,
};

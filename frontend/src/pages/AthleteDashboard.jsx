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

export default function AthleteDashboard() {
  const [chartData, setChartData] = useState(null);
  const [hasBaseline, setHasBaseline] = useState(false);
  const [baselineScore, setBaselineScore] = useState({
    cognitive_function_score: "",
    chemical_marker_score: "",
  });
  const [testScore, setTestScore] = useState({
    cognitive_function_score: "",
    chemical_marker_score: "",
    score_type: "screen",
  });
  const [message, setMessage] = useState(null);
  const [formType, setFormType] = useState("baseline");
  const [recoveryStage, setRecoveryStage] = useState(null);
  const [maxTicks, setMaxTicks] = useState(window.innerWidth < 768 ? 4 : 6);

  useEffect(() => {
    const handleResize = () => {
      setMaxTicks(window.innerWidth < 768 ? 4 : 6);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchRecoveryStage() {
    try {
      const res = await axiosInstance.get("/recovery/latest");
      if (res.data.recoveryStage !== null) {
        setRecoveryStage({
          message: `You are in recovery stage ${res.data.recoveryStage}. Please refer to the `,
          updatedAt: new Date(res.data.updatedAt).toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  useEffect(() => {
    async function checkBaselineScore() {
      try {
        const res = await axiosInstance.get("/score/baseline-score/check");
        setHasBaseline(res.data.exists);
      } catch (error) {
        console.error("Error checking baseline score:", error);
      }
    }
    checkBaselineScore();
  }, []);

  async function fetchDeviations() {
    try {
      const res = await axiosInstance.get("/score/deviations");

      const deviations = res.data;

      if (!deviations || deviations.length === 0) {
        setChartData(null);
        return;
      }

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
      }));

      setChartData({
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
        extraData,
      });
    } catch (error) {
      console.error("Error fetching deviations:", error);
    }
  }

  useEffect(() => {
    fetchRecoveryStage();
    fetchDeviations();
  }, []);

  const backgroundShadingPlugin = {
    id: "backgroundShading",
    beforeDraw: (chart) => {
      const {
        ctx,
        chartArea: { left, right },
        scales: { y },
      } = chart;

      const getY = (value) => y.getPixelForValue(value); // Converts % to pixel position

      ctx.save();

      const zones = [
        { min: -20, max: 10, color: "rgba(0, 255, 0, 0.3)" }, // Green (<10%)
        { min: 10, max: 25, color: "rgba(255, 255, 0, 0.3)" }, // Yellow (10-25%)
        { min: 25, max: 40, color: "rgba(255, 165, 0, 0.3)" }, // Orange (25-40%)
        { min: 40, max: y.max, color: "rgba(255, 0, 0, 0.3)" }, // Red (>40%)
      ];

      zones.forEach(({ min, max, color }) => {
        ctx.fillStyle = color;
        ctx.fillRect(left, getY(max), right - left, getY(min) - getY(max));
      });

      ctx.restore();
    },
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: "Percentage Deviation from Baseline (%)",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex;
            const datasetLabel = tooltipItem.dataset.label;
            const deviationValue = tooltipItem.raw.toFixed(2) + "%";

            if (
              chartData &&
              chartData.extraData &&
              chartData.extraData[index]
            ) {
              const { cognitiveScore, chemicalScore } =
                chartData.extraData[index];

              if (datasetLabel.includes("Cognitive")) {
                return [
                  `${datasetLabel}: ${deviationValue}`,
                  `Cognitive Function Score: ${cognitiveScore}`,
                ];
              }

              if (datasetLabel.includes("Chemical")) {
                return [
                  `${datasetLabel}: ${deviationValue}`,
                  `Chemical Marker Score: ${chemicalScore}`,
                ];
              }
            }

            return [`${datasetLabel}: ${deviationValue}`];
          },
        },
      },
      backgroundShading: {},
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        ticks: {
          autoSkip: true,
          maxTicksLimit: maxTicks,
        },
      },
      y: {
        title: { display: true, text: "Deviation (%)" },
        min: -20,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  async function handleSubmitBaseline(event) {
    event.preventDefault();
    try {
      await axiosInstance.post("/score/baseline-score", baselineScore);
      setMessage({
        type: "success",
        text: "Baseline score submitted successfully!",
      });
      setHasBaseline(true);
      setBaselineScore({
        cognitive_function_score: "",
        chemical_marker_score: "",
      });
      closeModal();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Submission failed",
      });
    }
  }

  async function handleSubmitTest(event) {
    event.preventDefault();
    try {
      await axiosInstance.post("/score/test-score", testScore);
      setMessage({
        type: "success",
        text: "Test score submitted successfully!",
      });
      setTestScore({
        cognitive_function_score: "",
        chemical_marker_score: "",
        score_type: "screen",
      });
      closeModal();
      await fetchRecoveryStage();
      await fetchDeviations();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Submission failed",
      });
    }
  }

  function openModal(type) {
    setFormType(type);
    const modal = document.getElementById("scoreModal");
    modal.classList.add("show");
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    const modal = document.getElementById("scoreModal");
    modal.classList.remove("show");
    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");
  }

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <h2 className="dashboard-title">Dashboard</h2>
        <div className="d-flex flex-wrap gap-2 justify-content-end">
          <button
            className="btn btn-primary"
            onClick={() => openModal("baseline")}
            disabled={hasBaseline}
          >
            + Submit Baseline Score
          </button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => openModal("test")}
          >
            + Submit Test Score
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`alert alert-${
            message.type === "error" ? "danger" : "success"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      {recoveryStage && (
        <div className="alert alert-warning" role="alert">
          {recoveryStage.message}
          <a
            href="https://sportscotland.org.uk/media/ztfnilyc/concussion-guidance-2024.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="alert-link"
          >
            official concussion guidance
          </a>{" "}
          for more information.
          <br />
          <small className="text-muted">
            Updated on: {recoveryStage.updatedAt}
          </small>
        </div>
      )}

      {chartData ? (
        <div className="chart-container">
          <Line
            className="mt-5 mb-5"
            data={chartData}
            options={chartOptions}
            plugins={[backgroundShadingPlugin]}
          />
        </div>
      ) : (
        <p>
          No test scores available. Submit a baseline/test score to see your
          progress.
        </p>
      )}

      <div id="scoreModal" className="modal fade">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header modal-header-custom">
              <h5 className="modal-title">
                {formType === "baseline"
                  ? "Submit Baseline Score"
                  : "Submit Test Score"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeModal}
              ></button>
            </div>
            <div className="modal-body modal-body-custom">
              {formType === "baseline" ? (
                <form onSubmit={handleSubmitBaseline}>
                  <div className="mb-3">
                    <input
                      type="number"
                      name="cognitive_function_score"
                      placeholder="Cognitive Score"
                      className="form-control"
                      step="0.01"
                      onChange={(e) =>
                        setBaselineScore({
                          ...baselineScore,
                          cognitive_function_score: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      name="chemical_marker_score"
                      placeholder="Chemical Marker Score"
                      className="form-control"
                      step="0.01"
                      onChange={(e) =>
                        setBaselineScore({
                          ...baselineScore,
                          chemical_marker_score: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmitTest}>
                  <div className="mb-3">
                    <select
                      name="score_type"
                      className="form-control"
                      step="0.01"
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          score_type: parseFloat(e.target.value),
                        })
                      }
                      required
                    >
                      <option value="screen">Screen Test</option>
                      <option value="collision">Collision Test</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      name="cognitive_function_score"
                      placeholder="Cognitive Score"
                      className="form-control"
                      step="0.01"
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          cognitive_function_score: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="number"
                      name="chemical_marker_score"
                      placeholder="Chemical Marker Score"
                      className="form-control"
                      step="0.01"
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          chemical_marker_score: parseFloat(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    Submit
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

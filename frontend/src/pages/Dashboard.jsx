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
import axiosInstance from "../api/axiosInstance";

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

  useEffect(() => {
    async function fetchDeviations() {
      try {
        const res = await axiosInstance.get("/score/deviations");

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="dashboard-title">Dashboard</h2>
        <div>
          <button
            className="btn btn-primary mx-2"
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

      {chartData ? (
        <Line
          className="mt-5 mb-5"
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
                      onChange={(e) =>
                        setBaselineScore({
                          ...baselineScore,
                          cognitive_function_score: e.target.value,
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
                      onChange={(e) =>
                        setBaselineScore({
                          ...baselineScore,
                          chemical_marker_score: e.target.value,
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
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          score_type: e.target.value,
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
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          cognitive_function_score: e.target.value,
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
                      onChange={(e) =>
                        setTestScore({
                          ...testScore,
                          chemical_marker_score: e.target.value,
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

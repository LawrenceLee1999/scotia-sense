import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import DeviationHistoryChart from "../components/DeviationHistoryChart";

export default function ClinicianDashboard() {
  const [athletes, setAthletes] = useState([]);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("baseline");
  const [baselineData, setBaselineData] = useState({});
  const [hasBaseline, setHasBaseline] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [scoreHistory, setScoreHistory] = useState({});
  const [showGraph, setShowGraph] = useState({});

  useEffect(() => {
    const fetchAthletes = async () => {
      const res = await axiosInstance.get("/clinician/athletes");
      setAthletes(res.data);
    };
    fetchAthletes();
  }, []);

  const fetchScoreHistory = async (athleteId) => {
    try {
      const res = await axiosInstance.get(`/score/deviations/${athleteId}`);
      console.log("Fetched deviations:", res.data);
      setScoreHistory((prev) => ({
        ...prev,
        [athleteId]: res.data,
      }));
    } catch (error) {
      console.error("Failed to load score history:", error);
    }
  };

  useEffect(() => {
    async function checkBaselines() {
      const statusMap = {};
      for (let athlete of athletes) {
        try {
          const res = await axiosInstance.get(
            `score/baseline-score/check/${athlete.user_id}`
          );
          statusMap[athlete.user_id] = res.data.exists;
        } catch (error) {
          console.error("Baseline check failed for:", athlete.user_id, error);
          statusMap[athlete.user_id];
        }
      }
      setHasBaseline(statusMap);
    }

    if (athletes.length > 0) {
      checkBaselines();
    }
  }, [athletes]);

  useEffect(() => {
    if (statusMessage) {
      const timeout = setTimeout(() => setStatusMessage(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [statusMessage]);

  const handleBaselineInput = (athleteId, field, value) => {
    setBaselineData((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [field]: value,
      },
    }));
  };

  const handleChange = (athleteId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [field]: value,
      },
    }));
  };

  const handleSubmitBaseline = async (athleteId, name) => {
    const data = baselineData[athleteId] || {};
    try {
      await axiosInstance.post("/score/baseline-score/clinician", {
        athlete_user_id: athleteId,
        cognitive_function_score: Number(data.cognitive_function_score),
        chemical_marker_score: Number(data.chemical_marker_score),
      });

      setStatusMessage(`Baseline score submitted for ${name}.`);
      setStatusType("success");
      setHasBaseline({ ...hasBaseline, [athleteId]: true });
    } catch (error) {
      console.error("Error submitting baseline:", error);
      setStatusMessage(`Failed to submit baseline score for ${name}.`);
      setStatusType("danger");
    }
  };

  const handleSubmitScore = async (
    athleteId,
    overrideScoreType = null,
    name = "Athlete"
  ) => {
    const data = formData[athleteId];
    if (!data) return;

    const scoreType = overrideScoreType || data.score_type || "screen";
    const isInjured = overrideScoreType === "rehab" || data.is_injured === true;

    try {
      await axiosInstance.post("/score/add", {
        athlete_user_id: athleteId,
        score_type: scoreType,
        cognitive_function_score: Number(data.cognitive_function_score),
        chemical_marker_score: Number(data.chemical_marker_score),
        is_injured: isInjured,
        ...(isInjured &&
          overrideScoreType !== "rehab" && {
            reason: data.reason || "",
          }),
      });

      setStatusMessage(
        `${
          scoreType.charAt(0).toUpperCase() + scoreType.slice(1)
        } score submitted for ${name}.`
      );
      setStatusType("success");
    } catch (error) {
      console.error("Test score submission error:", error);
      setStatusMessage(`Failed to submit ${scoreType} score for ${name}.`);
      setStatusType("danger");
    }
  };

  const handleSubmitRecoveryStage = async (athleteId, name) => {
    const stage = formData[athleteId]?.recovery_stage;
    if (!stage) {
      setStatusMessage("Please select a recovery stage before submitting.");
      setStatusType("danger");
      return;
    }
    try {
      await axiosInstance.post("/recovery/stage", {
        athlete_user_id: athleteId,
        stage: Number(stage),
      });
      setStatusMessage(`Recovery stage updated for ${name} to Stage ${stage}.`);
      setStatusType("success");
    } catch (error) {
      console.error("Error updating recovery stage:", error);
      setStatusMessage(`Failed to update recovery stage for ${name}.`);
      setStatusType("danger");
    }
  };

  const healthyAthletes = athletes.filter(
    (a) => !a.is_injured && hasBaseline[a.user_id]
  );
  const injuredAthletes = athletes.filter((a) => a.is_injured);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Clinician Dashboard</h2>

      <div className="mb-4">
        <button
          className={`btn me-2 ${
            activeTab === "baseline" ? "btn-danger" : "btn-outline-danger"
          }`}
          onClick={() => setActiveTab("baseline")}
        >
          Submit Baseline Scores
        </button>
        <button
          className={`btn me-2 ${
            activeTab === "healthy" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("healthy")}
        >
          Healthy Athletes
        </button>
        <button
          className={`btn me-2 ${
            activeTab === "rehab" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("rehab")}
        >
          Injured Athletes
        </button>
      </div>

      {statusMessage && (
        <div
          className={`alert alert-${statusType} alert-dismissible fade show`}
          role="alert"
        >
          {statusMessage}
          <button
            type="button"
            className="btn-close"
            onClick={() => setStatusMessage(null)}
          ></button>
        </div>
      )}

      {activeTab === "baseline" && (
        <>
          {athletes.filter((a) => !hasBaseline[a.user_id]).length === 0 ? (
            <p>All athletes have baseline scores for the current season.</p>
          ) : (
            athletes
              .filter((a) => !hasBaseline[a.user_id])
              .map((athlete) => {
                const data = baselineData[athlete.user_id] || {};
                return (
                  <div key={athlete.user_id} className="card mb-4">
                    <div className="card-body">
                      <h5 className="card-title">
                        {athlete.first_name} {athlete.last_name}
                      </h5>
                      <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                          <label className="form-label">
                            Cognitive Function Score
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={data.cognitive_function_score || ""}
                            onChange={(e) =>
                              handleBaselineInput(
                                athlete.user_id,
                                "cognitive_function_score",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">
                            Chemical Marker Score
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            value={data.chemical_marker_score || ""}
                            onChange={(e) =>
                              handleBaselineInput(
                                athlete.user_id,
                                "chemical_marker_score",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="col-md-12">
                          <button
                            className="btn btn-success"
                            onClick={() =>
                              handleSubmitBaseline(
                                athlete.user_id,
                                `${athlete.first_name} ${athlete.last_name}`
                              )
                            }
                          >
                            Submit Baseline
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </>
      )}

      {activeTab === "healthy" &&
        (healthyAthletes.length === 0 ? (
          <p>No healthy athletes found.</p>
        ) : (
          healthyAthletes.map((athlete) => {
            const data = formData[athlete.user_id] || {};
            return (
              <div key={athlete.user_id} className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">
                    {athlete.first_name} {athlete.last_name}
                  </h5>
                  <div className="row g-3 align-items-end">
                    <div className="col-md-6">
                      <label className="form-label">Score Type</label>
                      <select
                        className="form-select"
                        value={data.score_type || "screen"}
                        onChange={(e) =>
                          handleChange(
                            athlete.user_id,
                            "score_type",
                            e.target.value
                          )
                        }
                      >
                        <option value="screen">Screen</option>
                        <option value="collision">Collision</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Cognitive Score</label>
                      <input
                        type="number"
                        className="form-control"
                        value={data.cognitive_function_score || ""}
                        onChange={(e) =>
                          handleChange(
                            athlete.user_id,
                            "cognitive_function_score",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Chemical Marker Score
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={data.chemical_marker_score || ""}
                        onChange={(e) =>
                          handleChange(
                            athlete.user_id,
                            "chemical_marker_score",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="col-12 form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`injuredCheck-${athlete.user_id}`}
                        checked={data.is_injured || false}
                        onChange={(e) =>
                          handleChange(
                            athlete.user_id,
                            "is_injured",
                            e.target.checked
                          )
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`injuredCheck-${athlete.user_id}`}
                      >
                        Mark as Injured
                      </label>
                    </div>

                    {data.is_injured && (
                      <div className="col-12">
                        <label className="form-label">Injury Reason</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          placeholder="Describe injury..."
                          value={data.reason || ""}
                          onChange={(e) =>
                            handleChange(
                              athlete.user_id,
                              "reason",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}

                    <div className="col-md-12 mt-3">
                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          handleSubmitScore(
                            athlete.user_id,
                            null,
                            `${athlete.first_name} ${athlete.last_name}`
                          )
                        }
                      >
                        Submit Score
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary mb-3"
                  onClick={() => {
                    setShowGraph((prev) => ({
                      ...prev,
                      [athlete.user_id]: !prev[athlete.user_id],
                    }));
                    if (!scoreHistory[athlete.user_id]) {
                      fetchScoreHistory(athlete.user_id);
                    }
                  }}
                >
                  {showGraph[athlete.user_id]
                    ? "Hide Score History"
                    : "Show Score History"}
                </button>

                {showGraph[athlete.user_id] &&
                  scoreHistory[athlete.user_id] && (
                    <DeviationHistoryChart
                      deviations={scoreHistory[athlete.user_id]}
                    />
                  )}
              </div>
            );
          })
        ))}

      {activeTab === "rehab" &&
        (injuredAthletes.length === 0 ? (
          <p>No injured athletes in rehab.</p>
        ) : (
          injuredAthletes.map((athlete) => {
            const data = formData[athlete.user_id] || {};
            return (
              <div key={athlete.user_id} className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">
                    {athlete.first_name} {athlete.last_name} (Rehab)
                  </h5>

                  <div className="mb-4 p-3 border rounded bg-light">
                    <h6 className="mb-3">🧪 Submit Rehab Test Score</h6>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-6">
                        <label className="form-label">Cognitive Score</label>
                        <input
                          type="number"
                          className="form-control"
                          value={data.cognitive_function_score || ""}
                          onChange={(e) =>
                            handleChange(
                              athlete.user_id,
                              "cognitive_function_score",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">
                          Chemical Marker Score
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={data.chemical_marker_score || ""}
                          onChange={(e) =>
                            handleChange(
                              athlete.user_id,
                              "chemical_marker_score",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="col-md-12">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() =>
                            handleSubmitScore(
                              athlete.user_id,
                              "rehab",
                              `${athlete.first_name} ${athlete.last_name}`
                            )
                          }
                        >
                          Submit Rehab Score
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded bg-light-subtle">
                    <h6 className="mb-3">📈 Update Recovery Stage</h6>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-6">
                        <label className="form-label">Recovery Stage</label>
                        <select
                          className="form-select"
                          value={data.recovery_stage || ""}
                          onChange={(e) =>
                            handleChange(
                              athlete.user_id,
                              "recovery_stage",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Select stage</option>
                          <option value="1">Stage 1 – Rest</option>
                          <option value="2">Stage 2 – Light aerobic</option>
                          <option value="3">Stage 3 – Sport-specific</option>
                          <option value="4">
                            Stage 4 – Non-contact training
                          </option>
                          <option value="5">Stage 5 – Full training</option>
                          <option value="6">Stage 6 – Game play</option>
                        </select>
                      </div>
                      <div className="col-md-12 mt-3">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            handleSubmitRecoveryStage(
                              athlete.user_id,
                              `${athlete.first_name} ${athlete.last_name}`
                            )
                          }
                        >
                          Update Recovery Stage
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-outline-secondary mb-3"
                    onClick={() => {
                      setShowGraph((prev) => ({
                        ...prev,
                        [athlete.user_id]: !prev[athlete.user_id],
                      }));
                      if (!scoreHistory[athlete.user_id]) {
                        fetchScoreHistory(athlete.user_id);
                      }
                    }}
                  >
                    {showGraph[athlete.user_id]
                      ? "Hide Score History"
                      : "Show Score History"}
                  </button>

                  {showGraph[athlete.user_id] &&
                    scoreHistory[athlete.user_id] && (
                      <DeviationHistoryChart
                        deviations={scoreHistory[athlete.user_id]}
                      />
                    )}
                </div>
              </div>
            );
          })
        ))}
    </div>
  );
}

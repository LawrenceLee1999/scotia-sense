import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ClinicianDashboard() {
  const [athletes, setAthletes] = useState([]);
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("healthy");

  useEffect(() => {
    const fetchAthletes = async () => {
      const res = await axiosInstance.get("/clinician/athletes");
      setAthletes(res.data);
    };
    fetchAthletes();
  }, []);

  const handleChange = (athleteId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [athleteId]: {
        ...prev[athleteId],
        [field]: value,
      },
    }));
  };

  const handleSubmitScore = async (athleteId, overrideScoreType = null) => {
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

      alert("Test score submitted!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit score");
    }
  };

  const handleSubmitRecoveryStage = async (athleteId) => {
    const stage = formData[athleteId]?.recovery_stage;
    if (!stage) return alert("Please select a recovery stage");
    try {
      await axiosInstance.post("/recovery/stage", {
        athlete_user_id: athleteId,
        stage: Number(stage),
      });
      alert("Recovery stage updated!");
    } catch (error) {
      console.error("Error updating recovery stage:", error);
      alert("Failed to update recovery stage.");
    }
  };

  const healthyAthletes = athletes.filter((a) => !a.is_injured);
  const injuredAthletes = athletes.filter((a) => a.is_injured);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Clinician Dashboard</h2>

      <div className="mb-4">
        <button
          className={`btn me-2 ${
            activeTab === "healthy" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("healthy")}
        >
          Healthy Athletes
        </button>
        <button
          className={`btn ${
            activeTab === "rehab" ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => setActiveTab("rehab")}
        >
          Injured Athletes
        </button>
      </div>

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

                  <div className="row g-3 mb-3">
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
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={() => handleSubmitScore(athlete.user_id)}
                  >
                    Submit Score
                  </button>
                </div>
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
                    <div className="row g-3">
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
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() =>
                          handleSubmitScore(athlete.user_id, "rehab")
                        }
                      >
                        Submit Rehab Score
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 p-3 border rounded bg-light-subtle">
                    <h6 className="mb-3">📈 Update Recovery Stage</h6>
                    <div className="row g-3">
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
                    </div>
                    <div className="mt-3">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() =>
                          handleSubmitRecoveryStage(athlete.user_id)
                        }
                      >
                        Update Recovery Stage
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ))}
    </div>
  );
}

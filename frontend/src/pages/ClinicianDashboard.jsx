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
  const [baselineLoading, setBaselineLoading] = useState(true);

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
      const { deviations, injuryDates } = res.data;

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

      setScoreHistory((prev) => ({
        ...prev,
        [athleteId]: {
          deviations: parsed,
          injuryDates,
        },
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
      setBaselineLoading(false);
    }

    if (athletes.length > 0) {
      checkBaselines();
    }
  }, [athletes]);

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
    const scoreType = overrideScoreType || data.score_type || "screen";
    const isInjured = overrideScoreType === "rehab" || data.is_injured === true;

    if (
      !data ||
      data.cognitive_function_score == null ||
      data.chemical_marker_score == null ||
      data.cognitive_function_score === "" ||
      data.chemical_marker_score === ""
    ) {
      setStatusMessage("Please enter both cognitive and chemical scores.");
      setStatusType("danger");
      return;
    }

    if (data.is_injured && !data.reason) {
      setStatusMessage("Please provide an injury reason.");
      setStatusType("danger");
      return;
    }

    const hasCognitive =
      data.cognitive_function_score !== undefined &&
      data.cognitive_function_score !== "";
    const hasChemical =
      data.chemical_marker_score !== undefined &&
      data.chemical_marker_score !== "";
    const hasStage =
      data.recovery_stage !== undefined && data.recovery_stage !== "";

    if (scoreType === "rehab") {
      if (!hasCognitive || !hasChemical || !hasStage) {
        setStatusMessage(
          "Please enter all scores and select a recovery stage."
        );
        setStatusType("danger");
        return;
      }
    }

    const isCollision = scoreType === "collision";
    const hasFiles =
      Array.isArray(data.scat6_files) && data.scat6_files.length > 0;

    try {
      if (isCollision && hasFiles) {
        const formDataToSend = new FormData();
        formDataToSend.append("athlete_user_id", athleteId);
        formDataToSend.append("score_type", scoreType);
        formDataToSend.append(
          "cognitive_function_score",
          data.cognitive_function_score
        );
        formDataToSend.append(
          "chemical_marker_score",
          data.chemical_marker_score
        );
        formDataToSend.append("is_injured", isInjured);
        if (isInjured && data.reason) {
          formDataToSend.append("reason", data.reason);
        }

        for (const file of data.scat6_files) {
          formDataToSend.append("scat6_files", file);
        }

        if (data.note?.trim()) {
          formDataToSend.append("note", data.note.trim());
        }

        await axiosInstance.post("/score/add", formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
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
          ...(scoreType === "rehab" && {
            recovery_stage: Number(data.recovery_stage),
          }),
          ...(data.note?.trim() && {
            note: data.note.trim(),
          }),
        });
      }

      setStatusMessage(
        `${
          scoreType.charAt(0).toUpperCase() + scoreType.slice(1)
        } score submitted for ${name}.` +
          (scoreType === "rehab"
            ? ` Recovery stage set to ${data.recovery_stage}.`
            : "")
      );
      setStatusType("success");
    } catch (error) {
      console.error("Error submitting score and stage:", error);
      const errMessage = error?.response?.data?.message;
      setStatusMessage(errMessage || `Failed to submit data for ${name}.`);
      setStatusType("danger");
    }
  };

  const healthyAthletes = athletes.filter(
    (a) => !a.is_injured && hasBaseline[a.user_id]
  );
  const injuredAthletes = athletes.filter((a) => a.is_injured);

  const handleClearInjury = async (athleteId, name) => {
    try {
      await axiosInstance.post("/score/clear-injury", {
        athlete_user_id: athleteId,
      });

      setStatusMessage(`${name} has been cleared from injury.`);
      setStatusType("success");

      const updated = await axiosInstance.get("/clinician/athletes");
      setAthletes(updated.data);
    } catch (error) {
      console.error("Clearance failed:", error);
      setStatusMessage(`Failed to clear injury for ${name}.`);
      setStatusType("danger");
    }
  };

  const getDaysSinceInjury = (injuryDate) => {
    if (!injuryDate) return null;
    const diff = Date.now() - new Date(injuryDate).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

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
          {baselineLoading ? (
            <p>Checking baseline scores...</p>
          ) : athletes.filter((a) => !hasBaseline[a.user_id]).length === 0 ? (
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
                      <label className="form-label">
                        Cognitive Function Score
                      </label>
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
                    <div className="col-12">
                      <label className="form-label">
                        Clinician Note (Optional)
                      </label>
                      <textarea
                        className="form-control"
                        rows="2"
                        placeholder="E.g Athlete reported slight headache after session..."
                        value={data.note || ""}
                        onChange={(e) =>
                          handleChange(athlete.user_id, "note", e.target.value)
                        }
                      ></textarea>
                    </div>
                    {data.score_type === "collision" && (
                      <div className="col-md-12">
                        <label className="form-label">
                          SCAT-6 Assessment Images
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          name="scat6_files"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            handleChange(
                              athlete.user_id,
                              "scat6_files",
                              Array.from(e.target.files)
                            )
                          }
                        />
                        <small className="text-muted">
                          Upload up to 10 image files.
                        </small>
                      </div>
                    )}

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
                      <button
                        className="btn btn-outline-secondary mx-2"
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
                          <div className="mt-3">
                            <DeviationHistoryChart
                              deviations={
                                scoreHistory[athlete.user_id]?.deviations || []
                              }
                              injuryDates={
                                scoreHistory[athlete.user_id]?.injuryDates || []
                              }
                            />
                          </div>
                        )}
                    </div>
                  </div>
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
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title mb-0">
                      {athlete.first_name} {athlete.last_name} (Rehab)
                      {athlete.is_injured && athlete.logged_at && (
                        <div className="text-primary mb-2 fw-bold">
                          Injured {getDaysSinceInjury(athlete.logged_at)} day(s)
                          ago
                        </div>
                      )}
                    </h5>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() =>
                        handleClearInjury(
                          athlete.user_id,
                          `${athlete.first_name} ${athlete.last_name}`
                        )
                      }
                    >
                      ✅ Clear From Injury
                    </button>
                  </div>

                  <div className="mb-4 p-3 border rounded bg-light">
                    <h6 className="mb-3">
                      🧪 Submit Rehab Test Score and Recovery Stage
                    </h6>
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
                          Submit Rehab Score and Recovery Stage
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded bg-light-subtle mt-3">
                    <h6 className="mb-3">📊 Test History</h6>
                    <button
                      className="btn btn-outline-secondary"
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
                        <div className="mt-3">
                          <DeviationHistoryChart
                            deviations={
                              scoreHistory[athlete.user_id]?.deviations || []
                            }
                            injuryDates={
                              scoreHistory[athlete.user_id]?.injuryDates || []
                            }
                          />
                        </div>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        ))}
    </div>
  );
}

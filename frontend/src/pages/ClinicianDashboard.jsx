import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ClinicianDashboard() {
  const [athletes, setAthletes] = useState([]);
  const [formData, setFormData] = useState({});

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

  const handleSubmit = async (athleteId) => {
    const data = formData[athleteId];
    if (!data) return;

    try {
      await axiosInstance.post("/score/add", {
        athlete_user_id: athleteId,
        score_type: data.score_type || "screen",
        cognitive_function_score: Number(data.cognitive_function_score),
        chemical_marker_score: Number(data.chemical_marker_score),
        is_injured: data.is_injured || false,
        reason: data.is_injured ? data.reason || " " : null,
      });

      alert("Test score submitted!");
    } catch (error) {
      console.error(error);
      alert("Failed to submit score");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Clinician Dashboard</h1>
      {athletes.map((athlete) => {
        const athleteData = formData[athlete.user_id] || {};
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
                    value={athleteData.score_type || "screen"}
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
                  <label className="form-label">Chemical Marker Score</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter score"
                    value={athleteData.chemical_marker_score || ""}
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
                  <label className="form-label">Cognitive Function Score</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Enter score"
                    value={athleteData.cognitive_function_score || ""}
                    onChange={(e) =>
                      handleChange(
                        athlete.user_id,
                        "cognitive_function_score",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="col-12 form-check mt-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={athleteData.is_injured || false}
                    onChange={(e) =>
                      handleChange(
                        athlete.user_id,
                        "is_injured",
                        e.target.checked
                      )
                    }
                    id={`injuredCheck-${athlete.user_id}`}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`injuredCheck-${athlete.user_id}`}
                  >
                    Mark as Injured
                  </label>
                </div>

                {athleteData.is_injured && (
                  <div className="col-12">
                    <label className="form-label">Injury Reason</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Describe injury..."
                      value={athleteData.reason || ""}
                      onChange={(e) =>
                        handleChange(athlete.user_id, "reason", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleSubmit(athlete.user_id)}
              >
                Submit Test Score
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

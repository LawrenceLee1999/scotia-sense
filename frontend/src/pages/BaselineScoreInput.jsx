import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function BaselineScoreInput() {
  const [baselineScore, setBaselineScore] = useState({
    cognitive_function_score: "",
    chemical_marker_score: "",
  });

  function handleChange(event) {
    setBaselineScore({
      ...baselineScore,
      [event.target.name]: event.target.value,
    });
  }

  const [message, setMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage({
        type: "error",
        text: "You must be logged in to submit a baseline score.",
      });
      return;
    }

    try {
      await axiosInstance.post("/score/baseline-score", baselineScore);
      setMessage({
        type: "success",
        text: "Baseline score submitted successfully!",
      });
      setBaselineScore({
        cognitive_function_score: "",
        chemical_marker_score: "",
      });
    } catch (error) {
      console.error("Error submitting baseline score:", error.res?.data);
      setMessage({
        type: "error",
        text: error.res?.data?.message || "Submission failed.",
      });
    }
  }

  return (
    <div className="container mt-5">
      {message && (
        <div
          className={`alert ${
            message.type === "error" ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}
      <h2>Submit Baseline Score</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Cognitive Function Score</label>
          <input
            type="number"
            name="cognitive_function_score"
            className="form-control"
            value={baselineScore.cognitive_function_score}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Chemical Marker Score</label>
          <input
            type="number"
            name="chemical_marker_score"
            className="form-control"
            value={baselineScore.chemical_marker_score}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit Baseline Score
        </button>
      </form>
    </div>
  );
}

import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function TestScoreInput() {
  const [testScore, setTestScore] = useState({
    score_type: "screen",
    cognitive_function_score: "",
    chemical_marker_score: "",
  });

  function handleChange(event) {
    setTestScore({
      ...testScore,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to submit a test score.");
      return;
    }

    try {
      await axiosInstance.post("/score/test-score", testScore);
      alert("Test score submitted successfully");
      setTestScore({
        score_type: "screen",
        cognitive_function_score: "",
        chemical_marker_score: "",
      });
    } catch (error) {
      console.error("Error submitting test score:", error.res?.data);
      alert(error.res?.data?.message || "Submission failed.");
    }
  }

  return (
    <div className="container mt-5">
      <h2>Submit Test Score</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Score Type</label>
          <select
            name="score_type"
            className="form-control"
            value={testScore.score_type}
            onChange={handleChange}
            required
          >
            <option value="screen">Screen</option>
            <option value="collision">Collision</option>
          </select>
          <label className="form-label">Cognitive Function Score</label>
          <input
            type="number"
            name="cognitive_function_score"
            className="form-control"
            value={testScore.cognitive_function_score}
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
            value={testScore.chemical_marker_score}
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

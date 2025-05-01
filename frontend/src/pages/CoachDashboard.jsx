import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";

export default function CoachDashboard() {
  const { isAuthenticated } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAthletes() {
      try {
        const res = await axiosInstance.get("/coach/athletes", {
          withCredentials: true,
        });
        setAthletes(res.data);
      } catch (error) {
        console.error("Error fetching athletes:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchAthletes();
    }
  }, [isAuthenticated]);

  if (loading) return <p>Loading Athletes...</p>;

  return (
    <div className="container mt-5">
      <h2>Team Overview</h2>
      {athletes.length === 0 ? (
        <p>No athletes assigned to you.</p>
      ) : (
        <table className="table mt-5">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Position</th>
              <th>Recovery Stage</th>
              <th>Score</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((athlete) => (
              <tr key={athlete.athlete_id}>
                <td>{athlete.first_name}</td>
                <td>{athlete.last_name}</td>
                <td>{athlete.position}</td>
                <td>{athlete.recovery_stage || "-"}</td>
                <td>
                  {athlete.combined_deviation_score != null
                    ? Number(athlete.combined_deviation_score).toFixed(1) + "%"
                    : "N/A"}
                </td>
                <td>
                  <span
                    className={`badge ${
                      athlete.score_type === "injured"
                        ? "bg-danger"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {athlete.score_type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

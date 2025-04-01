import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";

export default function CoachDashboard() {
  const { isAuthenticated } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAthletesRecovery() {
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
      fetchAthletesRecovery();
    }
  }, [isAuthenticated]);

  if (loading) return <p>Loading Athletes...</p>;

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  return (
    <div className="container mt-5">
      <h2>Coach Dashboard</h2>
      {athletes.length === 0 ? (
        <p>No athletes assigned to you.</p>
      ) : (
        <table className="table mt-5">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Recovery Stage</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {athletes.map((athlete) => (
              <tr key={athlete.athlete_id}>
                <td>{athlete.first_name}</td>
                <td>{athlete.last_name}</td>
                <td>{athlete.recovery_stage}</td>
                <td>{formatDate(athlete.updated_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";

export default function CoachDashboard() {
  const { isAuthenticated } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    position: "",
    is_injured: "",
    recovery_stage: "",
  });
  const [injurySortOrder, setInjurySortOrder] = useState("desc");

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

  const filteredAthletes = athletes.filter((a) => {
    return (
      (filters.position === "" || a.position === filters.position) &&
      (filters.is_injured === "" ||
        String(a.is_injured) === filters.is_injured) &&
      (filters.recovery_stage === "" ||
        String(a.recovery_stage) === filters.recovery_stage)
    );
  });

  const sortedAthletes = [
    ...filteredAthletes
      .filter((a) => a.is_injured && a.logged_at)
      .sort((a, b) => {
        const aDate = new Date(a.logged_at);
        const bDate = new Date(b.logged_at);
        return injurySortOrder === "desc" ? bDate - aDate : aDate - bDate;
      }),

    ...filteredAthletes.filter((a) => !a.is_injured),
  ];

  return (
    <div className="container mt-5">
      <h2>Team Overview</h2>
      {athletes.length === 0 ? (
        <p>No athletes assigned to you.</p>
      ) : (
        <div>
          <div className="d-flex gap-2 mb-4 justify-content-end">
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                setFilters({ position: "", is_injured: "", recovery_stage: "" })
              }
            >
              Clear Filters
            </button>
            <div className="dropdown">
              <button
                className="btn btn-outline-primary dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Filter Athletes
              </button>
              <div className="dropdown-menu p-3" style={{ minWidth: "300px" }}>
                <label className="form-label">Position</label>
                <select
                  className="form-select mb-2"
                  value={filters.position}
                  onChange={(e) =>
                    setFilters({ ...filters, position: e.target.value })
                  }
                >
                  <option value="">All Positions</option>
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                </select>

                <label className="form-label">Injury Status</label>
                <select
                  className="form-select mb-2"
                  value={filters.is_injured}
                  onChange={(e) =>
                    setFilters({ ...filters, is_injured: e.target.value })
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="true">Injured</option>
                  <option value="false">Healthy</option>
                </select>

                <label className="form-label">Recovery Stage</label>
                <select
                  className="form-select"
                  value={filters.recovery_stage}
                  onChange={(e) =>
                    setFilters({ ...filters, recovery_stage: e.target.value })
                  }
                >
                  <option value="">All Stages</option>
                  <option value="1">Stage 1 – Rest</option>
                  <option value="2">Stage 2 – Light aerobic</option>
                  <option value="3">Stage 3 – Sport-specific</option>
                  <option value="4">Stage 4 – Non-contact training</option>
                  <option value="5">Stage 5 – Full training</option>
                  <option value="6">Stage 6 – Game play</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label me-2">Sort by Injury Date</label>
              <select
                className="form-select"
                style={{ width: "200px", display: "inline-block" }}
                value={injurySortOrder}
                onChange={(e) => setInjurySortOrder(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
          <table className="table mt-5">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Injury Date</th>
                <th>Recovery Stage</th>
                <th>Score</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {sortedAthletes.map((athlete) => (
                <tr key={athlete.athlete_id}>
                  <td>{athlete.first_name}</td>
                  <td>{athlete.last_name}</td>
                  <td>{athlete.position}</td>
                  <td>
                    {athlete.is_injured && athlete.logged_at
                      ? new Date(athlete.logged_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td>
                    {athlete.is_injured && athlete.recovery_stage
                      ? `Stage ${athlete.recovery_stage}`
                      : "-"}
                  </td>
                  <td>
                    {athlete.combined_deviation_score != null
                      ? Number(athlete.combined_deviation_score).toFixed(1) +
                        "%"
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
        </div>
      )}
    </div>
  );
}

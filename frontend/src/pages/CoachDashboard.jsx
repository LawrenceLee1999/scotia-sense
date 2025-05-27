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
  const [sortBy, setSortBy] = useState("injuryDateDesc");
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const handleViewNotes = (athlete) => {
    setSelectedNote(athlete.latest_note || "No notes available.");
    setShowNoteModal(true);
  };

  const handleCloseModal = () => {
    setShowNoteModal(false);
    setSelectedNote(null);
  };

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

  const sortedAthletes = [...filteredAthletes].sort((a, b) => {
    if (sortBy === "injuryDateDesc") {
      return new Date(b.logged_at || 0) - new Date(a.logged_at || 0);
    }
    if (sortBy === "injuryDateAsc") {
      return new Date(a.logged_at || 0) - new Date(b.logged_at || 0);
    }
    if (sortBy === "traumaHighToLow") {
      return (
        (b.combined_deviation_score ?? -Infinity) -
        (a.combined_deviation_score ?? -Infinity)
      );
    }
    if (sortBy === "traumaLowToHigh") {
      return (
        (a.combined_deviation_score ?? Infinity) -
        (b.combined_deviation_score ?? Infinity)
      );
    }
    return 0;
  });

  return (
    <div className="container mt-5">
      <h2>Team Overview</h2>
      {athletes.length === 0 ? (
        <p>No athletes assigned to you.</p>
      ) : (
        <div>
          <div className="d-flex justify-content-between mt-4 mb-4">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setFilters({
                    position: "",
                    is_injured: "",
                    recovery_stage: "",
                  })
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
                <div
                  className="dropdown-menu p-3"
                  style={{ minWidth: "300px" }}
                >
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
            </div>

            <div>
              <label className="form-label me-2">Sort Athletes By</label>
              <select
                className="form-select"
                style={{ width: "250px", display: "inline-block" }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="injuryDateDesc">
                  Injury Date (Newest First)
                </option>
                <option value="injuryDateAsc">
                  Injury Date (Oldest First)
                </option>
                <option value="traumaHighToLow">
                  Trauma Score (High to Low)
                </option>
                <option value="traumaLowToHigh">
                  Trauma Score (Low to High)
                </option>
              </select>
            </div>
          </div>
          <table className="table mt-4">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Position</th>
                <th>Injury Date</th>
                <th>Recovery Stage</th>
                <th>Trauma Score</th>
                <th>Injury Status</th>
                <th>Recent Note</th>
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
                          : "bg-success"
                      }`}
                    >
                      {athlete.score_type}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewNotes(athlete)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showNoteModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Recent Note</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>{selectedNote}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

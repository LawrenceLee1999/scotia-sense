import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import InviteUserForm from "../components/InviteUserForm";

export default function SuperAdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: "", sport: "" });
  const [editTeam, setEditTeam] = useState({ id: null, name: "", sport: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newAdminStatus, setNewAdminStatus] = useState(false);
  const [confirmTeamName, setConfirmTeamName] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [adminError, setAdminError] = useState(null);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("");

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get("/admin/teams");
      setTeams(res.data.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
      console.log(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/admin/teams", newTeam);
      setNewTeam({ name: "", sport: "" });
      fetchTeams();
    } catch (err) {
      console.error("Failed to create team:", err);
    }
  };

  const handleEditTeam = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/admin/teams/${editTeam.id}`, {
        name: editTeam.name,
        sport: editTeam.sport,
      });
      setEditTeam({ id: null, name: "", sport: "" });
      fetchTeams();
    } catch (err) {
      console.error("Failed to update team:", err);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await axiosInstance.delete(`/admin/teams/${teamToDelete.id}`);
      setTeams((prev) => prev.filter((t) => t.id !== teamToDelete.id));
      setShowDeleteModal(false);
      setDeleteError(null);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to delete team. Please try again.";
      setDeleteError(message);
    }
  };

  const handleTeamFilterChange = (e) => {
    setSelectedTeamFilter(e.target.value);
  };

  const filteredUsers = users
    .filter((user) => !(user.role === null && user.team_name === null))
    .filter((user) =>
      selectedTeamFilter === "" ? true : user.team_name === selectedTeamFilter
    );

  return (
    <div className="container mt-4 mb-5">
      <h2>Superadmin Dashboard</h2>

      <InviteUserForm roles={["clinician", "coach", "admin"]} />

      {/* Create Team Form */}
      <div className="mt-4">
        <h4>➕ Create Team</h4>
        <form onSubmit={handleCreateTeam} className="mb-3">
          <div className="row g-2">
            <div className="col-md-5">
              <input
                type="text"
                className="form-control"
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-5">
              <select
                className="form-control"
                value={newTeam.sport}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, sport: e.target.value })
                }
                required
              >
                <option value="">Select Sport</option>
                <option value="Football">Football</option>
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">
                Create
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Team List */}
      <div className="mt-4">
        <h4>🏟️ Teams</h4>
        <ul className="list-group">
          {teams.map((team) => (
            <li
              key={team.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <strong>{team.name}</strong> ({team.sport})<br />
                Admin: {team.admins || "Not Assigned"}
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    setEditTeam({
                      id: team.id,
                      name: team.name,
                      sport: team.sport,
                    })
                  }
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    setTeamToDelete(team);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Edit Team Form */}
      {editTeam.id && (
        <div className="mt-4">
          <h4>✏️ Edit Team</h4>
          <form onSubmit={handleEditTeam}>
            <div className="row g-2">
              <div className="col-md-5">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Team Name"
                  value={editTeam.name}
                  onChange={(e) =>
                    setEditTeam({ ...editTeam, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="col-md-5">
                <select
                  className="form-control"
                  value={editTeam.sport}
                  onChange={(e) =>
                    setNewTeam({ ...editTeam, sport: e.target.value })
                  }
                  required
                >
                  <option value="">Select Sport</option>
                  <option value="Football">Football</option>
                </select>
              </div>
              <div className="col-md-2 d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditTeam({ id: null, name: "", sport: "" })}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row mt-5 d-flex">
        <div className="col-md-4 ms-auto">
          <label className="form-label">Filter by Team</label>
          <select
            className="form-select"
            value={selectedTeamFilter}
            onChange={handleTeamFilterChange}
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* User List */}
      <div className="mt-2">
        <h4>👥 All Users</h4>
        {adminError && (
          <div
            className="alert alert-danger alert-dismissible fade show"
            role="alert"
          >
            {adminError}
            <button
              type="button"
              className="btn-close"
              onClick={() => setAdminError(null)}
            ></button>
          </div>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Team</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>
                  {user.role ? user.role : user.team_name ? "team admin" : ""}
                </td>
                <td>{user.team_name || "—"}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={user.is_admin}
                    onChange={() => {
                      setSelectedUser(user);
                      setNewAdminStatus(!user.is_admin);
                      setShowConfirmModal(true);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showConfirmModal && selectedUser && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Admin Change</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to{" "}
                  <strong>{newAdminStatus ? "grant" : "revoke"}</strong> admin
                  access for{" "}
                  <strong>
                    {selectedUser.first_name} {selectedUser.last_name}
                  </strong>
                  ?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await axiosInstance.put(
                        `/admin/users/${selectedUser.id}/admin-status`,
                        {
                          is_admin: newAdminStatus,
                        }
                      );
                      await fetchUsers();
                      await fetchTeams();
                      setAdminError(null);
                    } catch (error) {
                      console.error("Failed to toggle admin:", error);
                      const msg =
                        error.response?.data?.message ||
                        "Failed to update admin status.";
                      setAdminError(msg);
                    } finally {
                      setShowConfirmModal(false);
                    }
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">⚠️ Confirm Team Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmTeamName("");
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {deleteError && (
                  <div className="alert alert-danger mt-2">{deleteError}</div>
                )}
                <p>
                  To confirm, type <strong>{teamToDelete?.name}</strong> below:
                </p>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter team name to confirm"
                  value={confirmTeamName}
                  onChange={(e) => setConfirmTeamName(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmTeamName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  disabled={confirmTeamName !== teamToDelete?.name}
                  onClick={() => handleDeleteTeam(teamToDelete.id)}
                >
                  Yes, Delete Team
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

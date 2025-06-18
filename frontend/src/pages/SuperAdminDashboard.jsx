import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function SuperAdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTeam, setNewTeam] = useState({ name: "", sport: "" });
  const [editTeam, setEditTeam] = useState({ id: null, name: "", sport: "" });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newAdminStatus, setNewAdminStatus] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      const res = await axiosInstance.get("/admin/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/admin/users");
      setUsers(res.data);
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

  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await axiosInstance.delete(`/admin/teams/${id}`);
      fetchTeams();
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  return (
    <div className="container mt-4 mb-5">
      <h2>👑 Superadmin Dashboard</h2>

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
              <input
                type="text"
                className="form-control"
                placeholder="Sport"
                value={newTeam.sport}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, sport: e.target.value })
                }
                required
              />
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-success w-100">
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
                Admin: {team.admin || "Not Assigned"}
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
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleDeleteTeam(team.id)}
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
                <input
                  type="text"
                  className="form-control"
                  placeholder="Sport"
                  value={editTeam.sport}
                  onChange={(e) =>
                    setEditTeam({ ...editTeam, sport: e.target.value })
                  }
                  required
                />
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

      {/* User List */}
      <div className="mt-5">
        <h4>👥 All Users</h4>
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.first_name} {user.last_name}
                </td>
                <td>{user.role || "None"}</td>
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
                      fetchUsers();
                    } catch (error) {
                      console.error("Failed to toggle admin:", error);
                      alert("Failed to update admin status.");
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
    </div>
  );
}

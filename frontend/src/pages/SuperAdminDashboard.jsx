import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function SuperAdminDashboard() {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    const res = await axiosInstance.get("/admin/teams");
    setTeams(res.data);
  };

  const fetchUsers = async () => {
    const res = await axiosInstance.get("/admin/users");
    setUsers(res.data);
  };

  return (
    <div className="container mt-4">
      <h2>👑 Superadmin Dashboard</h2>

      <div className="mt-4">
        <h4>🏟️ Teams</h4>
        <ul className="list-group">
          {teams.map((team) => (
            <li
              key={team.id}
              className="list-group-item d-flex justify-content-between"
            >
              <span>{team.name}</span>
              <span>Admin: {team.admin_name || "Not Assigned"}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
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
                <td>{user.is_admin ? "✅" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

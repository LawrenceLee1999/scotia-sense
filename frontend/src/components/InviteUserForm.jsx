import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import PropTypes from "prop-types";

export default function InviteUserForm({
  roles = ["clinician", "coach", "admin"],
  fixedTeamId = null,
}) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [inviteLink, setInviteLink] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axiosInstance.get("/auth/teams");
        setTeams(res.data);
      } catch (error) {
        console.error("Failed to load teams", error);
      }
    };
    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInviteLink(null);
    setError(null);

    try {
      const res = await axiosInstance.post("/invite/inviteUser", {
        email,
        phone_number: phone,
        // 'admin' is a display value for team admin, actual DB role is null
        invite_role: inviteRole === "admin" ? null : inviteRole,
        team_id: fixedTeamId || teamId,
      });

      setInviteLink(res.data.inviteLink);
      setEmail("");
      setPhone("");
      setInviteRole("");
      setTeamId("");
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to send invite.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card my-4">
      <div className="card-body">
        <h5 className="card-title">📨 Invite User</h5>
        <form onSubmit={handleSubmit} className="row g-2">
          <div className="col-md-4">
            <input
              type="email"
              className="form-control"
              placeholder="Email (required)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="col-md-4">
            <input
              type="tel"
              className="form-control"
              placeholder="Phone (+44...) optional"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              pattern="^\+\d{10,15}$"
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              required
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "admin"
                    ? "Team Admin"
                    : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            {fixedTeamId ? (
              <input type="hidden" value={fixedTeamId} />
            ) : (
              <select
                className="form-select"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                required
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="col-md-12">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>

        {inviteLink && (
          <div className="alert alert-success mt-3">
            Invite link generated: <a href={inviteLink}>{inviteLink}</a>
          </div>
        )}
        {error && <div className="alert alert-danger mt-3">{error}</div>}
      </div>
    </div>
  );
}

InviteUserForm.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string).isRequired,
  fixedTeamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

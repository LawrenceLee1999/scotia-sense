import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import InviteUserForm from "./InviteUserForm";

export default function TeamAdminPanel({ teamId }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axiosInstance.get(`/auth/teams/${teamId}`);
        setTeam(res.data);
      } catch (err) {
        console.error("Failed to load team details", err);
      }
    };

    const fetchMembers = async () => {
      try {
        const res = await axiosInstance.get(`/auth/teams/${teamId}/members`);
        setMembers(res.data);
      } catch (err) {
        console.error("Failed to load team members", err);
      }
    };

    const fetchAll = async () => {
      await fetchTeam();
      await fetchMembers();
      setLoading(false);
    };

    if (teamId) {
      fetchAll();
    }
  }, [teamId]);

  if (!teamId) return null;
  if (loading) return <p>Loading team admin panel...</p>;

  return (
    <div className="accordion mt-4" id="teamAdminAccordion">
      <div className="accordion-item border rounded shadow-sm">
        <h2 className="accordion-header" id="headingAdmin">
          <button
            className="accordion-button collapsed fw-bold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#collapseAdmin"
            aria-expanded="false"
            aria-controls="collapseAdmin"
          >
            🛠️ Team Admin Panel
          </button>
        </h2>
        <div
          id="collapseAdmin"
          className="accordion-collapse collapse"
          aria-labelledby="headingAdmin"
          data-bs-parent="#teamAdminAccordion"
        >
          <div className="accordion-body">
            <div className="mb-4 p-3 border rounded bg-light">
              <h5 className="mb-2">📛 Team Details</h5>
              <p className="mb-0">
                <strong>Name:</strong> {team.name}
              </p>
              <p className="mb-0">
                <strong>Sport:</strong> {team.sport}
              </p>
            </div>

            <div className="mb-4">
              <h5 className="mb-2">📨 Invite a New User</h5>
              <InviteUserForm
                roles={["coach", "clinician", "athlete"]}
                fixedTeamId={teamId}
              />
            </div>

            <div>
              <h5 className="mt-4 mb-3">👥 Current Team Members</h5>
              {members.length === 0 ? (
                <p className="text-muted">No team members found.</p>
              ) : (
                <ul className="list-group">
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <span>
                        {member.first_name} {member.last_name} —{" "}
                        {member.role
                          ? member.role.charAt(0).toUpperCase() +
                            member.role.slice(1)
                          : "Team Admin"}
                      </span>
                      {member.is_admin && (
                        <span className="badge bg-primary">Admin</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

TeamAdminPanel.propTypes = {
  teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

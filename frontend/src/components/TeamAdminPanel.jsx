import PropTypes from "prop-types";
import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import InviteUserForm from "./InviteUserForm";
import RoleChangeModal from "./RoleChangeModal";

export default function TeamAdminPanel({ teamId }) {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToRemove, setUserToRemove] = useState(null);
  const [showRoleConfirmModal, setShowRoleConfirmModal] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/auth/teams/${teamId}`);
      setTeam(res.data);
    } catch (err) {
      console.error("Failed to load team details", err);
    }
  }, [teamId]);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await axiosInstance.get(`/auth/teams/${teamId}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error("Failed to load team members", err);
    }
  }, [teamId]);

  useEffect(() => {
    const fetchAll = async () => {
      await fetchTeam();
      await fetchMembers();
      setLoading(false);
    };

    if (teamId) {
      fetchAll();
    }
  }, [teamId, fetchTeam, fetchMembers]);

  const confirmRemoveUser = (user) => {
    setUserToRemove(user);
    setShowConfirmModal(true);
  };

  const handleRemoveConfirmed = async () => {
    try {
      await axiosInstance.put(
        `/admin/users/${userToRemove.id}/remove-from-team`
      );
      setShowConfirmModal(false);
      setUserToRemove(null);
      fetchMembers();
    } catch (err) {
      console.error("Failed to remove user from team:", err);
    }
  };

  const openRoleModal = (user) => {
    setUserToUpdate(user);
    setShowRoleConfirmModal(true);
  };

  if (!teamId) return null;
  if (loading) return <p>Loading team admin panel...</p>;

  return (
    <div className="accordion my-4" id="teamAdminAccordion">
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
                      <div className="flex-grow-1">
                        <div>
                          <strong>
                            {member.first_name} {member.last_name}
                          </strong>{" "}
                          —{" "}
                          {member.role
                            ? member.role.charAt(0).toUpperCase() +
                              member.role.slice(1)
                            : "Team Admin"}
                        </div>
                        {member.is_admin && (
                          <span className="badge bg-primary mt-1">Admin</span>
                        )}
                      </div>

                      <div className="d-flex align-items-center gap-2">
                        {!(
                          member.is_admin &&
                          member.role === null &&
                          member.team_id
                        ) && (
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openRoleModal(member)}
                          >
                            Change Role
                          </button>
                        )}
                        {!(
                          member.is_admin &&
                          member.role === null &&
                          member.team_id
                        ) && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => confirmRemoveUser(member)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {showConfirmModal && userToRemove && (
        <div
          className="modal d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Removal</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirmModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                Are you sure you want to remove{" "}
                <strong>
                  {userToRemove.first_name} {userToRemove.last_name}
                </strong>{" "}
                from the team?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleRemoveConfirmed}
                >
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showRoleConfirmModal && userToUpdate && (
        <RoleChangeModal
          user={userToUpdate}
          onClose={() => setShowRoleConfirmModal(false)}
          onSuccess={fetchMembers}
        />
      )}
    </div>
  );
}

TeamAdminPanel.propTypes = {
  teamId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

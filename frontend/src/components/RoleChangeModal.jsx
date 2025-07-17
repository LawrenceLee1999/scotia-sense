import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";

export default function RoleChangeModal({ user, onClose, onSuccess }) {
  const { teamId } = useAuth();
  const [newRole, setNewRole] = useState(user.role || "");
  const [formData, setFormData] = useState({
    experience: "",
    specialisation: "",
    contact_info: "",
    gender: "",
    position: "",
    date_of_birth: "",
  });
  const [error, setError] = useState(null);
  const [clinicians, setClinicians] = useState([]);
  const [coaches, setCoaches] = useState([]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.put(`/admin/users/${user.id}/role`, {
        role: newRole || null,
        ...formData,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Role update failed:", err);
      setError(err.response?.data?.message || "Failed to update role.");
    }
  };

  useEffect(() => {
    const fetchCliniciansAndCoaches = async () => {
      try {
        const res = await axiosInstance.get("/auth/clinicians-coaches");
        setClinicians(res.data.clinicians);
        setCoaches(res.data.coaches);
      } catch (err) {
        console.error("Failed to load clinicians/coaches", err);
      }
    };

    fetchCliniciansAndCoaches();
  }, []);

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Update Role for {user.first_name} {user.last_name}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            <label className="form-label">Select New Role</label>
            <select
              className="form-select mb-3"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            >
              <option value="" disabled>
                Team Admin
              </option>
              <option value="coach">Coach</option>
              <option value="clinician">Clinician</option>
              <option value="athlete">Athlete</option>
            </select>

            {newRole === "coach" && (
              <div>
                <label className="form-label">Experience</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>
            )}

            {newRole === "clinician" && (
              <>
                <label className="form-label">Specialisation</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={formData.specialisation}
                  onChange={(e) =>
                    handleChange("specialisation", e.target.value)
                  }
                />
                <label className="form-label">Contact Info</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contact_info}
                  onChange={(e) => handleChange("contact_info", e.target.value)}
                />
              </>
            )}

            {newRole === "athlete" && (
              <>
                <label className="form-label">Gender</label>
                <select
                  className="form-select mb-2"
                  value={formData.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <label className="form-label">Position</label>
                <select
                  name="position"
                  className="form-control mb-2"
                  onChange={(e) => handleChange("position", e.target.value)}
                  value={formData.position}
                  required
                >
                  <option value="">Select a position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  className="form-control mb-2"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    handleChange("date_of_birth", e.target.value)
                  }
                />
                <div className="mb-3">
                  <label className="form-label">Clinician</label>
                  <select
                    className="form-select"
                    value={formData.clinician_user_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        clinician_user_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a clinician</option>
                    {clinicians
                      .filter(
                        (c) =>
                          String(c.team_id) === String(teamId) &&
                          c.user_id !== user.id
                      )
                      .map((clinician) => (
                        <option
                          key={clinician.user_id}
                          value={clinician.user_id}
                        >
                          {clinician.first_name} {clinician.last_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Coach</label>
                  <select
                    className="form-select"
                    value={formData.coach_user_id || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        coach_user_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select a coach</option>
                    {coaches
                      .filter(
                        (c) =>
                          String(c.team_id) === String(teamId) &&
                          c.user_id !== user.id
                      )
                      .map((coach) => (
                        <option key={coach.user_id} value={coach.user_id}>
                          {coach.first_name} {coach.last_name}
                        </option>
                      ))}
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              Update Role
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

RoleChangeModal.propTypes = {
  user: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};

import { useRef, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";
import zxcvbn from "zxcvbn";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    team: "",
    sport: "",
    gender: "",
    position: "",
    date_of_birth: "",
    clinician_user_id: "",
    coach_user_id: "",
    specialisation: "", // for clinicians
    contact_info: "", // for clinicians
    experience: "", // for coaches
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState(null);
  const [userDataMessage, setUserDataMessage] = useState(null);
  const passwordModalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUserData = async () => {
      try {
        const res = await axiosInstance.get("/user/profile");
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchUserData();
  }, [isAuthenticated]);

  useEffect(() => {
    const modalElement = passwordModalRef.current;

    if (modalElement) {
      const handleModalReset = () => {
        setPasswordMessage(null);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
      };

      modalElement.addEventListener("shown.bs.modal", handleModalReset);
      modalElement.addEventListener("hidden.bs.modal", handleModalReset);

      return () => {
        modalElement.removeEventListener("shown.bs.modal", handleModalReset);
        modalElement.removeEventListener("hidden.bs.modal", handleModalReset);
      };
    }
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name in passwordData) {
      setPasswordData({ ...passwordData, [name]: value });

      if (name === "newPassword") {
        const strengthScore = zxcvbn(value).score;
        setPasswordStrength(strengthScore);
      }
    } else {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setUserDataMessage(null);

    try {
      await axiosInstance.put("/user/update-user-data", userData);
      setUserDataMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      setUserDataMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Error updating profile. Please try again.",
      });
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setPasswordMessage(null);

    if (passwordStrength < 2) {
      setPasswordMessage({
        type: "error",
        text: "Password is too weak. Please use a stronger password.",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordMessage({
        type: "error",
        text: "New password and confirmation password do not match.",
      });
      return;
    }

    try {
      await axiosInstance.put("/user/change-password", {
        currentPassword: passwordData.currentPassword,
        password: passwordData.newPassword,
      });
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    } catch (error) {
      setPasswordMessage({
        type: "error",
        text: error.response?.data?.message || "Error updating password.",
      });
    }
  }

  function renderRoleSpecificFields() {
    if (!userData.role && userData.is_admin) {
      return (
        <div className="alert alert-info">
          Platform Superadmin – No additional fields to display.
        </div>
      );
    }

    if (userData.role === "athlete") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Sport</label>
            <select
              name="sport"
              className="form-control"
              value={userData.sport}
              onChange={handleChange}
              required
            >
              <option value="">Select a sport</option>
              <option value="Football">Football</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <select
              name="gender"
              className="form-control"
              value={userData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Position</label>
            <select
              name="position"
              className="form-control"
              onChange={handleChange}
              value={userData.position}
              required
            >
              <option value="">Select a position</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              className="form-control"
              value={userData.date_of_birth || " "}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    }

    if (userData.role === "clinician") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Specialisation</label>
            <input
              type="text"
              name="specialisation"
              className="form-control"
              value={userData.specialisation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contact Info</label>
            <input
              type="email"
              name="contact_info"
              className="form-control"
              value={userData.contact_info}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    }

    if (userData.role === "coach") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Experience</label>
            <input
              type="text"
              name="experience"
              className="form-control"
              value={userData.experience}
              onChange={handleChange}
              required
            />
          </div>
        </>
      );
    }

    return null;
  }

  return (
    <div className="container mt-5 mb-5">
      <h2>User Profile</h2>

      {userDataMessage && (
        <div
          className={`alert ${
            userDataMessage.type === "error" ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {userDataMessage.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            name="first_name"
            className="form-control"
            value={userData.first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            name="last_name"
            className="form-control"
            value={userData.last_name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Phone Number</label>
          <input
            type="tel"
            name="phone_number"
            className="form-control"
            value={userData.phone_number || ""}
            onChange={handleChange}
            pattern="^\+\d{10,15}$"
            title="Please enter a valid phone number with country code and starts with '+' (e.g. +441234567890)"
            required
          />
        </div>

        {/* Password fields */}
        <button
          type="button"
          className="btn btn-outline-secondary mb-3"
          data-bs-toggle="modal"
          data-bs-target="#changePasswordModal"
        >
          Change Password
        </button>

        {/* Render role-specific fields */}
        {renderRoleSpecificFields()}

        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>

      <div
        className="modal fade"
        id="changePasswordModal"
        tabIndex="-1"
        aria-labelledby="changePasswordModalLabel"
        aria-hidden="true"
        ref={passwordModalRef}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="changePasswordModalLabel">
                Change Password
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {passwordMessage && (
                <div
                  className={`alert ${
                    passwordMessage.type === "error"
                      ? "alert-danger"
                      : "alert-success"
                  }`}
                  role="alert"
                >
                  {passwordMessage.text}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <div className="input-group">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      name="currentPassword"
                      className="form-control"
                      value={passwordData.currentPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    className="form-control"
                    value={passwordData.newPassword}
                    onChange={handleChange}
                  />
                  <div className="strength-meter">
                    <div className={`bar strength-${passwordStrength}`}></div>
                  </div>
                  <p>
                    Strength:{" "}
                    {
                      ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"][
                        passwordStrength
                      ]
                    }
                  </p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    className="form-control"
                    value={passwordData.confirmNewPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    id="closePasswordModal"
                  >
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

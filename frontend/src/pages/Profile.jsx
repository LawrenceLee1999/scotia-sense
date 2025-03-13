import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../hooks/useAuth";

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

  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const res = await axiosInstance.get("/user/profile");
          setUserData(res.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      fetchUserData();
    }
  }, [isAuthenticated]);

  function handleChange(event) {
    const { name, value } = event.target;
    if (name in passwordData) {
      setPasswordData({ ...passwordData, [name]: value });
    } else {
      setUserData({
        ...userData,
        [name]: value,
      });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);

    if (
      passwordData.newPassword &&
      passwordData.newPassword !== passwordData.confirmNewPassword
    ) {
      setMessage({
        type: "error",
        text: "New password and confirmation password do not match.",
      });
      return;
    }

    const updatedData = { ...userData };

    if (passwordData.newPassword) {
      updatedData.password = passwordData.newPassword;
      updatedData.currentPassword = passwordData.currentPassword || undefined;
    }

    try {
      await axiosInstance.put("/user/update-user", updatedData);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setMessage({ type: "error", text: error.response.data.message });
      } else {
        setMessage({
          type: "error",
          text: "Error updating profile. Please try again.",
        });
      }
    }
  }
  function renderRoleSpecificFields() {
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
              <option value="Rugby">Rugby</option>
              <option value="Cricket">Cricket</option>
              <option value="Tennis">Tennis</option>
              <option value="Hockey">Hockey</option>
              <option value="Other">Other</option>
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
            <input
              type="text"
              name="position"
              className="form-control"
              value={userData.position}
              onChange={handleChange}
              required
            />
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

      {message && (
        <div
          className={`alert ${
            message.type === "error" ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {message.text}
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

        {/* Password fields */}
        <div className="mb-3">
          <label className="form-label">
            Current Password (only if changing)
          </label>
          <input
            type="password"
            name="currentPassword"
            className="form-control"
            value={passwordData.currentPassword}
            onChange={handleChange}
          />
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
        <div className="mb-3">
          <label className="form-label">Team</label>
          <input
            type="text"
            name="team"
            className="form-control"
            value={userData.team}
            onChange={handleChange}
            required
          />
        </div>

        {/* Render role-specific fields */}
        {renderRoleSpecificFields()}

        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
    </div>
  );
}

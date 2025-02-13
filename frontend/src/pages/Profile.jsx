import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
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

  useEffect(() => {
    if (isAuthenticated) {
      const fetchUserData = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("http://localhost:3000/user/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
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
    if (
      name === "currentPassword" ||
      name === "newPassword" ||
      name === "confirmNewPassword"
    ) {
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

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const updatedData = { ...userData };
      if (passwordData.newPassword) {
        updatedData.password = passwordData.newPassword;
      }
      const res = await axios.put(
        "http://localhost:3000/user/update-user",
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Profile updated successfully", res.data);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }
  function renderRoleSpecificFields() {
    if (userData.role === "athlete") {
      return (
        <>
          <div className="mb-3">
            <label className="form-label">Sport</label>
            <input
              type="text"
              name="sport"
              className="form-control"
              value={userData.sport}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Gender</label>
            <input
              type="text"
              name="gender"
              className="form-control"
              value={userData.gender}
              onChange={handleChange}
              required
            />
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
              value={userData.date_of_birth}
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
    <div className="container mt-5">
      <h2>User Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
            value={userData.name}
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
          <label className="form-label">Current Password</label>
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

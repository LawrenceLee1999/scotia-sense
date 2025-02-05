import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "athlete", // Default to "athlete"
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

  const [clinicians, setClinicians] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(
          "http://localhost:3000/auth/clinicians-coaches"
        );
        setClinicians(res.data.clinicians);
        setCoaches(res.data.coaches);
      } catch (error) {
        console.error("Failed to fetch clinicians and coaches", error);
      }
    }
    fetchData();
  }, []);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("Submit clicked!");

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/register",
        formData
      );
      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        console.error("Registration failed: ", error.response.message);
      } else {
        console.error("Error: ", error.message);
      }
    }
  }

  return (
    <div className="container mt-5">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input
            type="text"
            name="name"
            className="form-control"
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
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Team</label>
          <input
            type="text"
            name="team"
            className="form-control"
            onChange={handleChange}
            required
          />
        </div>

        {/* Additional fields for role-specific data */}
        <div className="mb-3">
          <label className="form-label">Role</label>
          <select
            name="role"
            className="form-control"
            onChange={handleChange}
            value={formData.role}
          >
            <option value="athlete">Athlete</option>
            <option value="clinician">Clinician</option>
            <option value="coach">Coach</option>
          </select>
        </div>

        {/* Athlete Specific Fields */}
        {formData.role === "athlete" && (
          <>
            <div className="mb-3">
              <label className="form-label">Sport</label>
              <input
                type="text"
                name="sport"
                className="form-control"
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
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Clinician</label>
              <select
                name="clinician_user_id"
                className="form-control"
                onChange={handleChange}
                required
              >
                <option value="">Select a clinician</option>
                {clinicians.map((clinician) => (
                  <option key={clinician.user_id} value={clinician.user_id}>
                    {clinician.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Coach</label>
              <select
                name="coach_user_id"
                className="form-control"
                onChange={handleChange}
                required
              >
                <option value="">Select a coach</option>
                {coaches.map((coach) => (
                  <option key={coach.user_id} value={coach.user_id}>
                    {coach.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Clinician Specific Fields */}
        {formData.role === "clinician" && (
          <>
            <div className="mb-3">
              <label className="form-label">Specialisation</label>
              <input
                type="text"
                name="specialisation"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Info</label>
              <input
                type="text"
                name="contact_info"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        {/* Coach Specific Fields */}
        {formData.role === "coach" && (
          <>
            <div className="mb-3">
              <label className="form-label">Experience</label>
              <input
                type="text"
                name="experience"
                className="form-control"
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
    </div>
  );
}

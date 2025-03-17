import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
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
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(function () {
    async function fetchData() {
      try {
        const res = await axiosInstance.get("/auth/clinicians-coaches");
        setClinicians(res.data.clinicians);
        setCoaches(res.data.coaches);
      } catch (error) {
        console.error("Failed to fetch clinicians and coaches", error);
        setErrorMessage("Failed to load clinicians and coaches.");
      }
    }
    fetchData();
  }, []);

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const res = await axiosInstance.post("/auth/register", formData);
      console.log("Registration successful:", res.data);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response?.data?.message || "Registration failed");
      } else {
        setErrorMessage("An error occurred");
      }
    }
  }

  return (
    <div className="container mt-5 mb-3">
      {errorMessage && (
        <div className="alert alert-danger" role="alert">
          {errorMessage}
        </div>
      )}
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <label className="form-label">First Name</label>
            <input
              type="text"
              name="first_name"
              className="form-control"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              name="last_name"
              className="form-control"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
            <label className="form-label">Team</label>
            <input
              type="text"
              name="team"
              className="form-control"
              value={formData.team}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-6">
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
              <div className="col-md-6">
                <label className="form-label">Sport</label>
                <select
                  name="sport"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.sport}
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
              <div className="col-md-6">
                <label className="form-label">Gender</label>
                <select
                  type="text"
                  name="gender"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.gender}
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Position</label>
                <input
                  type="text"
                  name="position"
                  className="form-control"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
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
                      {String(clinician.first_name)}{" "}
                      {String(clinician.last_name)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
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
                      {String(coach.first_name)} {String(coach.last_name)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Clinician Specific Fields */}
          {formData.role === "clinician" && (
            <>
              <div className="col-md-6">
                <label className="form-label">Specialisation</label>
                <input
                  type="text"
                  name="specialisation"
                  className="form-control"
                  value={formData.specialisation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Contact Info</label>
                <input
                  type="text"
                  name="contact_info"
                  className="form-control"
                  value={formData.contact_info}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          {/* Coach Specific Fields */}
          {formData.role === "coach" && (
            <>
              <div className="col-md-6">
                <label className="form-label">Experience</label>
                <input
                  type="text"
                  name="experience"
                  className="form-control"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
        </div>

        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>
    </div>
  );
}

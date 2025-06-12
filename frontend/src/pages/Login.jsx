import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login, role, isAdmin, teamId } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrorMessage(error);
    }
  }

  useEffect(() => {
    if (role === "coach") {
      navigate("/coach-dashboard");
    } else if (role === "athlete") {
      navigate("/athlete-dashboard");
    } else if (role === "clinician") {
      navigate("/clinician-dashboard");
    } else if (isAdmin && !role && !teamId) {
      navigate("/superadmin-dashboard");
    }
  }, [role, isAdmin, teamId, navigate]);

  return (
    <div className="container mt-5">
      <h2>Login</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            name="email"
            className="form-control"
            id="email"
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            name="password"
            className="form-control"
            id="password"
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

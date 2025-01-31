import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("Login button clicked");

    try {
      const res = await axios.post(
        "http://localhost:3000/auth/login",
        formData
      );

      console.log("Login successful:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      if (error.response) {
        console.error("Login failed:", error.response.data);
        setErrorMessage(error.response.data.message);
      } else {
        console.error("Error:", error.message);
        setErrorMessage("An unexpected error occured");
      }
    }
  }
  return (
    <div className="container mt-5">
      <h1>Login</h1>
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

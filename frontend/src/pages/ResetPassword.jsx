import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import zxcvbn from "zxcvbn";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      return setError("Passwords do not match.");
    }

    try {
      if (passwordStrength < 2) {
        setMessage("Password is too weak. Please use a stronger password.");
        return;
      }
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword: password,
      });
      setMessage("Password reset successful. You can now log in.");
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed.");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Reset Password</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <div className="input-group">
            <input
              type={passwordVisible ? "text" : "password"}
              className="form-control"
              required
              value={password}
              onChange={(e) => {
                const pwd = e.target.value;
                setPassword(pwd);
                const result = zxcvbn(pwd);
                setPasswordStrength(result.score);
              }}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>

          <div className="strength-meter mt-3">
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
          <label>Confirm Password</label>
          <input
            type="password"
            className="form-control"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" disabled={passwordStrength < 2}>
          Reset Password
        </button>
      </form>
    </div>
  );
}

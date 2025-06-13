import { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import PropTypes from "prop-types";
import axiosInstance from "../api/axiosInstance";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamId, setTeamId] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axiosInstance.get("/auth/check", {
          withCredentials: true,
        });

        setIsAuthenticated(res.data.authenticated || false);
        setRole(res.data.role || null);
        setIsAdmin(res.data.is_admin || false);
        setTeamId(res.data.team_id);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  async function login(email, password) {
    try {
      const res = await axiosInstance.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      setRole(res.data.role);
      setIsAdmin(res.data.is_admin);
      setTeamId(res.data.team_id);
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  }

  async function logout() {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      setRole(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, role, isAdmin, teamId, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

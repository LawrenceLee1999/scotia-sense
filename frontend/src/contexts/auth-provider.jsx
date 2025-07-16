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
  const [isSuperadmin, setIsSuperadmin] = useState(false);

  const checkAuth = async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true,
      });

      setIsAuthenticated(res.data.authenticated || false);
      setRole(res.data.role || null);
      setIsAdmin(res.data.is_admin || false);
      setTeamId(res.data.team_id);
      setIsSuperadmin(res.data.is_superadmin || false);
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setRole(null);
      setIsAdmin(false);
      setTeamId(null);
      setIsSuperadmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(email, password) {
    try {
      await axiosInstance.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );

      await checkAuth();
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
      setTeamId(null);
      setIsSuperadmin(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        role,
        isAdmin,
        isSuperadmin,
        teamId,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

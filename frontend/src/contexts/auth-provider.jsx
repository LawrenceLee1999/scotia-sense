import { useState, useEffect } from "react";
import { AuthContext } from "./auth-context";
import PropTypes from "prop-types";
import axiosInstance from "../api/axiosInstance";

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await axiosInstance.get("/auth/check", {
          withCredentials: true,
        });

        console.log(res.data);

        setIsAuthenticated(res.data.authenticated || false);
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
      await axiosInstance.post(
        "/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setIsAuthenticated(true);
    } catch (error) {
      throw error.response?.data?.message || "Login failed";
    }
  }

  async function logout() {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

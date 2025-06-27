import { useAuth } from "../hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, role, isAdmin, teamId, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;

  // Handle unauthenticated access
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle revoked team admin (is_admin = false but no role)
  if (!isAdmin && !role && teamId) {
    return <Navigate to="/unauthorised" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

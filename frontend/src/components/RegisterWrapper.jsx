import { Navigate, useLocation } from "react-router-dom";
import Register from "../pages/Register";

export default function RegisterWrappper() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const token = params.get("invite");

  if (!token) {
    return <Navigate to="/unauthorised" />;
  }

  return <Register />;
}

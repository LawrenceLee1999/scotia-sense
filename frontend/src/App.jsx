import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import AthleteDashboard from "./pages/AthleteDashboard";
import CoachDashboard from "./pages/CoachDashboard";
import ClinicianDashboard from "./pages/ClinicianDashboard";
import Footer from "./components/Footer";
import "./styles/custom.scss";
import "./styles/App.css";
import "./styles/index.css";

export default function App() {
  return (
    <Router>
      <div className="layout-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/athlete-dashboard"
              element={
                <ProtectedRoute>
                  <AthleteDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach-dashboard"
              element={
                <ProtectedRoute>
                  <CoachDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinician-dashboard"
              element={
                <ProtectedRoute>
                  <ClinicianDashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

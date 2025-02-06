import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/custom.scss";
import "./styles/App.css";
import "./styles/index.css";
import BaselineScoreInput from "./pages/BaselineScoreInput";
import TestScoreInput from "./pages/TestScoreInput";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Navbar />
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
          path="/baseline-score"
          element={
            <ProtectedRoute>
              <BaselineScoreInput />
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-score"
          element={
            <ProtectedRoute>
              <TestScoreInput />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="navbar-wrapper border-bottom">
      <div className="container">
        <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3">
          <div className="col-md-3 mb-2 mb-md-0">
            <Link
              to="/"
              className="d-inline-flex link-body-emphasis text-decoration-none"
            >
              <img
                src="/images/scotia-biotech.png"
                className="bi"
                height="60"
                role="img"
                alt="Scotia Biotech logo"
              />
            </Link>
          </div>

          <ul className="nav col-12 col-md-auto mb-2 justify-content-center mb-md-0">
            <li>
              <Link className="nav-link px-2 link-secondary" to="/">
                Home
              </Link>
            </li>

            {isAuthenticated && (
              <>
                <li>
                  <Link className="nav-link px-2" to="/dashboard">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link className="nav-link px-2" to="/profile">
                    Profile
                  </Link>
                </li>
              </>
            )}
          </ul>

          {!isAuthenticated ? (
            <div className="col-md-3 text-end">
              <Link to="/login">
                <button type="button" className="btn btn-outline-primary me-2">
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button type="button" className="btn btn-primary">
                  Sign-up
                </button>
              </Link>
            </div>
          ) : (
            <div className="col-md-3 text-end">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </header>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <div className="container">
      <header className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between py-3 mb-4 border-bottom">
        <div className="col-md-3 mb-2 mb-md-0">
          <Link
            to="/"
            className="d-inline-flex link-body-emphasis text-decoration-none"
          >
            <img
              src="/images/Group 700.png"
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
          <li>
            <Link className="nav-link px-2" to="/profile">
              Profile
            </Link>
          </li>
          <li>
            <Link className="nav-link px-2">About</Link>
          </li>
        </ul>

        <div className="col-md-3 text-end">
          <Link to="/login">
            <button type="button" className="btn btn-outline-primary me-2">
              Login
            </button>
          </Link>

          <button type="button" className="btn btn-primary">
            Sign-up
          </button>
        </div>
      </header>
    </div>
  );
}

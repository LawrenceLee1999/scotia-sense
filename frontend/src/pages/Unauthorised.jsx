import { Link } from "react-router-dom";

export default function Unauthorised() {
  return (
    <div className="container text-center mt-5">
      <h1 className="display-4">🚫 Access Denied</h1>
      <p className="lead">You are not authorised to view this page.</p>
      <p>
        If you think this is a mistake, please contact your team administrator
        or check your login permissions.
      </p>

      <Link to="/" className="btn btn-primary mt-3">
        Go to Homepage
      </Link>
    </div>
  );
}

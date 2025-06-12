import jwt from "jsonwebtoken";

export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token && req.path === "/check") {
    return res.status(200).json({ authenticated: false });
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorised" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireTeamAdmin = (req, res, next) => {
  if (req.user && req.user.is_admin && req.user.team_id !== null) {
    return next();
  }

  return res.status(403).json({ message: "Team admin access required." });
};

export const requireSuperAdmin = (req, res, next) => {
  if (
    req.user &&
    req.user.is_admin &&
    req.user.role === null &&
    req.user.team_id === null
  ) {
    return next();
  }

  return res.status(403).json({ message: "Superadmin access required." });
};

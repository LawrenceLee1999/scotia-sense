import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      is_admin: user.is_admin,
      team_id: user.team_id || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

export const register = async (req, res) => {
  const {
    first_name,
    last_name,
    role,
    password,
    specialisation,
    contact_info,
    experience,
    gender,
    position,
    date_of_birth,
    coach_user_id,
    phone_number: bodyPhone,
    invite_token,
  } = req.body;

  if (!invite_token) {
    return res.status(400).json({ message: "Invite token is required" });
  }

  const inviteResult = await pool.query(
    "SELECT * FROM invites WHERE token = $1 AND used = false",
    [invite_token]
  );

  if (inviteResult.rows.length === 0) {
    return res.status(400).json({ message: "Invalid or expired invite token" });
  }

  const invite = inviteResult.rows[0];
  const resolvedPhone = invite.phone_number || bodyPhone || null;

  if (resolvedPhone && !/^\+\d{10,15}$/.test(resolvedPhone)) {
    return res.status(400).json({
      message:
        "Invalid phone number format. Must start with '+' and country code.",
    });
  }

  if (!first_name || !last_name || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["athlete", "clinician", "coach", null].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  try {
    const role = invite.invite_role;
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [invite.email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isAdmin = req.body.is_admin || false;

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, phone_number, email, password, role, is_admin, team_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        first_name,
        last_name,
        resolvedPhone,
        invite.email,
        hashedPassword,
        role,
        isAdmin,
        invite.team_id,
      ]
    );

    const user = result.rows[0];

    if (role === "clinician") {
      await pool.query(
        "INSERT INTO clinicians (user_id, specialisation, contact_info) VALUES ($1, $2, $3)",
        [user.id, specialisation, contact_info]
      );
    } else if (role === "coach") {
      await pool.query(
        "INSERT INTO coaches (user_id, experience) VALUES ($1, $2)",
        [user.id, experience]
      );
    } else if (role === "athlete") {
      await pool.query(
        `INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, gender, position, date_of_birth)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          user.id,
          invite.invited_by,
          coach_user_id,
          gender,
          position,
          date_of_birth,
        ]
      );
    } else if (!role && isAdmin) {
      // ✅ This is a valid admin-only account
      // No further action needed
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    await pool.query("UPDATE invites SET used = true WHERE token = $1", [
      invite_token,
    ]);

    delete user.password;
    res.status(201).json({ user });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Email not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      role: user.role,
      is_admin: user.is_admin,
      team_id: user.team_id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIdAndName = async (req, res) => {
  try {
    const clinicians = await pool.query(`
      SELECT clinicians.user_id, users.first_name, users.last_name, users.team_id
      FROM clinicians
      INNER JOIN users ON clinicians.user_id = users.id
    `);

    const coaches = await pool.query(`
      SELECT coaches.user_id, users.first_name, users.last_name, users.team_id
      FROM coaches
      INNER JOIN users ON coaches.user_id = users.id
    `);

    res.json({
      clinicians: clinicians.rows,
      coaches: coaches.rows,
    });
  } catch (error) {
    console.error("Error fetching clinician/coach info:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  if (req.user) {
    res.status(200).json({
      authenticated: true,
      role: req.user.role,
      is_admin: req.user.is_admin,
      team_id: req.user.team_id || null,
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const getAllTeams = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name FROM teams ORDER BY name ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching teams:", err);
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

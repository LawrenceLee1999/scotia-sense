import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

export const register = async (req, res) => {
  const {
    first_name,
    last_name,
    phone_number,
    email,
    password,
    role,
    specialisation,
    contact_info,
    team,
    experience,
    sport,
    gender,
    position,
    date_of_birth,
    clinician_user_id,
    coach_user_id,
  } = req.body;

  if (!first_name) {
    return res.status(400).json({ message: "First name is required" });
  }

  if (!last_name) {
    return res.status(400).json({ message: "Last name is required" });
  }

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!phone_number) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!team) {
    return res.status(400).json({ message: "Team is required" });
  }

  if (role === "athlete" && clinician_user_id) {
    const clinicianExists = await pool.query(
      "SELECT * FROM clinicians WHERE user_id = $1",
      [clinician_user_id]
    );
    if (!clinicianExists.rows.length) {
      return res.status(404).json({ message: "Assigned clinician not found" });
    }
  }

  if (role === "athlete" && coach_user_id) {
    const coachExists = await pool.query(
      "SELECT * FROM coaches WHERE user_id = $1",
      [coach_user_id]
    );
    if (!coachExists.rows.length) {
      return res.status(404).json({ message: "Assigned coach not found" });
    }
  }

  if (!["athlete", "clinician", "coach"].includes(role)) {
    return res.status(400).json({ message: "Invalid role provided" });
  }

  try {
    if (role === "athlete" && clinician_user_id) {
      const clinicianExists = await pool.query(
        "SELECT * FROM clinicians WHERE user_id = $1",
        [clinician_user_id]
      );
      if (!clinicianExists.rows.length) {
        return res
          .status(404)
          .json({ message: "Assigned clinician not found" });
      }
    }
    if (role === "athlete" && coach_user_id) {
      const coachExists = await pool.query(
        "SELECT * FROM coaches WHERE user_id = $1",
        [coach_user_id]
      );
      if (!coachExists.rows.length) {
        return res.status(404).json({ message: "Assigned coach not found" });
      }
    }
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO Users(first_name, last_name, phone_number, email, password, role, team) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [first_name, last_name, phone_number, email, hashedPassword, role, team]
    );

    const user = result.rows[0];

    switch (role) {
      case "clinician":
        await pool.query(
          "INSERT INTO clinicians (user_id, specialisation, contact_info) VALUES ($1, $2, $3)",
          [user.id, specialisation, contact_info]
        );
        break;
      case "coach":
        await pool.query(
          "INSERT INTO coaches (user_id, experience) VALUES ($1, $2)",
          [user.id, experience]
        );
        break;
      case "athlete":
        await pool.query(
          "INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, sport, gender, position, date_of_birth) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            user.id,
            clinician_user_id,
            coach_user_id,
            sport,
            gender,
            position,
            date_of_birth,
          ]
        );
        break;

      default:
        return res.status(400).json({ message: "Invalid role specified" });
    }
    delete user.password;

    if (req.body.invite_token) {
      await pool.query(
        "UPDATE clinician_invites SET used = true WHERE token = $1",
        [req.body.invite_token]
      );
    }
    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
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

    res.status(200).json({ message: "Login successful", role: user.role });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIdAndName = async (req, res) => {
  try {
    const clinicians = await pool.query(
      "SELECT user_id, first_name, last_name FROM clinicians INNER JOIN users ON clinicians.user_id = users.id"
    );
    const coaches = await pool.query(
      "SELECT user_id, first_name, last_name FROM coaches INNER JOIN users ON coaches.user_id = users.id"
    );

    res.json({
      clinicians: clinicians.rows,
      coaches: coaches.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  if (req.user) {
    res.status(200).json({ authenticated: true, role: req.user.role });
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

export const getInviteByToken = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      "SELECT email, clinician_user_id, phone_number FROM clinician_invites WHERE token = $1",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invite not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching invite:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
    email,
    password,
    role,
    name,
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

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  if (!team) {
    return res.status(400).json({ message: "Team is required" });
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
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO Users(email, password, role, name, team) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [email, hashedPassword, role, name, team]
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
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);
    delete user.password;
    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

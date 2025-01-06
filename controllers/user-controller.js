import bcrypt from "bcrypt";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const updateUser = async (req, res) => {
  const userId = req.user.id;

  console.log(req.user);

  const {
    email,
    password,
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

  try {
    const userResult = await pool.query("SELECT * FROM users where id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    const updatedFields = [];
    const updateValues = [];

    if (email) {
      updatedFields.push("email = $1");
      updateValues.push(email);
    }
    if (name) {
      updatedFields.push("name = $2");
      updateValues.push(name);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.push("password = $3");
      updateValues.push(hashedPassword);
    }
    if (updatedFields.length > 0) {
      await pool.query(
        `UPDATE users SET ${updatedFields.join(", ")} WHERE id = $4`,
        [...updateValues, userId]
      );
    }
    switch (user.role) {
      case "clinician":
        await pool.query(
          "UPDATE clinicians SET specialisation = $1, contact_info = $2 WHERE user_id = $3",
          [specialisation, contact_info, userId]
        );
        break;
      case "coach":
        await pool.query(
          "UPDATE coaches SET team = $1, experience = $2 WHERE user_id = $3",
          [team, experience, userId]
        );
        break;
      case "athlete":
        await pool.query(
          "UPDATE athletes SET sport = $1, gender = $2, position = $3, date_of_birth = $4 WHERE user_id = $5",
          [sport, gender, position, date_of_birth, userId]
        );

        if (clinician_user_id) {
          const clinicianExists = await pool.query(
            "SELECT * FROM users WHERE id = $1 AND role = 'clinician'",
            [clinician_user_id]
          );
          if (clinicianExists.rows.length === 0) {
            return res.status(404).json({ message: "Clinician not found" });
          }

          await pool.query(
            "UPDATE athletes SET clinician_user_id = $1 WHERE user_id = $2",
            [clinician_user_id, userId]
          );
        }

        if (coach_user_id) {
          const coachExists = await pool.query(
            "SELECT * FROM users WHERE id = $1 AND role = 'coach'",
            [coach_user_id]
          );
          if (coachExists.rows.length === 0) {
            return res.status(404).json({ message: "Coach not found" });
          }

          await pool.query(
            "UPDATE athletes SET coach_user_id = $1 WHERE user_id = $2",
            [coach_user_id, userId]
          );
        }

        break;
      default:
        return res.status(400).json({ message: "Invalid role specified" });
    }

    res.status(200).json({ message: "Update user successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE i = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const user = userResult.rows[0];

    if (user.role !== "athlete") {
      return res
        .status(400)
        .json({ message: "This endpoint is only for athletes" });
    }

    const baselineResult = await pool.query(
      "SELECT * FROM baseline_scores WHERE athlete_user_id = $1",
      [userId]
    );

    const baselineScores = baselineResult.rows[0];
    if (!baselineScores) {
      return res.status(400).json({ message: "Baseline scores not found" });
    }

    // TODO: Fetch test scores and calculate deviation from baseline for graph
  } catch (error) {}
};

export const assignClinicianAndCoach = async (req, res) => {};

import bcrypt from "bcrypt";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const updateUser = async (req, res) => {
  const userId = req.user.id;

  const {
    currentPassword,
    email,
    password,
    name,
    team,
    specialisation,
    contact_info,
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

    if (password && !currentPassword) {
      return res.status(400).json({
        message: "Current password is required to change the password",
      });
    }

    if (password && currentPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }
    }

    const updatedFields = [];
    const updateValues = [];

    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 and id != $2",
        [email, userId]
      );

      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: "Email is already registered" });
      } else {
        updatedFields.push("email = $" + (updateValues.length + 1));
        updateValues.push(email);
      }
    }
    if (name) {
      updatedFields.push("name = $" + (updateValues.length + 1));
      updateValues.push(name);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatedFields.push("password = $" + (updateValues.length + 1));
      updateValues.push(hashedPassword);
    }
    if (team) {
      updatedFields.push("team = $" + (updateValues.length + 1));
      updateValues.push(team);
    }
    if (updatedFields.length > 0) {
      await pool.query(
        `UPDATE users SET ${updatedFields.join(", ")} WHERE id = $${
          updateValues.length + 1
        }`,
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
          "UPDATE coaches SET experience = $1 WHERE user_id = $2",
          [experience, userId]
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
    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [
      userId,
    ]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    let roleSpecificData;
    switch (user.role) {
      case "clinician":
        const clinicianResult = await pool.query(
          "SELECT specialisation, contact_info FROM clinicians where user_id = $1",
          [userId]
        );
        roleSpecificData = clinicianResult.rows[0];
        break;
      case "coach":
        const coachResult = await pool.query(
          "SELECT team, experience FROM coaches where user_id = $1",
          [userId]
        );
        roleSpecificData = coachResult.rows[0];
        break;
      case "athlete":
        const athleteResult = await pool.query(
          "SELECT clinician_user_id, coach_user_id, sport, gender, position, date_of_birth FROM athletes where user_id = $1",
          [userId]
        );
        roleSpecificData = athleteResult.rows[0];

        if (roleSpecificData?.date_of_birth) {
          roleSpecificData.date_of_birth = roleSpecificData.date_of_birth
            .toISOString()
            .split("T")[0];
        }
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified" });
    }

    const profile = { ...user, ...roleSpecificData };

    delete profile.password;

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

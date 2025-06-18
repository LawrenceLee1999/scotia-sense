import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getAllTeamAdmins = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                t.id AS team_id,
                t.name AS team_name,
                t.sport AS team_sport,
                u.id AS admin_id,
                u.first_name,
                u.last_name
            FROM teams t
            LEFT JOIN users u ON u.team_id = t.id AND u.is_admin = true
            `);
    const teams = result.rows.map((row) => ({
      id: row.team_id,
      name: row.team_name,
      sport: row.team_sport,
      admin: row.admin_id ? `${row.first_name} ${row.last_name}` : null,
    }));

    res.json(teams);
  } catch (error) {
    console.error("Error fetching teams:", error);
    res.status(500).json({ message: "Failed to load teams" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.role,
                u.is_admin,
                t.name AS team_name
            FROM users u
            LEFT JOIN teams t ON u.team_id = t.id
            `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to load users" });
  }
};

export const createTeam = async (req, res) => {
  const { name, sport } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO teams (name, sport) VALUES ($1, $2) RETURNING *",
      [name, sport]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create team" });
  }
};

export const updateTeam = async (req, res) => {
  const { id } = req.params;
  const { name, sport } = req.body;

  try {
    await pool.query("UPDATE teams SET name = $1, sport = $2 WHERE id = $3", [
      name,
      sport,
      id,
    ]);
    res.status(200).json({ message: "Team updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update team" });
  }
};

export const deleteTeam = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM teams WHERE id = $1", [id]);
    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete team" });
  }
};

export const toggleAdminStatus = async (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;

  try {
    await pool.query("UPDATE users SET is_admin = $1 WHERE id = $2", [
      is_admin,
      id,
    ]);
    res
      .status(200)
      .json({ message: `User admin status updated to ${is_admin}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update admin status" });
  }
};

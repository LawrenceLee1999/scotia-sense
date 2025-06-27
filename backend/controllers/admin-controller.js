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
    STRING_AGG(u.first_name || ' ' || u.last_name, ', ') AS admins
  FROM teams t
  LEFT JOIN users u ON u.team_id = t.id AND u.is_admin = true
  GROUP BY t.id, t.name, t.sport
`);
    const teams = result.rows.map((row) => ({
      id: row.team_id,
      name: row.team_name,
      sport: row.team_sport,
      admins: row.admins || null,
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
    const userCountResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE team_id = $1",
      [id]
    );

    const userCount = parseInt(userCountResult.rows[0].count, 10);

    if (userCount > 0) {
      return res.status(400).json({
        message: "Cannot delete team. Users are still assigned to this team.",
      });
    }

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
    const userResult = await pool.query(
      "SELECT team_id FROM users WHERE id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

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

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  try {
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [
      role || null,
      userId,
    ]);
    res.status(200).json({ message: "Role updated" });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const removeUserFromTeam = async (req, res) => {
  const { userId } = req.params;

  try {
    await pool.query("UPDATE users SET team_id = null WHERE id = $1", [userId]);
    res.status(200).json({ message: "User removed from team" });
  } catch (error) {
    console.error("Remove user error:", error);
    res.status(500).json({ message: "Failed to remove user" });
  }
};

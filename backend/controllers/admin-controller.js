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
                u.id AS admin_id,
                u.first_name,
                u.last_name
            FROM teams t
            LEFT JOIN users u ON u.team_id = t.id AND u.is_admin = true
            `);
    const teams = result.rows.map((row) => ({
      id: row.team_id,
      name: row.team_name,
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

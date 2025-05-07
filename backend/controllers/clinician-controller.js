import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getAssignedAthletes = async (req, res) => {
  const clinicianId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
         a.user_id, 
         u.first_name, 
         u.last_name,
         COALESCE(i.is_injured, FALSE) AS is_injured,
         i.logged_at
       FROM athletes a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN (
         SELECT DISTINCT ON (athlete_user_id) athlete_user_id, is_injured, logged_at
         FROM injury_logs
         ORDER BY athlete_user_id, logged_at DESC
       ) i ON a.user_id = i.athlete_user_id
       WHERE a.clinician_user_id = $1`,
      [clinicianId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch athletes" });
  }
};

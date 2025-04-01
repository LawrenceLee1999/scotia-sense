import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getCoachAthletesRecovery = async (req, res) => {
  try {
    if (req.user.role !== "coach") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const coachId = req.user.id;

    const query = `
      SELECT 
        a.user_id AS athlete_id,
        u.first_name,
        u.last_name,
        r.stage AS recovery_stage,
        r.updated_at
      FROM athletes a
      JOIN users u ON a.user_id = u.id
      LEFT JOIN (
        SELECT DISTINCT ON (athlete_user_id) athlete_user_id, stage, updated_at
        FROM recovery_stages
        ORDER BY athlete_user_id, updated_at DESC
      ) r ON a.user_id = r.athlete_user_id
      WHERE a.coach_user_id = $1
    `;

    const { rows } = await pool.query(query, [coachId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching coach's athletes recovery:", error);
    res.status(500).json({ message: "Server error" });
  }
};

import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getLatestRecovery = async (req, res) => {
  const athleteId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT stage, updated_at 
         FROM recovery_stages
         WHERE athlete_user_id = $1 
         ORDER BY updated_at DESC 
         LIMIT 1`,
      [athleteId]
    );

    if (result.rows.length === 0) {
      return res.json({
        message: "No recovery stage updates yet.",
        recoveryStage: null,
      });
    }

    res.json({
      recoveryStage: result.rows[0].stage,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error("Error fetching latest recovery stage:", error);
    res.status(500).json({ message: "Failed to fetch recovery stage." });
  }
};

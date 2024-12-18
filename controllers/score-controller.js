import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createBaselineScore = async (req, res) => {
  const { cognitive_function_score, chemical_marker_score } = req.body;
  const athleteId = req.user.id;

  if (!cognitive_function_score || !chemical_marker_score) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const athleteCheck = await pool.query(
      "SELECT * FROM athletes WHERE user_id = $1",
      [athleteId]
    );
    if (athleteCheck.rows.length === 0) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    const result = await pool.query(
      `INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score) VALUES ($1, $2, $3) RETURNING *`,
      [athleteId, cognitive_function_score, chemical_marker_score]
    );

    res.status(201).json({ baseline_score: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createTestScore = async (req, res) => {
  const { score_type, cognitive_function_score, chemical_marker_score } =
    req.body;
  const athleteId = req.user.id;

  if (!score_type || !["screen", "collision"].includes(score_type)) {
    return res.status(400).json({ message: "Invalid input" });
  }

  try {
    const athleteCheck = await pool.query(
      "SELECT * FROM athletes WHERE user_id = $1",
      [athleteId]
    );

    if (athleteCheck.rows.length === 0) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    const result = await pool.query(
      `INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score) VALUES ($1, $2, $3, $4) RETURNING *`,
      [athleteId, score_type, cognitive_function_score, chemical_marker_score]
    );

    res.status(201).json({ test_score: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

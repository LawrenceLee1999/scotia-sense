import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
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

export const getDeviations = async (req, res) => {
  const athleteId = req.user.id;

  try {
    const query = `
      SELECT
	      ts.athlete_user_id,
	      ts.created_at,
	      ts.chemical_marker_score - bs.chemical_marker_score AS chemical_marker_deviation,
	      ts.cognitive_function_score - bs.cognitive_function_score AS cognitive_function_deviation
      FROM test_scores ts
      JOIN baseline_scores bs
      ON ts.athlete_user_id = bs.athlete_user_id
      WHERE ts.athlete_user_id = $1
      ORDER BY ts.created_at;
    `;
    const deviations = await pool.query(query, [athleteId]);

    res.status(200).json(deviations.rows);
  } catch (error) {
    console.error("Error fetching deviations: ", error);
    res.status(500).json({ message: "Failed to fetch deviations" });
  }
};

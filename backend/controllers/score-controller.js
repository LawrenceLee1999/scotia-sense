import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createBaselineScore = async (req, res) => {
  const { cognitive_function_score, chemical_marker_score } = req.body;
  const athleteId = req.user.id;

  if (!cognitive_function_score || !chemical_marker_score) {
    return res
      .status(400)
      .json({ message: "Both cognitive and chemical scores are required" });
  }

  try {
    const currentYear = new Date().getFullYear();

    const athleteCheck = await pool.query(
      "SELECT * FROM athletes WHERE user_id = $1",
      [athleteId]
    );
    if (athleteCheck.rows.length === 0) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    const existingBaseline = await pool.query(
      "SELECT * FROM baseline_scores WHERE athlete_user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2",
      [athleteId, currentYear]
    );

    if (existingBaseline.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Baseline score already submitted for this season." });
    }

    const result = await pool.query(
      `INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score) VALUES ($1, $2, $3) RETURNING *`,
      [athleteId, cognitive_function_score, chemical_marker_score, currentYear]
    );

    res.status(201).json({ baseline_score: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkBaselineScore = async (req, res) => {
  const athleteId = req.user.id;
  const currentYear = new Date().getFullYear();

  try {
    const result = await pool.query(
      `SELECT 1 FROM baseline_scores WHERE athlete_user_id = $1 AND EXTRACT(YEAR FROM created_at) = $2`,
      [athleteId, currentYear]
    );

    const exists = result.rows.length > 0;

    res.json({ exists });
  } catch (error) {
    console.error("Error checking baseline score:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTestScore = async (req, res) => {
  const { score_type, cognitive_function_score, chemical_marker_score } =
    req.body;
  const athleteId = req.user.id;

  if (!score_type || !["screen", "collision", "rehab"].includes(score_type)) {
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

    const baselineRes = await pool.query(
      "SELECT cognitive_function_score, chemical_marker_score FROM baseline_scores WHERE athlete_user_id = $1",
      [athleteId]
    );

    if (baselineRes.rows.length === 0) {
      return res.status(404).json({ message: "Baseline score not found" });
    }

    // const {
    //   cognitive_function_score: baselineCognitive,
    //   chemical_marker_score: baselineChemical,
    // } = baselineRes.rows[0];

    // const chemicalDeviation =
    //   ((chemical_marker_score - baselineChemical) / baselineChemical) * 100;
    // const cognitiveDeviation =
    //   ((cognitive_function_score - baselineCognitive) / baselineCognitive) *
    //   100;

    // let recoveryStage = null;
    // if (chemicalDeviation >= 40 && cognitiveDeviation >= 40) {
    //   recoveryStage = 1;
    // } else if (chemicalDeviation >= 25 && cognitiveDeviation >= 25) {
    //   recoveryStage = 2;
    // } else if (chemicalDeviation >= 10 && cognitiveDeviation >= 10) {
    //   recoveryStage = 3;
    // } else if (chemicalDeviation >= -20 && cognitiveDeviation >= -20) {
    //   recoveryStage = 4;
    // }

    const result = await pool.query(
      `INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score) VALUES ($1, $2, $3, $4) RETURNING *`,
      [athleteId, score_type, cognitive_function_score, chemical_marker_score]
    );

    //   if (recoveryStage !== null) {
    //     await pool.query(
    //       `INSERT INTO recovery_stages (athlete_user_id, stage, updated_at)
    //  VALUES ($1, $2, NOW())`,
    //       [athleteId, recoveryStage]
    //     );
    //   }

    res.status(201).json({ test_score: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDeviations = async (req, res) => {
  const athleteId = req.user.id;

  try {
    const injuryStatusQuery = `
      SELECT is_injured
      FROM injury_logs
      WHERE athlete_user_id = $1
      ORDER BY logged_at DESC
      LIMIT 1;
    `;

    const injuryResult = await pool.query(injuryStatusQuery, [athleteId]);
    const isInjured = injuryResult.rows[0]?.isInjured ?? false;

    const deviationQuery = `
      SELECT
  ts.athlete_user_id,
  ts.created_at,
  ts.cognitive_function_score,
  ts.chemical_marker_score,

  (
    (ts.chemical_marker_score - bs.chemical_marker_score) / 
    NULLIF(bs.chemical_marker_score, 0)
  ) * 100 AS chemical_marker_deviation,

  (
    (ts.cognitive_function_score - bs.cognitive_function_score) / 
    NULLIF(bs.cognitive_function_score, 0)
  ) * 100 AS cognitive_function_deviation,

  (
    (
      (ts.chemical_marker_score - bs.chemical_marker_score) / 
      NULLIF(bs.chemical_marker_score, 0)
    ) * 100 +
    (
      (ts.cognitive_function_score - bs.cognitive_function_score) / 
      NULLIF(bs.cognitive_function_score, 0)
    ) * 100
  ) / 2 AS combined_deviation_score

FROM test_scores ts
JOIN baseline_scores bs
  ON ts.athlete_user_id = bs.athlete_user_id
WHERE ts.athlete_user_id = $1
ORDER BY ts.created_at;
    `;
    const deviationsResult = await pool.query(deviationQuery, [athleteId]);
    const deviations = deviationsResult.rows;

    const labelledDeviations = deviations.map((dev) => ({
      ...dev,
      score_type: isInjured ? "injury" : "trauma",
    }));

    res.status(200).json(labelledDeviations);
  } catch (error) {
    console.error("Error fetching deviations: ", error);
    res.status(500).json({ message: "Failed to fetch deviations" });
  }
};

export const addTestScoreWithOptionalInjury = async (req, res) => {
  const clinician_user_id = req.user.id;
  const {
    athlete_user_id,
    score_type,
    cognitive_function_score,
    chemical_marker_score,
    is_injured,
    reason,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO test_scores
       (athlete_user_id, clinician_user_id, score_type, cognitive_function_score, chemical_marker_score)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        athlete_user_id,
        clinician_user_id,
        score_type,
        cognitive_function_score,
        chemical_marker_score,
      ]
    );

    if (is_injured === true) {
      await pool.query(
        `INSERT INTO injury_logs
        (athlete_user_id, clinician_user_id, is_injured, reason)
        VALUES ($1, $2, true, $3)`,
        [athlete_user_id, clinician_user_id, reason || null]
      );
    }

    res.status(201).json({ message: "Test score added" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

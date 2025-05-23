import pg from "pg";
import { getCurrentSeason } from "../utils/season.js";
import multer from "multer";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const fetchDeviations = async (athleteId) => {
  const deviationQuery = `
  SELECT
    ts.id AS test_score_id,
    ts.athlete_user_id,
    ts.created_at,
    ts.score_type,
    ts.season,
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
    ) / 2 AS combined_deviation_score,
    rs.stage AS recovery_stage,
    cn.note AS clinician_note
  FROM test_scores ts
  JOIN baseline_scores bs
    ON ts.athlete_user_id = bs.athlete_user_id
   AND ts.season = bs.season

  LEFT JOIN LATERAL (
    SELECT rs.stage
    FROM recovery_stages rs
    WHERE rs.athlete_user_id = ts.athlete_user_id
      AND rs.updated_at = (
        SELECT MAX(r2.updated_at)
        FROM recovery_stages r2
        WHERE r2.athlete_user_id = ts.athlete_user_id
          AND r2.updated_at <= ts.created_at
      )
  ) rs ON true

  LEFT JOIN clinician_notes cn ON cn.test_score_id = ts.id

  WHERE ts.athlete_user_id = $1
  ORDER BY ts.created_at;
`;

  return pool.query(deviationQuery, [athleteId]);
};

export const getDeviations = async (req, res) => {
  const athleteId = req.params.athlete_user_id || req.user?.id;

  if (!athleteId) {
    return res.status(400).json({ message: "Athlete ID is required." });
  }

  try {
    const [deviationResult, injuryResult] = await Promise.all([
      fetchDeviations(athleteId),
      pool.query(
        `SELECT logged_at, reason FROM injury_logs
         WHERE athlete_user_id = $1 AND is_injured = true
         ORDER BY logged_at`,
        [athleteId]
      ),
    ]);

    const injuryDates = injuryResult.rows.map((row) => ({
      date: row.logged_at,
      reason: row.reason,
    }));

    res.status(200).json({
      deviations: deviationResult.rows,
      injuryDates,
    });
  } catch (error) {
    console.error("Error fetching deviations:", error);
    res.status(500).json({ message: "Failed to fetch deviations." });
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
    note,
  } = req.body;

  if (
    !athlete_user_id ||
    !score_type ||
    cognitive_function_score == null ||
    chemical_marker_score == null ||
    cognitive_function_score === "" ||
    chemical_marker_score === ""
  ) {
    return res
      .status(400)
      .json({ message: "All scores and required fields must be provided." });
  }

  if (
    is_injured === true &&
    score_type !== "rehab" &&
    (!reason || reason.trim() === "")
  ) {
    return res.status(400).json({
      message: "Injury reason must be provided when marking as injured.",
    });
  }

  const season = getCurrentSeason();

  const timestamp = new Date();

  try {
    const testResult = await pool.query(
      `INSERT INTO test_scores
       (athlete_user_id, clinician_user_id, score_type, cognitive_function_score, chemical_marker_score, season, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        athlete_user_id,
        clinician_user_id,
        score_type,
        cognitive_function_score,
        chemical_marker_score,
        season,
        timestamp,
      ]
    );

    const test_score_id = testResult.rows[0].id;

    if (score_type === "rehab" && req.body.recovery_stage != null) {
      await pool.query(
        `INSERT INTO recovery_stages
           (athlete_user_id, stage, clinician_user_id, updated_at)
         VALUES ($1, $2, $3, $4)`,
        [athlete_user_id, req.body.recovery_stage, clinician_user_id, timestamp]
      );
    }

    if (is_injured === true) {
      await pool.query(
        `INSERT INTO injury_logs
        (athlete_user_id, clinician_user_id, is_injured, reason)
        VALUES ($1, $2, true, $3)`,
        [athlete_user_id, clinician_user_id, reason || null]
      );
    }

    if (note && note.trim() !== "") {
      await pool.query(
        `INSERT INTO clinician_notes (clinician_user_id, athlete_user_id, test_score_id, note) VALUES ($1, $2, $3, $4)`,
        [clinician_user_id, athlete_user_id, test_score_id, note]
      );
    }

    if (req.files && req.files.length > 0) {
      const scatUploads = req.files.map((file) => [
        test_score_id,
        file.filename,
        file.path,
      ]);

      const insertQuery = `
        INSERT INTO scat6_files (test_score_id, filename, filepath)
        VALUES ${scatUploads
          .map((_, i) => `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`)
          .join(", ")}
      `;

      await pool.query(insertQuery, scatUploads.flat());
    }

    res.status(201).json({ message: "Test score and files saved." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const createBaselineScoreByClinician = async (req, res) => {
  const clinicianId = req.user.id;
  const { athlete_user_id, cognitive_function_score, chemical_marker_score } =
    req.body;

  if (!athlete_user_id || !cognitive_function_score || !chemical_marker_score) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const season = getCurrentSeason();

  try {
    const exists = await pool.query(
      `SELECT 1 FROM baseline_scores WHERE athlete_user_id = $1 AND season = $2`,
      [athlete_user_id, season]
    );

    if (exists.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "Baseline already submitted for this season." });
    }

    await pool.query(
      `INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score, season, clinician_user_id)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        athlete_user_id,
        cognitive_function_score,
        chemical_marker_score,
        season,
        clinicianId,
      ]
    );

    res.status(201).json({ message: "Baseline score recorded successfully." });
  } catch (error) {
    console.error("Error submitting baseline:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkBaselineScoreByClinician = async (req, res) => {
  const { athlete_user_id } = req.params;
  const season = getCurrentSeason();

  try {
    const result = await pool.query(
      `SELECT 1 FROM baseline_scores WHERE athlete_user_id = $1 AND season = $2`,
      [athlete_user_id, season]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (error) {
    console.error("Error checking baseline score:", error);
    res.status(500).json({ message: "Failed to check baseline" });
  }
};

export const clearInjury = async (req, res) => {
  const { athlete_user_id } = req.body;
  const clinicianId = req.user.id;

  try {
    await pool.query(
      `INSERT INTO injury_logs (
         athlete_user_id,
         clinician_user_id,
         is_injured,
         logged_at
       ) VALUES ($1, $2, false, NOW())`,
      [athlete_user_id, clinicianId]
    );

    await pool.query(
      `INSERT INTO recovery_stages (athlete_user_id, stage, clinician_user_id)
       VALUES ($1, null, $2)`,
      [athlete_user_id, clinicianId]
    );

    res.status(200).json({ message: "Athlete cleared from injury." });
  } catch (error) {
    console.error("Error clearing injury:", error);
    res.status(500).json({ message: "Failed to clear injury." });
  }
};

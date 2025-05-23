import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getCoachAthletesDashboard = async (req, res) => {
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
  a.position,
  r.stage AS recovery_stage,
  r.updated_at AS recovery_updated_at,
  i.logged_at,
  cn.note AS latest_note,
  COALESCE(i.is_injured, FALSE) AS is_injured,
  latest_scores.combined_deviation_score,
  CASE 
    WHEN COALESCE(i.is_injured, FALSE) THEN 'injured'
    ELSE 'healthy'
  END AS score_type
FROM athletes a
JOIN users u ON a.user_id = u.id

-- Join latest recovery stage
LEFT JOIN (
  SELECT DISTINCT ON (athlete_user_id) *
  FROM recovery_stages
  ORDER BY athlete_user_id, updated_at DESC
) r ON a.user_id = r.athlete_user_id

-- Join latest injury status
LEFT JOIN (
  SELECT DISTINCT ON (athlete_user_id)
    athlete_user_id,
    is_injured,
    logged_at
  FROM injury_logs
  ORDER BY athlete_user_id, logged_at DESC
) i ON a.user_id = i.athlete_user_id

-- Join latest deviation score
LEFT JOIN (
  SELECT DISTINCT ON (ts.athlete_user_id)
    ts.athlete_user_id,
    (
      (
        (ts.chemical_marker_score - bs.chemical_marker_score) / NULLIF(bs.chemical_marker_score, 0)
      ) * 100 +
      (
        (ts.cognitive_function_score - bs.cognitive_function_score) / NULLIF(bs.cognitive_function_score, 0)
      ) * 100
    ) / 2 AS combined_deviation_score
  FROM test_scores ts
  JOIN baseline_scores bs ON ts.athlete_user_id = bs.athlete_user_id
  ORDER BY ts.athlete_user_id, ts.created_at DESC
) latest_scores ON a.user_id = latest_scores.athlete_user_id

-- Join latest clinician note
LEFT JOIN (
  SELECT DISTINCT ON (athlete_user_id)
    athlete_user_id,
    note,
    created_at
  FROM clinician_notes
  ORDER BY athlete_user_id, created_at DESC
) cn ON a.user_id = cn.athlete_user_id

WHERE a.coach_user_id = $1`;

    const { rows } = await pool.query(query, [coachId]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching coach's athletes recovery:", error);
    res.status(500).json({ message: "Server error" });
  }
};

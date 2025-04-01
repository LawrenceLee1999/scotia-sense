import bcrypt from "bcrypt";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const insertDummyData = async (req, res) => {
  try {
    await pool.query("BEGIN");

    const hashedPassword1 = await bcrypt.hash("password123", 10);
    const hashedPassword2 = await bcrypt.hash("password123", 10);
    const hashedPassword3 = await bcrypt.hash("password123", 10);
    const hashedPassword4 = await bcrypt.hash("password123", 10);

    // Insert users
    const users = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password, role, team) VALUES
      ('John', 'Doe', 'athlete1@example.com', $1, 'athlete', 'Team A'),
      ('Jane', 'Smith', 'athlete2@example.com', $2, 'athlete', 'Team B'),
      ('Emily', 'Brown', 'clinician1@example.com', $3, 'clinician', 'N/A'),
      ('Mike', 'Johnson', 'coach1@example.com', $4, 'coach', 'Team A')
      RETURNING id;`,
      [hashedPassword1, hashedPassword2, hashedPassword3, hashedPassword4]
    );

    const [athlete1Id, athlete2Id, clinicianId, coachId] = users.rows.map(
      (user) => user.id
    );

    // Insert clinician
    await pool.query(
      `INSERT INTO clinicians (user_id, specialisation, contact_info) VALUES
      ($1, 'Sports Medicine', 'emily.brown@example.com');`,
      [clinicianId]
    );

    // Insert coach
    await pool.query(
      `INSERT INTO coaches (user_id, experience) VALUES
      ($1, '10 years coaching experience');`,
      [coachId]
    );

    // Insert athletes
    await pool.query(
      `INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, sport, gender, position, date_of_birth) VALUES
      ($1, $3, $4, 'Football', 'Male', 'Midfielder', '2000-05-15'),
      ($2, $3, $4, 'Football', 'Female', 'Defender', '1998-08-22');`,
      [athlete1Id, athlete2Id, clinicianId, coachId]
    );

    // Insert baseline scores
    await pool.query(
      `INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score) VALUES
      ($1, 95.0, 1.2),  -- Athlete 1 Baseline
      ($2, 92.0, 1.5);  -- Athlete 2 Baseline`,
      [athlete1Id, athlete2Id]
    );

    // Function to generate fluctuating scores between -20% and +80%
    const generateFluctuatingScore = (baseScore) => {
      const fluctuation = Math.random() * 1.0 - 0.2; // Random fluctuation between -20% (-0.2) and +80% (+0.8)
      return baseScore * (1 + fluctuation);
    };

    // Insert 15 correlated test scores per athlete with fluctuations
    const testScores = [];

    // Generate test scores for Athlete 1
    for (let i = 0; i < 15; i++) {
      const baselineCognitive = 95.0;
      const baselineChemical = 1.2;

      // Generate fluctuating cognitive and chemical scores
      const cognitiveScore = generateFluctuatingScore(baselineCognitive);
      const chemicalScore = generateFluctuatingScore(baselineChemical);

      testScores.push({
        athleteId: athlete1Id,
        type: i % 2 === 0 ? "screen" : "collision", // Alternating test type
        cognitive: parseFloat(cognitiveScore.toFixed(2)),
        chemical: parseFloat(chemicalScore.toFixed(2)),
      });
    }

    // Generate test scores for Athlete 2
    for (let i = 0; i < 15; i++) {
      const baselineCognitive = 92.0;
      const baselineChemical = 1.5;

      // Generate fluctuating cognitive and chemical scores
      const cognitiveScore = generateFluctuatingScore(baselineCognitive);
      const chemicalScore = generateFluctuatingScore(baselineChemical);

      testScores.push({
        athleteId: athlete2Id,
        type: i % 2 === 0 ? "screen" : "collision", // Alternating test type
        cognitive: parseFloat(cognitiveScore.toFixed(2)),
        chemical: parseFloat(chemicalScore.toFixed(2)),
      });
    }

    // Insert each test score
    for (const { athleteId, type, cognitive, chemical } of testScores) {
      // Calculate deviations
      const baselineRes = await pool.query(
        "SELECT cognitive_function_score, chemical_marker_score FROM baseline_scores WHERE athlete_user_id = $1",
        [athleteId]
      );

      const baseline = baselineRes.rows[0];
      const cognitiveDeviation =
        ((cognitive - baseline.cognitive_function_score) /
          baseline.cognitive_function_score) *
        100;
      const chemicalDeviation =
        ((chemical - baseline.chemical_marker_score) /
          baseline.chemical_marker_score) *
        100;

      let recoveryStage = null;
      if (chemicalDeviation >= 40 && cognitiveDeviation >= 40) {
        recoveryStage = 1;
      } else if (chemicalDeviation >= 25 && cognitiveDeviation >= 25) {
        recoveryStage = 2;
      } else if (chemicalDeviation >= 10 && cognitiveDeviation >= 10) {
        recoveryStage = 3;
      } else if (chemicalDeviation >= -20 && cognitiveDeviation >= -20) {
        recoveryStage = 4;
      }

      // Insert test score
      await pool.query(
        `INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score) 
         VALUES ($1, $2, $3, $4);`,
        [athleteId, type, cognitive, chemical]
      );

      if (recoveryStage !== null) {
        await pool.query(
          `INSERT INTO recovery_stages (athlete_user_id, stage, updated_at) 
           VALUES ($1, $2, NOW());`,
          [athleteId, recoveryStage]
        );
      }
    }

    // Insert notes
    await pool.query(
      `INSERT INTO notes (clinician_user_id, athlete_user_id, note) VALUES
      ($1, $2, 'Athlete 1 had a high cognitive deviation after collision, monitoring needed.'),
      ($1, $3, 'Athlete 2 performed within normal cognitive function range.');`,
      [clinicianId, athlete1Id, athlete2Id]
    );

    await pool.query("COMMIT");

    res.status(200).json({ message: "Dummy data inserted successfully!" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error inserting dummy data: ", error);
    res
      .status(500)
      .json({ message: "Failed to insert dummy data", error: error.message });
  }
};

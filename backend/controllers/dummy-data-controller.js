import bcrypt from "bcrypt";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const insertDummyData = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash("password123", 10);

    // Create 1 clinician
    const clinicianUser = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, role, team)
       VALUES ('Alice', 'Wong', 'alice@clinic.com', $1, 'clinician', 'Team A')
       RETURNING id`,
      [hashedPassword]
    );
    const clinicianId = clinicianUser.rows[0].id;

    await client.query(
      `INSERT INTO clinicians (user_id, specialisation, contact_info)
       VALUES ($1, 'Sports Medicine', 'alice@clinic.com')`,
      [clinicianId]
    );

    // Create 1 coach
    const coachUser = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, role, team)
       VALUES ('Bob', 'Taylor', 'bob@coach.com', $1, 'coach', 'Team A')
       RETURNING id`,
      [hashedPassword]
    );
    const coachId = coachUser.rows[0].id;

    await client.query(
      `INSERT INTO coaches (user_id, experience)
       VALUES ($1, '10 years coaching football')`,
      [coachId]
    );

    // Create 2 athletes
    const athleteUsers = await client.query(
      `INSERT INTO users (first_name, last_name, email, password, role, team)
       VALUES 
         ('Charlie', 'King', 'charlie@athlete.com', $1, 'athlete', 'Team A'),
         ('Diana', 'Reed', 'diana@athlete.com', $1, 'athlete', 'Team A')
       RETURNING id`,
      [hashedPassword]
    );

    const [athlete1Id, athlete2Id] = [
      athleteUsers.rows[0].id,
      athleteUsers.rows[1].id,
    ];

    await client.query(
      `INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, sport, gender, position, date_of_birth)
       VALUES 
         ($1, $3, $4, 'Football', 'Male', 'Forward', '2000-01-15'),
         ($2, $3, $4, 'Football', 'Female', 'Midfielder', '2001-05-10')`,
      [athlete1Id, athlete2Id, clinicianId, coachId]
    );

    // Baseline scores
    await client.query(
      `INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score)
       VALUES 
         ($1, 95.5, 80.2),
         ($2, 92.0, 78.9)`,
      [athlete1Id, athlete2Id]
    );

    // Test scores
    await client.query(
      `INSERT INTO test_scores (athlete_user_id, clinician_user_id, score_type, cognitive_function_score, chemical_marker_score)
       VALUES 
         ($1, $3, 'screen', 100.5, 83.2),     
         ($2, $3, 'collision', 98.0, 81.5)`,
      [athlete1Id, athlete2Id, clinicianId]
    );

    // Injury logs
    await client.query(
      `INSERT INTO injury_logs (athlete_user_id, clinician_user_id, is_injured, reason)
       VALUES 
         ($1, $3, TRUE, 'Head collision during match'),
         ($2, $3, FALSE, 'Fully recovered')`,
      [athlete1Id, athlete2Id, clinicianId]
    );

    await client.query("COMMIT");
    res.status(200).send("Dummy data seeded successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error inserting dummy data:", err);
    res.status(500).send("Error seeding dummy data");
  } finally {
    client.release();
  }
};

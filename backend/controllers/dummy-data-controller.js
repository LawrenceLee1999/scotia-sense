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

    await pool.query(`
          INSERT INTO users (email, password, role, name, team) VALUES
          ('athlete1@example.com', '${hashedPassword1}', 'athlete', 'John Doe', 'Team A'),
          ('athlete2@example.com', '${hashedPassword2}', 'athlete', 'Jane Smith', 'Team B'),
          ('clinician1@example.com', '${hashedPassword3}', 'clinician', 'Emily Brown', 'N/A'),
          ('coach1@example.com', '${hashedPassword4}', 'coach', 'Mike Johnson', 'Team A');
        `);

    await pool.query(`
          INSERT INTO clinicians (user_id, specialisation, contact_info) VALUES
          (3, 'Sports Medicine', 'emily.brown@example.com');
        `);

    await pool.query(`
          INSERT INTO coaches (user_id, experience) VALUES
          (4, '10 years coaching experience');
        `);

    await pool.query(`
          INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, sport, gender, position, date_of_birth) VALUES
          (1, 3, 4, 'Football', 'Male', 'Midfielder', '2000-05-15'),
          (2, 3, 4, 'Football', 'Female', 'Defender', '1998-08-22');
        `);

    await pool.query(`
          INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score) VALUES
          (1, 95.5, 1.2),
          (2, 92.0, 1.5);
        `);

    await pool.query(`
          INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score) VALUES
          (1, 'screen', 97.0, 1.4),
          (1, 'collision', 93.0, 1.8),
          (1, 'screen', 98.0, 1.3),
          (1, 'collision', 94.5, 1.9),
          (1, 'screen', 96.5, 1.5),
          (1, 'collision', 100.0, 2.0),
          (1, 'screen', 94.5, 1.4),
          (1, 'collision', 99.0, 2.2),
          (1, 'screen', 98.5, 1.6),
          (1, 'collision', 95.0, 1.7),
          (1, 'screen', 97.5, 1.5),
          (1, 'collision', 101.0, 2.5),
          (2, 'screen', 93.5, 1.6),
          (2, 'collision', 91.0, 2.0),
          (2, 'screen', 94.5, 1.7),
          (2, 'collision', 92.5, 2.1),
          (2, 'screen', 95.5, 1.8),
          (2, 'collision', 97.0, 2.3),
          (2, 'screen', 93.0, 1.9),
          (2, 'collision', 98.5, 2.5),
          (2, 'screen', 96.0, 2.0),
          (2, 'collision', 99.0, 2.6),
          (2, 'screen', 97.0, 2.1),
          (2, 'collision', 100.0, 2.8);
        `);

    await pool.query(`
          INSERT INTO notes (clinician_user_id, athlete_user_id, note) VALUES
          (3, 1, 'Athlete reported mild headaches post-game. Monitor condition.'),
          (3, 2, 'No significant issues reported. Cognitive function stable.');
        `);

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

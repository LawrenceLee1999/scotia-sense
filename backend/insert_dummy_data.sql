-- Insert dummy users
INSERT INTO users (email, password, role, name, team) VALUES
('athlete1@example.com', 'hashedpassword1', 'athlete', 'John Doe', 'Team A'),
('athlete2@example.com', 'hashedpassword2', 'athlete', 'Jane Smith', 'Team B'),
('clinician1@example.com', 'hashedpassword3', 'clinician', 'Emily Brown', 'N/A'),
('coach1@example.com', 'hashedpassword4', 'coach', 'Mike Johnson', 'Team A');

-- Insert clinicians
INSERT INTO clinicians (user_id, specialisation, contact_info) VALUES
(3, 'Sports Medicine', 'emily.brown@example.com');

-- Insert coaches
INSERT INTO coaches (user_id, experience) VALUES
(4, '10 years coaching experience');

-- Insert athletes
INSERT INTO athletes (user_id, clinician_user_id, coach_user_id, sport, gender, position, date_of_birth) VALUES
(1, 3, 4, 'Football', 'Male', 'Midfielder', '2000-05-15'),
(2, 3, 4, 'Football', 'Female', 'Defender', '1998-08-22');

-- Insert baseline scores
INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score) VALUES
(1, 95.5, 1.2),
(2, 92.0, 1.5);

-- Insert test scores
INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score) VALUES
(1, 'screen', 94.0, 1.3),
(1, 'collision', 90.0, 2.0),
(2, 'screen', 91.5, 1.6),
(2, 'collision', 89.0, 2.1);

-- Insert notes
INSERT INTO notes (clinician_user_id, athlete_user_id, note) VALUES
(3, 1, 'Athlete reported mild headaches post-game. Monitor condition.'),
(3, 2, 'No significant issues reported. Cognitive function stable.');
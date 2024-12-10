INSERT INTO users (email, password, role, name) VALUES
('clinician1@example.com', 'password1', 'clinician', 'Dr. Alice Smith'),
('coach1@example.com', 'password2', 'coach', 'Coach Bob Jones'),
('athlete1@example.com', 'password3', 'athlete', 'John Doe'),
('athlete2@example.com', 'password4', 'athlete', 'Jane Doe');

WITH clinician_user AS (
    SELECT id FROM users WHERE email = 'clinician1@example.com'
)
INSERT INTO clinician (user_id, specialisation, contact_info)
VALUES ((SELECT id FROM clinician_user), 'Orthopedics', 'alice.smith@hospital.com');

WITH coach_user AS (
    SELECT id FROM users WHERE email = 'coach1@example.com'
)
INSERT INTO coach (user_id, team, experience)
VALUES ((SELECT id FROM coach_user), 'Team A', '5 years of coaching experience');

WITH athlete_user AS (
    SELECT id FROM users WHERE email = 'athlete1@example.com'
),
clinician_user AS (
    SELECT user_id FROM clinician WHERE user_id = (SELECT id FROM users WHERE email = 'clinician1@example.com')
),
coach_user AS (
    SELECT user_id FROM coach WHERE user_id = (SELECT id FROM users WHERE email = 'coach1@example.com')
)
INSERT INTO athlete (user_id, clinician_user_id, coach_user_id, sport, gender, date_of_birth)
VALUES (
    (SELECT id FROM athlete_user),
    (SELECT user_id FROM clinician_user),
    (SELECT user_id FROM coach_user),
    'Basketball',
    'Male',
    '2000-01-01'
);

WITH athlete_user_2 AS (
    SELECT id FROM users WHERE email = 'athlete2@example.com'
)
INSERT INTO athlete (user_id, sport, gender, date_of_birth)
VALUES (
    (SELECT id FROM athlete_user_2),
    'Soccer',
    'Female',
    '1998-05-15'
);

INSERT INTO baseline_scores (athlete_user_id, cognitive_function_score, chemical_marker_score, date)
VALUES
((SELECT id FROM users WHERE email = 'athlete1@example.com'), 50.0, 45.0, now()),
((SELECT id FROM users WHERE email = 'athlete2@example.com'), 60.0, 50.0, now());

INSERT INTO test_scores (athlete_user_id, score_type, cognitive_function_score, chemical_marker_score, date)
VALUES
((SELECT id FROM users WHERE email = 'athlete1@example.com'), 'screen', 48.0, 42.0, now()),
((SELECT id FROM users WHERE email = 'athlete2@example.com'), 'collision', 55.0, 49.0, now());

INSERT INTO notes (clinician_user_id, athlete_user_id, note, date)
VALUES
((SELECT id FROM users WHERE email = 'clinician1@example.com'), (SELECT id FROM users WHERE email = 'athlete1@example.com'), 'Follow up after collision assessment', now()),
((SELECT id FROM users WHERE email = 'clinician1@example.com'), (SELECT id FROM users WHERE email = 'athlete2@example.com'), 'Monitor cognitive functions', now());
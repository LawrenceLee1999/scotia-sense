CREATE TABLE users (
    id SERIAL PRIMARY KEY,
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('athlete', 'clinician', 'coach')) NOT NULL,
    team VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE clinicians (
    user_id INT PRIMARY KEY,
    specialisation VARCHAR(100),
    contact_info TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE coaches (
    user_id INT PRIMARY KEY,
    experience TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE athletes (
    user_id INT PRIMARY KEY,
    clinician_user_id INT,
    coach_user_id INT,
    sport VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
	position VARCHAR(50),
    date_of_birth DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinician_user_id) REFERENCES clinicians(user_id) ON DELETE SET NULL,
    FOREIGN KEY (coach_user_id) REFERENCES coaches(user_id) ON DELETE SET NULL
);

CREATE TABLE baseline_scores (
    id SERIAL PRIMARY KEY,
    athlete_user_id INT NOT NULL,
    cognitive_function_score DECIMAL(5,2) NOT NULL,
    chemical_marker_score DECIMAL(5,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
	season TEXT,
    FOREIGN KEY (athlete_user_id) REFERENCES athletes(user_id) ON DELETE CASCADE
);

CREATE TABLE test_scores (
    id SERIAL PRIMARY KEY,
    athlete_user_id INT NOT NULL,
	clinician_user_id INT NOT NULL,
    score_type VARCHAR(20) CHECK (score_type IN ('screen', 'collision', 'rehab')) NOT NULL,
    cognitive_function_score DECIMAL(5,2),
    chemical_marker_score DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (athlete_user_id) REFERENCES athletes(user_id) ON DELETE CASCADE,
	FOREIGN KEY (clinician_user_id) REFERENCES clinicians(user_id) ON DELETE CASCADE
);

CREATE TABLE recovery_stages (
    id SERIAL PRIMARY KEY,
    athlete_user_id INT NOT NULL,
    stage INT NOT NULL CHECK (stage IN (1, 2, 3, 4, 5)),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (athlete_user_id) REFERENCES athletes(user_id) ON DELETE CASCADE
);

CREATE TABLE injury_logs (
  id SERIAL PRIMARY KEY,
  athlete_user_id INTEGER REFERENCES athletes(user_id),
  clinician_user_id INTEGER REFERENCES clinicians(user_id),
  is_injured BOOLEAN NOT NULL,
  reason TEXT,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
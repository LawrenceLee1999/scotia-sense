# Scotia Sense (Head Trauma Tracker)

Scotia sense is a web application designed to help clinicians monitor head trauma scores in athletes to detect concussions. It tracks cognitive and chemical marker scores over time which provides visual data to assist in medical assessments.

## Features
- Athletes can register baseline and test scores
- Graphs showing the deviation from baseline score over time
- User details stored within database
- JWT authentication for secure access
- REST API for easy data retrieval

## Tech Stack
- **Frontend**: React (Vite) + Bootstrap
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: JWT
- **Hosting**: Render

## Setup & Installation

### Prerequisites
- Node.js installed
- PostgreSQL database setup
- PgAdmin (optional)

### 1. Database Setup (Using PgAdmin)

To setup the database locally, follow these steps:

1️⃣ **Ensure PostgreSQL and PgAdmin is installed and running**  
   If you don’t have PostgreSQL installed, download it from [PostgreSQL's official site](https://www.postgresql.org/download/).
   If you installed PostgreSQL, pgAdmin should be included. Otherwise, you can download it seperately from [PostgreSQL's official site](https://www.pgadmin.org/download/).
   
2️⃣ **Create a Server**
1. Open PgAdmin and right-click on servers in the left panel
2. Click Create > Server
3. In the General tab:
      - Enter Local PostgreSQL (or any name you prefer) in the Name field
4. Go to the Connection tab:
	- Host name/address: localhost
	- Port: 5432
	- Maintenance database: postgres
	- Username: your_postgres_username (default is postgres)
	- Password: Enter your PostgreSQL password
5. Click Save

3️⃣ **Create the Database**
1. Expand Servers > Click your PostgreSQL server
2. Right-click on Databases > Click Create > Database
3. Enter Database name: scotia_sense
4. Click Save

4️⃣ **Run the SQL Script To Create Tables**
1. Click on the scotia_sense database
2. Click the Query Tool (SQL icon at the top)
3. Open create_table.sql in a text editor, copy the SQL code, and paste it into the Query Editor
4. Click Execute (▶️)

Your database should be ready to use for the API.

### 2. Clone the Repository

```sh
git clone https://github.com/LawrenceLee1999/scotia-sense.git
cd scotia-sense
```

### 3. Setup Environment Variables

Backend (/backend/.env)

```plaintext
PORT=3000
DATABASE_URL=postgres://your_username:your_password@localhost:5432/scotia_sense
JWT_SECRET=your-secret-key
NODE_ENV=development
```

Frontend (/frontend/.env)

```plaintext
VITE_API_URL=http://localhost:3000
```

### 4. Install Dependencies and Start the Development Server

Backend (Express + PostgreSQL)
```sh
cd backend
npm install
node index.js # Ensure your PostgreSQL database is running before this step.
```

Frontend (React + Vite)
```sh
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 on the browser to access the app.

## API Documentation

### Authentication Routes

| Method | Endpoint                | Description                                            |
|--------|-------------------------|--------------------------------------------------------|
| POST   | /auth/register          | Registers a new user                                   |
| POST   | /auth/login             | Login user and returns a JWT                           |
| GET    | /auth/clinician-coaches | Gets ID/Name of clinician and coaches for register form|

### User Routes

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| PUT    | /user/update-user   | Updates user profile details |
| GET    | /user/profile       | Gets user profile details    |

### Score Routes

| Method | Endpoint                | Description                                            |
|--------|-------------------------|--------------------------------------------------------|
| POST   | /score/baseline-score   | Creates a new baseline score                           |
| POST   | /score/test-score       | Creates a new test score                               |
| GET    | /score/deviations       | Returns the deviation between baseline and test scores |

### Dummy Data Routes

| Method | Endpoint                | Description                                            |
|--------|-------------------------|--------------------------------------------------------|
| POST   | /data/insert-dummy-data | Creates dummy data for database                        |



## Deployment

The application is hosted on Render:

- **Frontend**: https://scotia-sense-frontend.onrender.com
- **Backend**: https://scotia-sense-backend.onrender.com
- **Database**: PostgreSQL on Render

# SportSens – Concussion Management Platform

🚧 This project is a work in progress. Not all features are complete.

**SportSens** is a concussion assessment and recovery management platform developed by Scotia Biotech. It enables athletes, clinicians, and coaches to efficiently manage head injury assessments using objective saliva and cognitive testing, and monitor recovery progress to support safe return-to-play decisions.

## 🚀 Features

### ✅ Core Capabilities
- **Rapid Concussion Assessment**  
  Combines saliva-based biomarkers with cognitive tests for fast, accurate concussion detection

- **Personalized Recovery Tracking**  
  Tracks cognitive and chemical deviation from baseline scores, visualized through charts for trend monitoring

- **Recovery Staging & Injury Logging**  
  Clinicians can mark injuries and update recovery stages. Injuries are annotated on deviation graphs for context

- **Role-Specific Dashboards**  
  - **Athlete Dashboard**: View performance deviation, submit scores
  - **Clinician Dashboard**: Enter test scores, mark injuries
  - **Coach Dashboard**: Monitor team recovery and risk indicators
  - **Superadmin Dashboard**: Create, edit and delete teams. Toggle admin status for users

- **Profile Management**  
  Users can update their personal and role-specific data and change passwords securely

- **Invite-Only Registration**  
  Athletes and coaches are invited by clinicians or admins to join the system, linking them to the correct team automatically

## 🧠 Tech Stack

- **Frontend**: React with React Router, Chart.js, AOS for animation, Bootstrap-based styling
- **Backend**: Node.js + Express
- **Database**: PostgreSQL with structured athlete/coach/clinician models
- **Authentication**: JWT with role-based routing & protected pages

## 🗂️ Frontend Pages Overview

| Page                 | Path                  | Role Access       |
|----------------------|-----------------------|-------------------|
| Home                 | `/`                   | Public            |
| Login                | `/login`              | Public            |
| Register             | `/register`           | Public (via invite)|
| Athlete Dashboard    | `/athlete-dashboard`  | Athlete only      |
| Coach Dashboard      | `/coach-dashboard`    | Coach only        |
| Clinician Dashboard  | `/clinician-dashboard`| Clinician only    |
| Superadmin Dashboard | `/superadmin-dashboard` | Superadmin only |
| Profile              | `/profile`            | All users         |

## 🧪 Health Scoring Logic

- **Baseline Scores**: Submitted once per athlete per season
- **Deviation Calculation**: New test scores are compared to baseline and deviation is visualized.
- **Score Types**: 'screen' for routine tests, 'collision' for suspected injury events.
- **Recovery Zones**:
  - Green (Safe)
  - Yellow (Caution)
  - Orange (Concern)
  - Red (High Risk)

## 🔐 Authentication & Routing

- Users log in via email/password.
- Route access is gated based on roles (athlete, coach, clinician).
- ProtectedRoute components ensure only authenticated users can access dashboards

## 🖼️ Visual Features

- Animated homepage and landing flow (AOS)
- Dynamic charts with Chart.js and zone shading for deviation
- Modal forms for score submission

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up `.env` with API endpoint if needed
4. Run locally: `npm start`

## 🧑‍⚕️ Roles Explained

- **Athlete**: Submits baseline and test scores, views recovery charts
- **Clinician**: Manages athletes, enters test results, logs injuries
- **Coach**: Oversees athlete recovery progress and performance risks
- **Admin** (optional): Manages team creation and user invitations

---

© Scotia Biotech – We’re taking the headache out of concussions.

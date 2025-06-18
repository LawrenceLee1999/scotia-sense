import pg from "pg";
import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const getAssignedAthletes = async (req, res) => {
  const clinicianId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT 
         a.user_id, 
         u.first_name, 
         u.last_name,
         COALESCE(i.is_injured, FALSE) AS is_injured,
         i.logged_at
       FROM athletes a
       JOIN users u ON a.user_id = u.id
       LEFT JOIN (
         SELECT DISTINCT ON (athlete_user_id) athlete_user_id, is_injured, logged_at
         FROM injury_logs
         ORDER BY athlete_user_id, logged_at DESC
       ) i ON a.user_id = i.athlete_user_id
       WHERE a.clinician_user_id = $1`,
      [clinicianId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch athletes" });
  }
};

export const createInvite = async (req, res) => {
  const { email, phone_number } = req.body;
  const clinicianId = req.user.id;

  const token = uuidv4();

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const phoneRegex = /^\+\d{10,15}$/;
  if (!phoneRegex.test(phone_number)) {
    console.log("Phone received:", phone_number);
    return res.status(400).json({
      message: "Phone number must include country code and start with '+'.",
    });
  }

  const existingUser = await pool.query(
    `SELECT id FROM users WHERE email = $1 OR phone_number = $2`,
    [email, phone_number || null]
  );

  if (existingUser.rows.length > 0) {
    return res.status(400).json({
      message: "An account with this email or phone number already exists.",
    });
  }

  const clinicianTeamResult = await pool.query(
    "SELECT team_id FROM users WHERE id = $1",
    [clinicianId]
  );
  const team_id = clinicianTeamResult.rows[0]?.team_id;

  if (!team_id) {
    return res
      .status(400)
      .json({ message: "Clinician must belong to a team." });
  }

  await pool.query(
    `INSERT INTO clinician_invites (clinician_user_id, token, email, phone_number, team_id) VALUES ($1, $2, $3, $4, $5)`,
    [clinicianId, token, email, phone_number || null, team_id]
  );

  const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Scotia Sense - You're Invited to Register",
      html: `
        <p>You have been invited to join Scotia Sense.</p>
        <p>Click the link below to complete your registration:</p>
        <a href="${inviteLink}">${inviteLink}</a>
      `,
    });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ message: "Failed to send invite email." });
  }

  if (phone_number && phone_number.startsWith("+")) {
    try {
      await client.messages.create({
        from: "whatsapp:+14155238886",
        to: `whatsapp:${phone_number}`,
        body: `👋 You've been invited to join Scotia Sense. Register here: ${inviteLink}`,
      });
    } catch (error) {
      console.error("Text send error:", error);
      res.status(500).json({ message: "Failed to send invite text." });
    }
  }
  res.status(200).json({ inviteLink });
};

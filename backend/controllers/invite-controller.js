import { v4 as uuidv4 } from "uuid";
import pg from "pg";
import nodemailer from "nodemailer";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const createInvite = async (req, res) => {
  const {
    email,
    phone_number,
    invite_role,
    team_id: submittedTeamId,
  } = req.body;
  const invited_by = req.user.id;
  const token = uuidv4();

  if (!email || invite_role === undefined) {
    return res.status(400).json({ message: "Email and role are required." });
  }

  // If invite_role is null, user will be treated as team admin (role=null, is_admin=true)
  const validRoles = ["athlete", "clinician", "coach"];
  if (invite_role !== null && !validRoles.includes(invite_role)) {
    return res.status(400).json({ message: "Invalid role type." });
  }

  const phoneRegex = /^\+\d{10,15}$/;
  if (phone_number && !phoneRegex.test(phone_number)) {
    return res.status(400).json({
      message:
        "Phone number must include country code and start with '+' (e.g. +447700900123).",
    });
  }

  try {
    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR phone_number = $2`,
      [email, phone_number || null]
    );
    if (existing.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "User with this email/phone already exists." });
    }

    const inviterResult = await pool.query(
      `SELECT team_id, role, is_admin FROM users WHERE id = $1`,
      [invited_by]
    );
    const inviter = inviterResult.rows[0];
    if (!inviter) {
      return res.status(403).json({ message: "Invalid inviter." });
    }

    let team_id = null;

    if (inviter.team_id) {
      team_id = inviter.team_id;
    } else if (submittedTeamId) {
      team_id = submittedTeamId;
    } else if (invite_role === "athlete") {
      return res
        .status(400)
        .json({ message: "Inviter must belong to a team to invite athletes." });
    }

    let teamName = "Scotia Sense";
    if (team_id) {
      const teamResult = await pool.query(
        "SELECT name FROM teams WHERE id = $1",
        [team_id]
      );
      teamName = teamResult.rows[0]?.name || "your team";
    }

    await pool.query(
      `INSERT INTO invites (token, email, phone_number, invite_role, invited_by, team_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [token, email, phone_number || null, invite_role, invited_by, team_id]
    );

    const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const article =
      invite_role === null
        ? "a"
        : ["a", "e", "i", "o", "u"].includes(invite_role[0].toLowerCase())
        ? "an"
        : "a";

    const capitalisedRole =
      invite_role === null
        ? "Team Admin"
        : invite_role.charAt(0).toUpperCase() + invite_role.slice(1);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Scotia Sense Invite - ${capitalisedRole}`,
      html: `<p>You’ve been invited to join <strong>${teamName}</strong> on Scotia Sense as ${article} <strong>${capitalisedRole}</strong>.</p>
             <p>Click below to register:</p>
             <a href="${inviteLink}">${inviteLink}</a>`,
    });

    if (phone_number && phone_number.startsWith("+")) {
      try {
        await client.messages.create({
          from: "whatsapp:+14155238886",
          to: `whatsapp:${phone_number}`,
          body: `👋 You've been invited to join ${teamName} on Scotia Sense as ${article} ${capitalisedRole}. Register here: ${inviteLink}`,
        });
      } catch (err) {
        console.warn("Failed to send WhatsApp:", err.message);
      }
    }

    return res.status(200).json({ inviteLink });
  } catch (err) {
    console.error("Invite error:", err);
    return res.status(500).json({ message: "Server error creating invite." });
  }
};

export const getInviteByToken = async (req, res) => {
  const { token } = req.params;

  try {
    const result = await pool.query(
      `SELECT email, phone_number, invite_role, team_id, invited_by, used
       FROM invites
       WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Invite not found or invalid." });
    }

    const invite = result.rows[0];

    if (invite.used) {
      return res.status(400).json({ message: "Invite has already been used." });
    }

    res.json(invite);
  } catch (error) {
    console.error("Error fetching invite:", error);
    res.status(500).json({ message: "Server error fetching invite." });
  }
};

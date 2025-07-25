import { v4 as uuidv4 } from "uuid";
import nodemailer from "nodemailer";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendInvite({
  email,
  phone_number,
  invite_role,
  team_id,
  invited_by,
  is_admin = false,
  dbClient,
}) {
  const token = uuidv4();

  const validRoles = ["athlete", "clinician", "coach"];
  if (invite_role !== null && !validRoles.includes(invite_role)) {
    throw new Error("Invalid role type.");
  }

  const existing = await dbClient.query(
    `SELECT id FROM users WHERE email = $1 OR phone_number = $2`,
    [email, phone_number || null]
  );
  if (existing.rows.length > 0) {
    throw new Error("User with this email/phone already exists.");
  }

  let teamName = "Scotia Sense";
  if (team_id) {
    const teamResult = await dbClient.query(
      "SELECT name FROM teams WHERE id = $1",
      [team_id]
    );
    teamName = teamResult.rows[0]?.name || "your team";
  }

  await dbClient.query(
    `INSERT INTO invites (token, email, phone_number, invite_role, invited_by, team_id, is_admin)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      token,
      email,
      phone_number || null,
      invite_role,
      invited_by,
      team_id,
      is_admin,
    ]
  );

  const inviteLink = `${process.env.FRONTEND_URL}/register?invite=${token}`;
  const logoUrl = `${process.env.FRONTEND_URL}/images/scotia-biotech.png`;

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
    subject: `Scotia Sense Invite - ${capitalisedRole}`,
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${logoUrl}" style="max-height: 60px;" />
      </div>
      <h2 style="color: #2c3e50;">You're Invited!</h2>
      <p style="font-size: 16px; color: #333;">
        You’ve been invited to join <strong>${teamName}</strong> on <strong>Scotia Sense</strong> as ${article} <strong>${capitalisedRole}</strong>.
      </p>
      <p style="font-size: 16px; color: #333;">
        To accept the invitation and create your account, click the button below:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 12px 20px; border-radius: 5px; text-decoration: none; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 14px; color: #777;">
        If you didn’t expect this invite, you can ignore this email.
      </p>
      <hr style="margin: 40px 0;" />
      <p style="font-size: 13px; color: #aaa; text-align: center;">
        © ${new Date().getFullYear()} Scotia Biotech. All rights reserved.
      </p>
    </div>
  `,
  });

  if (phone_number?.startsWith("+")) {
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

  return { inviteLink };
}

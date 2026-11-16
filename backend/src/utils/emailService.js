import nodemailer from 'nodemailer';
import { httpError } from '../middlewares/errorHandler.js';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Send a 6-digit password-reset OTP to the user's registered email.
 */
export async function sendPasswordResetOtp({ to, name, otp }) {
  if (process.env.NODE_ENV === 'test') return;

  const transporter = createTransporter();
  if (!transporter) {
    if (process.env.NODE_ENV === 'production') {
      throw httpError(500, 'Email service is not configured.');
    }
    console.warn(`[emailService] SMTP not configured. Password reset OTP for ${to}: ${otp}`);
    return;
  }

  const from = process.env.SMTP_FROM || `"Chronicle Diary" <${process.env.SMTP_USER}>`;
  const greeting = name ? `Hi ${name},` : 'Hi,';

  await transporter.sendMail({
    from,
    to,
    subject: 'Your Chronicle Password Reset OTP',
    text: `${greeting}\n\nYour password reset OTP is: ${otp}\n\nThis code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #2c2520;">
        <h2 style="margin: 0 0 12px; font-size: 20px;">Reset your Chronicle password</h2>
        <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: #5c534c;">
          ${greeting} use the one-time verification code below to set a new password for your account.
        </p>
        <div style="background: #f7f3ee; border: 1px solid #e6ddd3; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #c4623c;">${otp}</span>
        </div>
        <p style="margin: 0; font-size: 13px; color: #7a7068;">
          This code expires in <strong>10 minutes</strong>. If you didn&apos;t request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

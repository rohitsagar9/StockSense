/**
 * ==============================================================================
 * FILE: src/lib/email.ts
 * PURPOSE: Email delivery service using Nodemailer.
 *          Sends OTP codes for password recovery.
 *          Gracefully falls back to console logging in development
 *          if SMTP credentials are not configured in .env.
 * ==============================================================================
 */

import nodemailer from "nodemailer";

/**
 * Creates a configured Nodemailer transporter.
 */
function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || user.includes("your-email")) {
    return null; // SMTP not fully configured
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Sends a one-time password (OTP) email to the user for account recovery.
 *
 * @param toEmail - Destination user email address
 * @param otp     - 6-digit verification code
 */
export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || "StockSense <noreply@stocksense.local>";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-bottom: 8px;">StockSense Password Reset</h2>
      <p style="color: #475569; font-size: 14px;">We received a request to reset your password. Use the following One-Time Password (OTP) to complete the verification:</p>
      <div style="margin: 24px 0; text-align: center;">
        <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 12px 24px; background: #f1f5f9; border-radius: 6px; color: #0284c7;">
          ${otp}
        </span>
      </div>
      <p style="color: #64748b; font-size: 13px;">This OTP will expire in <strong>15 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">StockSense Inventory Management System</p>
    </div>
  `;

  if (!transporter) {
    console.log("---------------------------------------------------------");
    console.log(`📨 [DEV MODE - SIMULATED EMAIL TO ${toEmail}]`);
    console.log(`🔐 StockSense Password Reset OTP: [ ${otp} ]`);
    console.log(`⏰ Valid for 15 minutes`);
    console.log("---------------------------------------------------------");
    return true;
  }

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: "Your StockSense Password Reset OTP",
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    // Return true in development so the flow doesn't break
    return process.env.NODE_ENV !== "production";
  }
}

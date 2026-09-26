/**
 * ==============================================================================
 * FILE: src/lib/otp.ts
 * PURPOSE: Logic for generating cryptographically secure 6-digit OTPs,
 *          hashing them, and validating them against expiration times.
 * ==============================================================================
 */

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { sendOtpEmail } from "./email";

/**
 * Generates a random 6-digit numeric string.
 */
export function generateNumericOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Creates and stores an OTP for a given user email, then triggers email sending.
 *
 * @param email - Target user email
 * @returns { success: boolean, message: string }
 */
export async function requestPasswordResetOtp(email: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    // Return success message regardless to prevent user email enumeration attack
    return {
      success: true,
      message: "If an account exists with this email, an OTP has been dispatched.",
    };
  }

  const rawOtp = generateNumericOtp();
  const hashedOtp = await bcrypt.hash(rawOtp, 10);
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  await db.user.update({
    where: { id: user.id },
    data: {
      otpCode: hashedOtp,
      otpExpiry: expiry,
    },
  });

  await sendOtpEmail(user.email, rawOtp);

  return {
    success: true,
    message: "If an account exists with this email, an OTP has been dispatched.",
    devOtp: process.env.NODE_ENV !== "production" ? rawOtp : undefined,
  };
}

/**
 * Validates an OTP code and updates the user's password if valid.
 */
export async function verifyOtpAndResetPassword(
  email: string,
  otpCode: string,
  newPassword: string
) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.otpCode || !user.otpExpiry) {
    return { success: false, error: "Invalid or expired OTP code." };
  }

  // Check expiration
  if (new Date() > user.otpExpiry) {
    return { success: false, error: "OTP code has expired. Please request a new one." };
  }

  // Verify bcrypt hash of OTP
  const isValid = await bcrypt.compare(otpCode.trim(), user.otpCode);
  if (!isValid) {
    return { success: false, error: "Incorrect OTP code. Please check and try again." };
  }

  // Hash new password and clear OTP fields
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otpCode: null,
      otpExpiry: null,
    },
  });

  return { success: true, message: "Password updated successfully. You can now login." };
}

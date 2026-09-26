/**
 * ==============================================================================
 * FILE: src/validators/auth.validators.ts
 * PURPOSE: Zod validation schemas for User Authentication and Password Recovery.
 * ==============================================================================
 */

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["MANAGER", "STAFF"]).default("STAFF"),
});

export const requestOtpSchema = z.object({
  email: z.string().email("Please provide a valid registered email address."),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address."),
  otpCode: z.string().length(6, "OTP must be exactly 6 digits."),
  newPassword: z.string().min(6, "New password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Please confirm your new password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

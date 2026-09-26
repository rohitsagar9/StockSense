/**
 * ==============================================================================
 * FILE: src/actions/auth.actions.ts
 * PURPOSE: Server Actions for User Registration, Password Reset with OTP,
 *          and Profile management.
 * ==============================================================================
 */

"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  signupSchema,
  requestOtpSchema,
  resetPasswordSchema,
  SignupInput,
  RequestOtpInput,
  ResetPasswordInput,
} from "@/validators/auth.validators";
import { requestPasswordResetOtp, verifyOtpAndResetPassword } from "@/lib/otp";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

/**
 * Registers a new system user.
 */
export async function signUpUser(data: SignupInput) {
  try {
    const validated = signupSchema.parse(data);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await db.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.toLowerCase().trim(),
        password: hashedPassword,
        role: validated.role,
      },
    });

    return {
      success: true,
      message: "Account created successfully! You can now log in.",
      userId: newUser.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to create account. Please try again.",
    };
  }
}

/**
 * Initiates OTP password recovery email.
 */
export async function sendOtpAction(data: RequestOtpInput) {
  try {
    const validated = requestOtpSchema.parse(data);
    const result = await requestPasswordResetOtp(validated.email);
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Could not dispatch reset code.",
    };
  }
}

/**
 * Verifies OTP and sets a new password.
 */
export async function resetPasswordAction(data: ResetPasswordInput) {
  try {
    const validated = resetPasswordSchema.parse(data);
    const result = await verifyOtpAndResetPassword(
      validated.email,
      validated.otpCode,
      validated.newPassword
    );
    return result;
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Failed to reset password.",
    };
  }
}

/**
 * Updates current authenticated user's name and/or password.
 */
export async function updateProfileAction(formData: {
  name: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  try {
    const currentUser = await requireAuth();

    if (!formData.name?.trim()) {
      return { success: false, error: "Name cannot be empty." };
    }

    const updateData: { name: string; password?: string } = {
      name: formData.name.trim(),
    };

    if (formData.newPassword) {
      if (!formData.currentPassword) {
        return { success: false, error: "Current password is required to set a new password." };
      }

      const user = await db.user.findUnique({
        where: { id: currentUser.id },
      });

      if (!user) {
        return { success: false, error: "User not found." };
      }

      const isMatch = await bcrypt.compare(formData.currentPassword, user.password);
      if (!isMatch) {
        return { success: false, error: "Current password is incorrect." };
      }

      updateData.password = await bcrypt.hash(formData.newPassword, 10);
    }

    await db.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    revalidatePath("/profile");
    return { success: true, message: "Profile updated successfully." };
  } catch (error: any) {
    return { success: false, error: error?.message || "Profile update failed." };
  }
}

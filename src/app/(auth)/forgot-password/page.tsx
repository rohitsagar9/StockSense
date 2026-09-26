/**
 * ==============================================================================
 * PAGE: Forgot Password (src/app/(auth)/forgot-password/page.tsx)
 * PURPOSE: Two-step OTP-based password recovery flow matching StockSense specs:
 *          Step 1: Request OTP code via registered email.
 *          Step 2: Enter 6-digit OTP and set new account password.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { sendOtpAction, resetPasswordAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Step 1: Request OTP, Step 2: Verify & Reset
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Step 1: Send OTP to email
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await sendOtpAction({ email });
      if (!res.success) {
        setError(res.error || "Failed to dispatch reset code.");
        setLoading(false);
        return;
      }

      setSuccessMessage(res.message);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setStep(2);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and update password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await resetPasswordAction({
        email,
        otpCode,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.error || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccessMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login?reset=success");
      }, 1500);
    } catch (err: any) {
      setError(err?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Reset Password
        </CardTitle>
        <CardDescription>
          {step === 1
            ? "Enter your registered email address to receive a 6-digit OTP code."
            : "Enter the 6-digit OTP code and choose your new password."}
        </CardDescription>
      </CardHeader>

      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Email
              </label>
              <Input
                type="email"
                required
                placeholder="manager@stocksense.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2 font-semibold shadow"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              <span>Send OTP Verification Code</span>
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </CardFooter>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* In local dev, show the OTP directly so developer is never stuck */}
            {devOtp && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
                <span className="font-bold">Dev Mode Simulated OTP: </span>
                <span className="font-mono text-sm font-bold bg-white px-2 py-0.5 rounded border border-blue-300">
                  {devOtp}
                </span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6-Digit OTP Code
              </label>
              <Input
                required
                maxLength={6}
                placeholder="123456"
                className="font-mono text-center text-lg tracking-widest"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full gap-2 font-semibold shadow"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              <span>Confirm & Reset Password</span>
            </Button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Use a different email address
            </button>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}

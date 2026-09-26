/**
 * ==============================================================================
 * PAGE: Login (src/app/(auth)/login/page.tsx)
 * PURPOSE: User authentication via NextAuth Credentials.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Login failed. Please verify your credentials.");
      setLoading(false);
    }
  };

  // Helper for 1-click demo login in local testing
  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Sign In to StockSense
        </CardTitle>
        <CardDescription>
          Enter your email and password to access the inventory system
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <Input
              type="email"
              required
              placeholder="manager@stocksense.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Quick Demo Logins Helper */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Quick Demo Fill:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin("manager@stocksense.com", "admin123")
                }
                className="text-[11px] font-semibold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded border border-blue-200 bg-white"
              >
                Manager Account
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin("staff@stocksense.com", "staff123")
                }
                className="text-[11px] font-semibold text-slate-700 hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 bg-white"
              >
                Staff Account
              </button>
            </div>
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
              <LogIn className="h-4 w-4" />
            )}
            <span>Sign In</span>
          </Button>

          <p className="text-center text-xs text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

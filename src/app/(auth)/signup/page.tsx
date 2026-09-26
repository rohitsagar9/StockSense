/**
 * ==============================================================================
 * PAGE: Sign Up (src/app/(auth)/signup/page.tsx)
 * PURPOSE: New user registration page.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpUser } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"MANAGER" | "STAFF">("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await signUpUser({
        name,
        email,
        password,
        role,
      });

      if (!res.success) {
        setError(res.error || "Registration failed.");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
          Create an Account
        </CardTitle>
        <CardDescription>
          Join StockSense to manage warehouses and inventory
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
              Full Name *
            </label>
            <Input
              required
              placeholder="e.g. Jordan Miller"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address *
            </label>
            <Input
              type="email"
              required
              placeholder="jordan@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password *
            </label>
            <Input
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              System Role *
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "MANAGER" | "STAFF")}
              aria-label="System Role"
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="STAFF">Warehouse Staff (Floor operations & transfers)</option>
              <option value="MANAGER">Inventory Manager (Full administrative authority)</option>
            </select>
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
              <UserPlus className="h-4 w-4" />
            )}
            <span>Register Account</span>
          </Button>

          <p className="text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * ==============================================================================
 * COMPONENT: ProfileForm (src/app/(dashboard)/profile/profile-form.tsx)
 * PURPOSE: Interactive form for updating user name and changing account password.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { updateProfileAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";

export function ProfileForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateProfileAction({
        name,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (!res.success) {
        setError(res.error || "Failed to update profile.");
        setLoading(false);
        return;
      }

      setSuccess("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-700 border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Full Name
        </label>
        <Input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Change Password (Optional)
        </h4>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Current Password
          </label>
          <Input
            type="password"
            placeholder="••••••••"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            New Password
          </label>
          <Input
            type="password"
            minLength={6}
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Changes...</span>
            </span>
          ) : (
            "Save Profile Changes"
          )}
        </Button>
      </div>
    </form>
  );
}

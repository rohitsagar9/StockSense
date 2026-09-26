/**
 * ==============================================================================
 * PAGE: User Profile (src/app/(dashboard)/profile/page.tsx)
 * PURPOSE: Manage account name and change user password.
 * ==============================================================================
 */

import { getSession } from "@/lib/auth-guard";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user as any;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          My Account Profile
        </h1>
        <p className="text-xs text-slate-500">
          View your system privileges and update your credentials
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                Account Information
              </CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
            <Badge variant="default" className="bg-blue-600 text-white font-bold">
              {user?.role || "STAFF"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileForm initialName={user?.name || ""} />
        </CardContent>
      </Card>
    </div>
  );
}

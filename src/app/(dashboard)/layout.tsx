/**
 * ==============================================================================
 * LAYOUT: Dashboard Shell (src/app/(dashboard)/layout.tsx)
 * PURPOSE: Authenticated layout containing the Sidebar, Header,
 *          and main workspace content area.
 * ==============================================================================
 */

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If unauthenticated, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as {
    name?: string;
    email?: string;
    role?: string;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Fixed Left Sidebar */}
      <Sidebar userRole={user.role} userName={user.name || "User"} />

      {/* Main Workspace (Offset by sidebar width: 64 = 16rem / 256px) */}
      <div className="pl-64 flex flex-col min-h-screen">
        <Header userName={user.name || "User"} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

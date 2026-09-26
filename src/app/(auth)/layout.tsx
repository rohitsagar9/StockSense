/**
 * ==============================================================================
 * LAYOUT: Auth Layout (src/app/(auth)/layout.tsx)
 * PURPOSE: Minimal centered wrapper for Login, Signup, and Password Reset.
 * ==============================================================================
 */

import { Boxes } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="mb-6 flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
          <Boxes className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            StockSense
          </h1>
          <p className="text-xs text-slate-500">
            Inventory Management System
          </p>
        </div>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}

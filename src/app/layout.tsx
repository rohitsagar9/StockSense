/**
 * ==============================================================================
 * ROOT LAYOUT (src/app/layout.tsx)
 * PURPOSE: Highest-level HTML wrapper for all Next.js routes and pages.
 * ==============================================================================
 */

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockSense - Modular Inventory Management System",
  description: "Real-time inventory management, stock ledger, and warehouse operations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}

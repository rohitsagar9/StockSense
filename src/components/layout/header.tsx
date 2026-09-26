/**
 * ==============================================================================
 * COMPONENT: Header (src/components/layout/header.tsx)
 * PURPOSE: Top bar component with breadcrumbs, quick links, and user context.
 * ==============================================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header({ userName = "User" }: { userName?: string }) {
  const pathname = usePathname();

  // Generate breadcrumb items from current URL path
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label, isLast: index === segments.length - 1 };
  });

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur">
      {/* Breadcrumb path */}
      <nav className="flex items-center space-x-1.5 text-sm">
        <Link
          href="/dashboard"
          className="font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          StockSense
        </Link>
        {breadcrumbs.map((crumb) => (
          <div key={crumb.href} className="flex items-center space-x-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            {crumb.isLast ? (
              <span className="font-semibold text-slate-900">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-slate-500 hover:text-slate-800 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Header Quick Actions */}
      <div className="flex items-center gap-3">
        <Link href="/products/new">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5" />
            <span>New Product</span>
          </Button>
        </Link>
        <Link href="/operations/receipts/new">
          <Button size="sm" variant="primary" className="gap-1.5 text-xs font-semibold">
            <Plus className="h-3.5 w-3.5" />
            <span>New Receipt</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}

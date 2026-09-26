/**
 * ==============================================================================
 * COMPONENT: EmptyState (src/components/shared/empty-state.tsx)
 * PURPOSE: Placeholder displayed when table or list queries return 0 items.
 * ==============================================================================
 */

import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center animate-in fade-in">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        <PackageOpen className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      {actionHref && actionLabel && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button size="sm" variant="primary">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

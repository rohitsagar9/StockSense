/**
 * ==============================================================================
 * COMPONENT: StatusBadge (src/components/shared/status-badge.tsx)
 * PURPOSE: Color-coded badge for Operation Status (Draft, Waiting, Ready, Done, Cancelled)
 *          and Operation Type (Receipt, Delivery, Transfer, Adjustment).
 * ==============================================================================
 */

import { STATUS_CONFIG, OPERATION_TYPE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase",
        config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface OperationTypeBadgeProps {
  type: string;
  className?: string;
}

export function OperationTypeBadge({ type, className }: OperationTypeBadgeProps) {
  const config = OPERATION_TYPE_CONFIG[type] || {
    label: type,
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        config.badgeClass,
        className
      )}
    >
      {config.label}
    </span>
  );
}

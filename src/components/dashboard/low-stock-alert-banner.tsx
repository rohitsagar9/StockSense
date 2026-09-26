/**
 * ==============================================================================
 * COMPONENT: LowStockAlertBanner (src/components/dashboard/low-stock-alert-banner.tsx)
 * PURPOSE: Attention banner showing products requiring immediate replenishment.
 * ==============================================================================
 */

import Link from "next/link";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LowStockAlertBannerProps {
  alerts: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    reorderLevel: number;
    reorderQty: number;
  }>;
}

export function LowStockAlertBanner({ alerts }: LowStockAlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-amber-900">
              Low Stock Warnings ({alerts.length} items need attention)
            </h4>
            <p className="mt-0.5 text-xs text-amber-700">
              The following products have breached reorder thresholds:{" "}
              {alerts.slice(0, 3).map((a, i) => (
                <span key={a.id} className="font-semibold">
                  {a.name} ({a.currentStock} left)
                  {i < Math.min(alerts.length, 3) - 1 ? ", " : ""}
                </span>
              ))}
              {alerts.length > 3 ? ` and ${alerts.length - 3} others.` : "."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/operations/receipts/new">
            <Button size="sm" variant="outline" className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100 text-xs font-semibold">
              Create Receipt
            </Button>
          </Link>
          <Link href="/products?lowStock=true">
            <Button size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700 text-xs font-semibold gap-1">
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

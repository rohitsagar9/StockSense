/**
 * ==============================================================================
 * COMPONENT: RecentActivity (src/components/dashboard/recent-activity.tsx)
 * PURPOSE: Activity stream showing the latest warehouse transactions and moves.
 * ==============================================================================
 */

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge, OperationTypeBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface RecentActivityProps {
  operations: Array<any>;
}

export function RecentActivity({ operations }: RecentActivityProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">
            Recent Operations
          </CardTitle>
          <CardDescription>Latest inventory activity across all warehouses</CardDescription>
        </div>
        <Link
          href="/operations/receipts"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {operations.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No recent operations matching your filter criteria.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {operations.map((op) => {
              // Determine detail route based on type
              let route = "/operations/receipts";
              if (op.type === "DELIVERY") route = "/operations/deliveries";
              if (op.type === "TRANSFER") route = "/operations/transfers";
              if (op.type === "ADJUSTMENT") route = "/operations/adjustments";

              return (
                <div
                  key={op.id}
                  className="flex items-center justify-between py-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`${route}/${op.id}`}
                        className="font-semibold text-sm text-blue-600 hover:underline"
                      >
                        {op.referenceNo}
                      </Link>
                      <OperationTypeBadge type={op.type} />
                    </div>
                    <p className="text-xs text-slate-500">
                      {op.partnerName ? `${op.partnerName} • ` : ""}
                      {formatDateTime(op.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={op.status} />
                    <p className="mt-1 text-[11px] text-slate-400">
                      {op.lines?.length || 0} line item(s)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

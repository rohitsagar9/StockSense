/**
 * ==============================================================================
 * PAGE: Stock Adjustments (src/app/(dashboard)/operations/adjustments/page.tsx)
 * PURPOSE: Lists all physical stock count audit adjustments and reconciliations.
 * ==============================================================================
 */

import Link from "next/link";
import { getOperations } from "@/actions/operation.actions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDateTime } from "@/lib/utils";
import { Plus, SlidersHorizontal } from "lucide-react";

interface AdjustmentsPageProps {
  searchParams: {
    search?: string;
    page?: string;
  };
}

export default async function AdjustmentsPage({ searchParams }: AdjustmentsPageProps) {
  const page = parseInt(searchParams.page || "1", 10);

  const { operations, pagination } = await getOperations({
    type: "ADJUSTMENT",
    search: searchParams.search,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Inventory Adjustments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fix mismatches between recorded ledger stock and physical count audits.
          </p>
        </div>

        <Link href="/operations/adjustments/new">
          <Button variant="primary" className="gap-1.5 shadow font-semibold bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            <span>New Stock Adjustment</span>
          </Button>
        </Link>
      </div>

      {operations.length === 0 ? (
        <EmptyState
          title="No Stock Adjustments Found"
          description="Perform an adjustment when physical counts differ from recorded counts."
          actionHref="/operations/adjustments/new"
          actionLabel="Perform Adjustment"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference No</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Adjustment Reason / Notes</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Performed By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => {
                const product = op.lines[0]?.product;
                const loc = op.sourceLocation?.type === "INTERNAL" ? op.sourceLocation : op.destLocation;

                return (
                  <TableRow key={op.id}>
                    <TableCell className="font-mono text-xs font-bold text-slate-800">
                      {op.referenceNo}
                    </TableCell>

                    <TableCell className="font-semibold text-xs text-slate-800">
                      {product ? (
                        <Link href={`/products/${product.id}`} className="hover:underline text-blue-600">
                          {product.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-slate-600">
                      {loc?.name || "Internal Stock"}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                      {op.notes || "Physical audit adjustment"}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(op.createdAt)}
                    </TableCell>

                    <TableCell className="text-xs text-slate-500">
                      {op.createdBy?.name || "Staff"}
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={op.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
          />
        </div>
      )}
    </div>
  );
}

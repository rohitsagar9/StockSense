/**
 * ==============================================================================
 * PAGE: Deliveries (Outgoing Goods) (src/app/(dashboard)/operations/deliveries/page.tsx)
 * PURPOSE: Lists all customer delivery orders.
 * ==============================================================================
 */

import Link from "next/link";
import { getOperations } from "@/actions/operation.actions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { Plus, ArrowUpFromLine, ChevronRight } from "lucide-react";
import { OperationStatus } from "@prisma/client";

interface DeliveriesPageProps {
  searchParams: {
    status?: OperationStatus;
    search?: string;
    page?: string;
  };
}

export default async function DeliveriesPage({ searchParams }: DeliveriesPageProps) {
  const page = parseInt(searchParams.page || "1", 10);

  const { operations, pagination } = await getOperations({
    type: "DELIVERY",
    status: searchParams.status,
    search: searchParams.search,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <ArrowUpFromLine className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Delivery Orders (Outgoing Stock)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Goods dispatched for customer shipments. Validating checks stock and reduces inventory.
          </p>
        </div>

        <Link href="/operations/deliveries/new">
          <Button variant="primary" className="gap-1.5 shadow font-semibold bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            <span>Create Delivery Order</span>
          </Button>
        </Link>
      </div>

      {operations.length === 0 ? (
        <EmptyState
          title="No Delivery Orders Found"
          description="Create a delivery order when packing and dispatching products to clients."
          actionHref="/operations/deliveries/new"
          actionLabel="Create Delivery Order"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference No</TableHead>
                <TableHead>Customer / Client</TableHead>
                <TableHead>Origin Dispatch Location</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead className="text-right">Items Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    <Link href={`/operations/deliveries/${op.id}`} className="hover:underline">
                      {op.referenceNo}
                    </Link>
                  </TableCell>

                  <TableCell className="font-medium text-xs text-slate-800">
                    {op.partnerName || "—"}
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    {op.sourceLocation?.name}
                    {op.sourceLocation?.warehouse && (
                      <span className="block font-mono text-[10px] text-slate-400">
                        {op.sourceLocation.warehouse.name}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-500">
                    {formatDate(op.scheduledDate || op.createdAt)}
                  </TableCell>

                  <TableCell className="text-right font-bold text-slate-900 text-xs">
                    {op.lines.length} line(s)
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={op.status} />
                  </TableCell>

                  <TableCell className="text-center">
                    <Link href={`/operations/deliveries/${op.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
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

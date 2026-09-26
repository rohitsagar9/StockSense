/**
 * ==============================================================================
 * PAGE: Internal Transfers (src/app/(dashboard)/operations/transfers/page.tsx)
 * PURPOSE: Lists internal relocation tasks between warehouses, racks, and bays.
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
import { Plus, ArrowLeftRight, ChevronRight, ArrowRight } from "lucide-react";
import { OperationStatus } from "@prisma/client";

interface TransfersPageProps {
  searchParams: {
    status?: OperationStatus;
    search?: string;
    page?: string;
  };
}

export default async function TransfersPage({ searchParams }: TransfersPageProps) {
  const page = parseInt(searchParams.page || "1", 10);

  const { operations, pagination } = await getOperations({
    type: "TRANSFER",
    status: searchParams.status,
    search: searchParams.search,
    page,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <ArrowLeftRight className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Internal Stock Transfers
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Move stock inside the company between facilities, racks, and production zones.
          </p>
        </div>

        <Link href="/operations/transfers/new">
          <Button variant="primary" className="gap-1.5 shadow font-semibold bg-sky-600 hover:bg-sky-700">
            <Plus className="h-4 w-4" />
            <span>Create Transfer</span>
          </Button>
        </Link>
      </div>

      {operations.length === 0 ? (
        <EmptyState
          title="No Internal Transfers Found"
          description="Schedule a transfer to move goods between warehouses or racks."
          actionHref="/operations/transfers/new"
          actionLabel="Schedule Transfer"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference No</TableHead>
                <TableHead>Source Location</TableHead>
                <TableHead className="w-8 text-center"></TableHead>
                <TableHead>Destination Location</TableHead>
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
                    <Link href={`/operations/transfers/${op.id}`} className="hover:underline">
                      {op.referenceNo}
                    </Link>
                  </TableCell>

                  <TableCell className="text-xs text-slate-800">
                    <span className="font-medium">{op.sourceLocation?.name}</span>
                    <span className="block font-mono text-[10px] text-slate-400">
                      {op.sourceLocation?.code}
                    </span>
                  </TableCell>

                  <TableCell className="text-center text-slate-400">
                    <ArrowRight className="h-3.5 w-3.5 mx-auto" />
                  </TableCell>

                  <TableCell className="text-xs text-slate-800">
                    <span className="font-medium">{op.destLocation?.name}</span>
                    <span className="block font-mono text-[10px] text-slate-400">
                      {op.destLocation?.code}
                    </span>
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
                    <Link href={`/operations/transfers/${op.id}`}>
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

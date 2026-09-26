/**
 * ==============================================================================
 * PAGE: Stock Ledger / Move History (src/app/(dashboard)/move-history/page.tsx)
 * PURPOSE: Complete audit trail and ledger of all stock relocations across all operations.
 * ==============================================================================
 */

import { getStockMoves } from "@/actions/move-history.actions";
import { MoveTable } from "@/components/move-history/move-table";
import { Pagination } from "@/components/shared/pagination";
import { History, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OperationType } from "@prisma/client";

interface MoveHistoryPageProps {
  searchParams: {
    search?: string;
    moveType?: OperationType;
    page?: string;
  };
}

export default async function MoveHistoryPage({ searchParams }: MoveHistoryPageProps) {
  const page = parseInt(searchParams.page || "1", 10);

  const { moves, pagination } = await getStockMoves({
    search: searchParams.search,
    moveType: searchParams.moveType,
    page,
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <History className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Stock Ledger (Move History)
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Immutable audit record of every item relocation, vendor receipt, customer delivery, and inventory adjustment.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <form className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search product, SKU, or operation ref..."
              className="h-9 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
            Filter Ledger
          </Button>
        </form>
      </div>

      {/* Table */}
      <MoveTable moves={moves} />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </div>
  );
}

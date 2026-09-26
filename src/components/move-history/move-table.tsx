/**
 * ==============================================================================
 * COMPONENT: MoveTable (src/components/move-history/move-table.tsx)
 * PURPOSE: Renders the immutable Stock Move Ledger (audit trail) table.
 * ==============================================================================
 */

import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { OperationTypeBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowRight, History } from "lucide-react";

interface MoveTableProps {
  moves: Array<{
    id: string;
    movedAt: Date | string;
    quantity: number;
    moveType: string;
    product: {
      id: string;
      name: string;
      sku: string;
      unitOfMeasure: string;
    };
    sourceLocation: {
      name: string;
      code: string;
      warehouse?: { name: string } | null;
    };
    destLocation: {
      name: string;
      code: string;
      warehouse?: { name: string } | null;
    };
    operation?: {
      id: string;
      referenceNo: string;
      type: string;
    } | null;
    movedBy?: {
      name: string;
    } | null;
  }>;
}

export function MoveTable({ moves }: MoveTableProps) {
  if (moves.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center bg-white">
        <History className="h-10 w-10 text-slate-300 mb-3" />
        <h3 className="text-sm font-semibold text-slate-700">No stock movements found</h3>
        <p className="mt-1 text-xs text-slate-400">
          Stock movements appear here automatically whenever receipts, deliveries, transfers, or adjustments are validated.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Product / SKU</TableHead>
            <TableHead>Move Type</TableHead>
            <TableHead>Origin Source</TableHead>
            <TableHead className="w-8 text-center"></TableHead>
            <TableHead>Destination Target</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Logged By</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {moves.map((move) => {
            let refHref = "/move-history";
            if (move.operation) {
              if (move.operation.type === "RECEIPT")
                refHref = `/operations/receipts/${move.operation.id}`;
              else if (move.operation.type === "DELIVERY")
                refHref = `/operations/deliveries/${move.operation.id}`;
              else if (move.operation.type === "TRANSFER")
                refHref = `/operations/transfers/${move.operation.id}`;
            }

            return (
              <TableRow key={move.id}>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDateTime(move.movedAt)}
                </TableCell>

                <TableCell>
                  <Link
                    href={`/products/${move.product.id}`}
                    className="font-semibold text-xs text-blue-600 hover:underline block"
                  >
                    {move.product.name}
                  </Link>
                  <span className="font-mono text-[10px] text-slate-400">
                    {move.product.sku}
                  </span>
                </TableCell>

                <TableCell>
                  <OperationTypeBadge type={move.moveType} />
                </TableCell>

                <TableCell className="text-xs text-slate-700">
                  <span className="font-medium">{move.sourceLocation.name}</span>
                  <span className="block font-mono text-[10px] text-slate-400">
                    {move.sourceLocation.code}
                  </span>
                </TableCell>

                <TableCell className="text-center text-slate-400">
                  <ArrowRight className="h-3.5 w-3.5 mx-auto" />
                </TableCell>

                <TableCell className="text-xs text-slate-700">
                  <span className="font-medium">{move.destLocation.name}</span>
                  <span className="block font-mono text-[10px] text-slate-400">
                    {move.destLocation.code}
                  </span>
                </TableCell>

                <TableCell className="text-right whitespace-nowrap font-bold text-slate-900 text-xs">
                  {move.quantity} {move.product.unitOfMeasure}
                </TableCell>

                <TableCell className="text-xs">
                  {move.operation ? (
                    <Link
                      href={refHref}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {move.operation.referenceNo}
                    </Link>
                  ) : (
                    <span className="text-slate-400 font-mono text-xs">—</span>
                  )}
                </TableCell>

                <TableCell className="text-xs text-slate-500">
                  {move.movedBy?.name || "System"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

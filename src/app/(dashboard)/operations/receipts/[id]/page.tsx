/**
 * ==============================================================================
 * PAGE: Receipt Details (src/app/(dashboard)/operations/receipts/[id]/page.tsx)
 * PURPOSE: Shows incoming receipt line items, vendor details, and validation actions.
 * ==============================================================================
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getOperationById } from "@/actions/operation.actions";
import { OperationDetailActions } from "@/components/operations/operation-detail-actions";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatDate } from "@/lib/utils";
import { ArrowLeft, ArrowDownToLine, CheckCircle2 } from "lucide-react";

interface ReceiptDetailPageProps {
  params: { id: string };
}

export default async function ReceiptDetailPage({ params }: ReceiptDetailPageProps) {
  const op = await getOperationById(params.id);

  if (!op || op.type !== "RECEIPT") {
    notFound();
  }

  const isDone = op.status === "DONE";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/operations/receipts">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                <ArrowDownToLine className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {op.referenceNo}
              </h1>
              <StatusBadge status={op.status} />
            </div>
            <p className="text-xs text-slate-500">
              Vendor: {op.partnerName} • Receiving Location: {op.destLocation?.name}
            </p>
          </div>
        </div>

        {/* Validation action trigger */}
        <OperationDetailActions id={op.id} type="RECEIPT" status={op.status} />
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Vendor / Supplier
          </span>
          <p className="mt-1 text-base font-bold text-slate-900">
            {op.partnerName || "—"}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Receiving Destination
          </span>
          <p className="mt-1 text-base font-bold text-slate-900">
            {op.destLocation?.name}
          </p>
          <span className="text-[11px] text-slate-400">
            {op.destLocation?.warehouse?.name || "Internal Facility"}
          </span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Scheduled Date
          </span>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {formatDate(op.scheduledDate || op.createdAt)}
          </p>
          {isDone && (
            <span className="text-[11px] text-emerald-600 font-medium">
              Completed {formatDate(op.completedDate)}
            </span>
          )}
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Created By
          </span>
          <p className="mt-1 text-sm font-bold text-slate-900">
            {op.createdBy?.name || "Warehouse Staff"}
          </p>
          <span className="text-[11px] text-slate-400">{formatDateTime(op.createdAt)}</span>
        </Card>
      </div>

      {op.notes && (
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Operation Notes: </span>
          {op.notes}
        </div>
      )}

      {/* Product Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Line Items to Receive
          </CardTitle>
          <CardDescription>
            Products arriving with this shipment and their expected quantities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Expected (Demand)</TableHead>
                <TableHead className="text-right">Received (Done)</TableHead>
                <TableHead className="w-16 text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {op.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>
                    <Link
                      href={`/products/${line.product.id}`}
                      className="font-semibold text-xs text-blue-600 hover:underline"
                    >
                      {line.product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {line.product.sku}
                  </TableCell>
                  <TableCell className="text-right font-medium text-xs text-slate-700">
                    {line.demandQty} {line.product.unitOfMeasure}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 text-xs">
                    {isDone ? line.doneQty : "—"} {line.product.unitOfMeasure}
                  </TableCell>
                  <TableCell className="text-center">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Received</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

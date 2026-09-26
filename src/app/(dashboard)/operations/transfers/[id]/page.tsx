/**
 * ==============================================================================
 * PAGE: Internal Transfer Details (src/app/(dashboard)/operations/transfers/[id]/page.tsx)
 * PURPOSE: Shows inter-warehouse transfer lines, route, and validation actions.
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
import { ArrowLeft, ArrowLeftRight, CheckCircle2, ArrowRight } from "lucide-react";

interface TransferDetailPageProps {
  params: { id: string };
}

export default async function TransferDetailPage({ params }: TransferDetailPageProps) {
  const op = await getOperationById(params.id);

  if (!op || op.type !== "TRANSFER") {
    notFound();
  }

  const isDone = op.status === "DONE";

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/operations/transfers">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-sky-100 text-sky-700">
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
                {op.referenceNo}
              </h1>
              <StatusBadge status={op.status} />
            </div>
            <p className="text-xs text-slate-500">
              Transfer: {op.sourceLocation?.name} → {op.destLocation?.name}
            </p>
          </div>
        </div>

        {/* Validation action trigger */}
        <OperationDetailActions id={op.id} type="TRANSFER" status={op.status} />
      </div>

      {/* Origin -> Destination Route Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Relocation Route
        </span>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              Source Location
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900">
              {op.sourceLocation?.name}
            </p>
            <span className="font-mono text-xs text-slate-400">
              {op.sourceLocation?.code} • {op.sourceLocation?.warehouse?.name || "Main Site"}
            </span>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mx-auto sm:mx-0">
            <ArrowRight className="h-5 w-5" />
          </div>

          <div className="flex-1 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5">
            <span className="text-[11px] font-bold uppercase text-slate-500">
              Destination Location
            </span>
            <p className="mt-0.5 text-base font-bold text-slate-900">
              {op.destLocation?.name}
            </p>
            <span className="font-mono text-xs text-slate-400">
              {op.destLocation?.code} • {op.destLocation?.warehouse?.name || "Main Site"}
            </span>
          </div>
        </div>
      </div>

      {op.notes && (
        <div className="rounded-lg border border-slate-200 bg-white p-3.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-800">Transfer Reason: </span>
          {op.notes}
        </div>
      )}

      {/* Product Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Products Transferred
          </CardTitle>
          <CardDescription>
            List of inventory items relocated between these locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product / Item</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Transfer Quantity</TableHead>
                <TableHead className="w-20 text-center">Status</TableHead>
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
                  <TableCell className="text-right font-bold text-slate-900 text-xs">
                    {line.demandQty} {line.product.unitOfMeasure}
                  </TableCell>
                  <TableCell className="text-center">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Relocated</span>
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

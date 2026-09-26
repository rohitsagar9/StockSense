/**
 * ==============================================================================
 * PAGE: Product Details (src/app/(dashboard)/products/[id]/page.tsx)
 * PURPOSE: Shows product specifications, stock breakdown per location,
 *          and item-specific move audit history.
 * ==============================================================================
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/actions/product.actions";
import { StockByLocation } from "@/components/products/stock-by-location";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { OperationTypeBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, ArrowDownToLine, ArrowLeftRight, SlidersHorizontal } from "lucide-react";

interface ProductDetailPageProps {
  params: { id: string };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Back button and title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/products">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {product.name}
              </h1>
              {product.isOutOfStock ? (
                <Badge variant="destructive">Out of Stock</Badge>
              ) : product.isLowStock ? (
                <Badge variant="warning">Low Stock</Badge>
              ) : (
                <Badge variant="success">In Stock</Badge>
              )}
            </div>
            <p className="font-mono text-xs text-slate-500">
              SKU: {product.sku} • Category: {product.category.name}
            </p>
          </div>
        </div>

        {/* Quick Operation Triggers */}
        <div className="flex items-center gap-2">
          <Link href="/operations/receipts/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-600" />
              <span>Receive</span>
            </Button>
          </Link>
          <Link href="/operations/transfers/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <ArrowLeftRight className="h-3.5 w-3.5 text-blue-600" />
              <span>Transfer</span>
            </Button>
          </Link>
          <Link href="/operations/adjustments/new">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-semibold">
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
              <span>Adjust</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Product Spec Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Total On-Hand
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {product.totalStock} {product.unitOfMeasure}
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Reorder Threshold
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {product.reorderLevel} {product.unitOfMeasure}
          </p>
          <span className="text-[11px] text-slate-400">Alert triggers at or below</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Target Reorder Qty
          </span>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {product.reorderQty} {product.unitOfMeasure}
          </p>
          <span className="text-[11px] text-slate-400">Suggested order batch</span>
        </Card>

        <Card className="p-4">
          <span className="text-xs font-semibold uppercase text-slate-400">
            Category
          </span>
          <p className="mt-1 text-lg font-bold text-slate-800">
            {product.category.name}
          </p>
          <span className="text-[11px] text-slate-400">
            {product.description || "No description provided"}
          </span>
        </Card>
      </div>

      {/* Stock Availability per Location */}
      <StockByLocation
        stockLevels={product.stockLevels}
        unitOfMeasure={product.unitOfMeasure}
      />

      {/* Product Move History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Recent Stock Moves for this Product
          </CardTitle>
          <CardDescription>
            Audit history of all inward, outward, and transfer movements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {product.stockMoves.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">
              No historical movements recorded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Move Type</TableHead>
                  <TableHead>From Location</TableHead>
                  <TableHead>To Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {product.stockMoves.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateTime(m.movedAt)}
                    </TableCell>
                    <TableCell>
                      <OperationTypeBadge type={m.moveType} />
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {m.sourceLocation.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700">
                      {m.destLocation.name}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 text-xs">
                      {m.quantity} {product.unitOfMeasure}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-blue-600">
                      {m.operation?.referenceNo || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

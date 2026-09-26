/**
 * ==============================================================================
 * COMPONENT: TransferForm (src/components/operations/transfer-form.tsx)
 * PURPOSE: Interactive form for Internal Stock Transfers between warehouses and racks.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTransfer } from "@/actions/operation.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { OperationLinesEditor, LineItem } from "./operation-lines-editor";
import { Loader2, ArrowRight } from "lucide-react";

interface TransferFormProps {
  products: Array<{ id: string; name: string; sku: string; unitOfMeasure: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
}

export function TransferForm({ products, locations }: TransferFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sourceLocationId, setSourceLocationId] = useState(locations[0]?.id || "");
  const [destLocationId, setDestLocationId] = useState(
    locations.length > 1 ? locations[1]?.id : locations[0]?.id || ""
  );
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineItem[]>(
    products.length > 0 ? [{ productId: products[0].id, demandQty: 10 }] : []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (sourceLocationId === destLocationId) {
      setError("Source and destination locations cannot be the same.");
      setLoading(false);
      return;
    }

    if (lines.length === 0) {
      setError("Please add at least one product item to transfer.");
      setLoading(false);
      return;
    }

    try {
      const res = await createTransfer({
        sourceLocationId,
        destLocationId,
        scheduledDate,
        notes,
        lines,
      });

      if (!res.success) {
        setError(res.error || "Failed to create transfer.");
        setLoading(false);
        return;
      }

      router.push(`/operations/transfers/${res.operationId}`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          Create Internal Transfer
        </CardTitle>
        <CardDescription>
          Relocate products between company warehouses, production floors, and storage zones.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Location Flow Indicator */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-11 sm:items-center">
              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source Origin Location *
                </label>
                <select
                  required
                  aria-label="Source Origin Location"
                  value={sourceLocationId}
                  onChange={(e) => setSourceLocationId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 flex justify-center py-2 sm:py-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              <div className="sm:col-span-5">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Destination Target Location *
                </label>
                <select
                  required
                  aria-label="Destination Target Location"
                  value={destLocationId}
                  onChange={(e) => setDestLocationId(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Transfer Date
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason / Transfer Notes
              </label>
              <Input
                placeholder="e.g. Replenish production floor rack"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <OperationLinesEditor
            products={products}
            lines={lines}
            onChange={setLines}
          />
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Scheduling...</span>
              </span>
            ) : (
              "Schedule Internal Transfer"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

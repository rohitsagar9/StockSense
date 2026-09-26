/**
 * ==============================================================================
 * COMPONENT: AdjustmentForm (src/components/operations/adjustment-form.tsx)
 * PURPOSE: Interactive form for physical stock audit reconciliations.
 *          Selects product and location, calculates delta against recorded count,
 *          and applies the adjustment immediately to the Stock Ledger.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAdjustment } from "@/actions/operation.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";

interface AdjustmentFormProps {
  products: Array<{ id: string; name: string; sku: string; unitOfMeasure: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
}

export function AdjustmentForm({ products, locations }: AdjustmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [productId, setProductId] = useState(products[0]?.id || "");
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [countedQty, setCountedQty] = useState(0);
  const [notes, setNotes] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createAdjustment({
        productId,
        locationId,
        countedQty,
        notes,
      });

      if (!res.success) {
        setError(res.error || "Failed to apply adjustment.");
        setLoading(false);
        return;
      }

      router.push("/operations/adjustments");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          Stock Discrepancy Adjustment
        </CardTitle>
        <CardDescription>
          Reconcile recorded inventory with actual physical audit counts. The system
          will automatically compute the delta and log an entry into the Stock Ledger.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Product to Adjust *
            </label>
            <select
              required
              aria-label="Select Product to Adjust"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} [{p.sku}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Storage Location *
            </label>
            <select
              required
              aria-label="Select Storage Location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.code})
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Physical Counted Quantity *
            </label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min={0}
                required
                value={countedQty}
                onChange={(e) =>
                  setCountedQty(parseInt(e.target.value, 10) || 0)
                }
                className="w-36 text-lg font-bold"
              />
              <span className="text-sm font-semibold text-slate-600">
                {selectedProduct?.unitOfMeasure || "Units"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              The recorded system quantity will be immediately updated to this exact number.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Audit Notes / Discrepancy Reason (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 3 kg steel rods damaged during handling / End of month physical stock count"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
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
                <span>Applying...</span>
              </span>
            ) : (
              "Apply Stock Adjustment"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

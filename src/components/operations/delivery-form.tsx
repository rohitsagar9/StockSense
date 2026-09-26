/**
 * ==============================================================================
 * COMPONENT: DeliveryForm (src/components/operations/delivery-form.tsx)
 * PURPOSE: Interactive form for creating customer Delivery Orders.
 *          Validating automatically verifies availability and deducts stock.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDelivery } from "@/actions/operation.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { OperationLinesEditor, LineItem } from "./operation-lines-editor";
import { Loader2 } from "lucide-react";

interface DeliveryFormProps {
  products: Array<{ id: string; name: string; sku: string; unitOfMeasure: string }>;
  locations: Array<{ id: string; name: string; code: string }>;
}

export function DeliveryForm({ products, locations }: DeliveryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [partnerName, setPartnerName] = useState("");
  const [sourceLocationId, setSourceLocationId] = useState(locations[0]?.id || "");
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

    if (lines.length === 0) {
      setError("Please add at least one product line to deliver.");
      setLoading(false);
      return;
    }

    try {
      const res = await createDelivery({
        partnerName,
        sourceLocationId,
        scheduledDate,
        notes,
        lines,
      });

      if (!res.success) {
        setError(res.error || "Failed to create delivery order.");
        setLoading(false);
        return;
      }

      router.push(`/operations/deliveries/${res.operationId}`);
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
          Create Outgoing Delivery Order
        </CardTitle>
        <CardDescription>
          Record shipments dispatched to customers. Validating will automatically decrease on-hand stock.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Name / Client *
              </label>
              <Input
                required
                placeholder="e.g. Acme Tech Workspace Inc."
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Source Location *
              </label>
              <select
                required
                aria-label="Dispatch Source Location"
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Scheduled Shipment Date
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sales Order / Tracking Reference
              </label>
              <Input
                placeholder="e.g. SO-4920 / Waybill #5591"
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
                <span>Creating...</span>
              </span>
            ) : (
              "Create Delivery Order"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * ==============================================================================
 * COMPONENT: OperationDetailActions (src/components/operations/operation-detail-actions.tsx)
 * PURPOSE: Action controls for Operation detail views (Validate, Cancel, Print).
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  validateReceipt,
  validateDelivery,
  validateTransfer,
  cancelOperation,
} from "@/actions/operation.actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Ban, Loader2 } from "lucide-react";

interface OperationDetailActionsProps {
  id: string;
  type: "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";
  status: string;
}

export function OperationDetailActions({
  id,
  type,
  status,
}: OperationDetailActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDone = status === "DONE";
  const isCancelled = status === "CANCELLED";

  const handleValidate = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;
      if (type === "RECEIPT") res = await validateReceipt(id);
      else if (type === "DELIVERY") res = await validateDelivery(id);
      else if (type === "TRANSFER") res = await validateTransfer(id);

      if (res && !res.success) {
        setError(res.error || "Validation failed.");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Validation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this operation?")) return;
    setLoading(true);
    setError(null);

    try {
      const res = await cancelOperation(id);
      if (!res.success) {
        setError(res.error || "Failed to cancel operation.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to cancel operation.");
    } finally {
      setLoading(false);
    }
  };

  if (isDone || isCancelled) {
    return null; // No actions needed for completed or cancelled operations
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          onClick={handleValidate}
          disabled={loading}
          variant="primary"
          className="bg-emerald-600 hover:bg-emerald-700 gap-1.5 font-semibold text-xs shadow"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="h-3.5 w-3.5" />
          )}
          <span>Validate & Update Stock</span>
        </Button>

        <Button
          onClick={handleCancel}
          disabled={loading}
          variant="outline"
          className="text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 text-xs font-medium"
        >
          <Ban className="h-3.5 w-3.5" />
          <span>Cancel Operation</span>
        </Button>
      </div>
    </div>
  );
}

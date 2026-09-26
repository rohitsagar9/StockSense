/**
 * ==============================================================================
 * PAGE: Create Warehouse (src/app/(dashboard)/settings/warehouses/new/page.tsx)
 * PURPOSE: Register a new physical warehouse facility.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWarehouse } from "@/actions/warehouse.actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function NewWarehousePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createWarehouse({
        name,
        code,
        address,
        isActive: true,
      });

      if (!res.success) {
        setError(res.error || "Failed to create warehouse.");
        setLoading(false);
        return;
      }

      router.push("/settings/warehouses");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          Create New Warehouse
        </CardTitle>
        <CardDescription>
          Register a physical storage site or regional distribution depot.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warehouse Name *
            </label>
            <Input
              required
              placeholder="e.g. East Coast Distribution Hub"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Warehouse Code *
            </label>
            <Input
              required
              placeholder="e.g. WH-EAST"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Address (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Street, City, State..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
                <span>Creating...</span>
              </span>
            ) : (
              "Save Warehouse"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

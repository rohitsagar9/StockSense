/**
 * ==============================================================================
 * COMPONENT: WarehouseClientView (src/app/(dashboard)/settings/warehouses/warehouse-client-view.tsx)
 * PURPOSE: Interactive view for warehouses with expandable locations and quick add-location dialog.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLocation } from "@/actions/warehouse.actions";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Warehouse, MapPin, Plus, Loader2 } from "lucide-react";

interface WarehouseClientViewProps {
  warehouses: Array<any>;
}

export function WarehouseClientView({ warehouses }: WarehouseClientViewProps) {
  const router = useRouter();

  // State for creating a sub-location
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [locName, setLocName] = useState("");
  const [locCode, setLocCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouseId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await createLocation({
        name: locName,
        code: locCode,
        warehouseId: selectedWarehouseId,
        type: "INTERNAL",
      });

      if (!res.success) {
        setError(res.error || "Failed to create location.");
        setLoading(false);
        return;
      }

      setLocName("");
      setLocCode("");
      setSelectedWarehouseId(null);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal / Inline form for adding location */}
      {selectedWarehouseId && (
        <Card className="border-blue-200 bg-blue-50/40 p-4 shadow-sm animate-in fade-in">
          <form onSubmit={handleCreateLocation} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900">
                Add Sub-Location to Warehouse
              </h4>
              <button
                type="button"
                onClick={() => setSelectedWarehouseId(null)}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>

            {error && (
              <div className="rounded bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location / Zone Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Shelf B-12 / Assembly Line"
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Location Code *
                </label>
                <Input
                  required
                  placeholder="e.g. WH1/SHELF-B12"
                  value={locCode}
                  onChange={(e) => setLocCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedWarehouseId(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={loading}>
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Location"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Warehouse Cards */}
      <div className="space-y-6">
        {warehouses.map((wh) => (
          <Card key={wh.id} className="shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/75 border-b border-slate-200 py-4 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Warehouse className="h-4 w-4 text-blue-600" />
                  <CardTitle className="text-base font-bold text-slate-900">
                    {wh.name}
                  </CardTitle>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                    {wh.code}
                  </span>
                  <Badge variant={wh.isActive ? "success" : "secondary"}>
                    {wh.isActive ? "Active" : "Archived"}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  {wh.address || "No physical address provided"} • {wh.locations.length} sub-locations
                </CardDescription>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedWarehouseId(wh.id);
                  setLocCode(`${wh.code}/`);
                }}
                className="gap-1.5 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Sub-Location</span>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {wh.locations.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No internal storage locations defined for this warehouse yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Location Type</TableHead>
                      <TableHead className="text-right">Tracked Items</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wh.locations.map((loc: any) => (
                      <TableRow key={loc.id}>
                        <TableCell className="font-medium text-xs text-slate-800">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span>{loc.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {loc.code}
                        </TableCell>
                        <TableCell>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {loc.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900 text-xs">
                          {loc._count.stockLevels} product(s) stocked
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

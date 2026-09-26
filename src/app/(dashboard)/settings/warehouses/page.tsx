/**
 * ==============================================================================
 * PAGE: Warehouses & Locations (src/app/(dashboard)/settings/warehouses/page.tsx)
 * PURPOSE: Manage company warehouses and sub-locations (racks, shelves, bays).
 * ==============================================================================
 */

import Link from "next/link";
import { getWarehouses } from "@/actions/warehouse.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Warehouse, MapPin } from "lucide-react";
import { WarehouseClientView } from "./warehouse-client-view";

export default async function WarehousesPage() {
  const warehouses = await getWarehouses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Warehouse className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Warehouses & Locations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-warehouse hierarchy, distribution hubs, storage racks, and production zones.
          </p>
        </div>

        <Link href="/settings/warehouses/new">
          <Button variant="primary" className="gap-1.5 shadow font-semibold">
            <Plus className="h-4 w-4" />
            <span>Add New Warehouse</span>
          </Button>
        </Link>
      </div>

      <WarehouseClientView warehouses={warehouses} />
    </div>
  );
}

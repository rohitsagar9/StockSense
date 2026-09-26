/**
 * ==============================================================================
 * COMPONENT: DashboardFilterBar (src/components/dashboard/dashboard-filter-bar.tsx)
 * PURPOSE: Interactive filter toolbar matching StockSense specifications:
 *          - By Document Type: Receipts / Delivery / Internal / Adjustments
 *          - By Status: Draft, Waiting, Ready, Done, Cancelled
 *          - By Warehouse / Location
 *          - By Product Category
 * ==============================================================================
 */

"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardFilterBarProps {
  warehouses: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
}

export function DashboardFilterBar({ warehouses, categories }: DashboardFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentWarehouse = searchParams.get("warehouseId") || "";
  const currentCategory = searchParams.get("categoryId") || "";

  const hasFilters = Boolean(currentType || currentStatus || currentWarehouse || currentCategory);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset page on filter change
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200">
        <Filter className="h-3.5 w-3.5" />
        <span>Filters</span>
      </div>

      {/* Document Type Filter */}
      <select
        value={currentType}
        onChange={(e) => updateParam("type", e.target.value)}
        aria-label="Filter by Document Type"
        className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        <option value="">All Document Types</option>
        <option value="RECEIPT">Receipts (Incoming)</option>
        <option value="DELIVERY">Delivery Orders (Outgoing)</option>
        <option value="TRANSFER">Internal Transfers</option>
        <option value="ADJUSTMENT">Stock Adjustments</option>
      </select>

      {/* Status Filter */}
      <select
        value={currentStatus}
        onChange={(e) => updateParam("status", e.target.value)}
        aria-label="Filter by Status"
        className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        <option value="">All Statuses</option>
        <option value="DRAFT">Draft</option>
        <option value="WAITING">Waiting</option>
        <option value="READY">Ready</option>
        <option value="DONE">Done</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {/* Warehouse Filter */}
      <select
        value={currentWarehouse}
        onChange={(e) => updateParam("warehouseId", e.target.value)}
        aria-label="Filter by Warehouse"
        className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        <option value="">All Warehouses</option>
        {warehouses.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name}
          </option>
        ))}
      </select>

      {/* Product Category Filter */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam("categoryId", e.target.value)}
        aria-label="Filter by Product Category"
        className="h-8 rounded-md border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Clear Filters Button */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="h-8 gap-1 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 ml-auto"
        >
          <X className="h-3.5 w-3.5" />
          <span>Reset</span>
        </Button>
      )}
    </div>
  );
}

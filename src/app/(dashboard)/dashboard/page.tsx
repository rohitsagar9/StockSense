/**
 * ==============================================================================
 * PAGE: Inventory Dashboard (src/app/(dashboard)/dashboard/page.tsx)
 * PURPOSE: Core landing view providing real-time inventory KPIs, low stock alerts,
 *          product distribution chart, dynamic multi-attribute filters, and recent operations.
 * ==============================================================================
 */

import { getDashboardKPIs, getDashboardRecentOperations } from "@/actions/dashboard.actions";
import { getWarehouses } from "@/actions/warehouse.actions";
import { getCategories } from "@/actions/category.actions";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { LowStockAlertBanner } from "@/components/dashboard/low-stock-alert-banner";
import { StockChart } from "@/components/dashboard/stock-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DashboardFilterBar } from "@/components/dashboard/dashboard-filter-bar";
import { OperationType, OperationStatus } from "@prisma/client";

interface DashboardPageProps {
  searchParams: {
    type?: OperationType;
    status?: OperationStatus;
    warehouseId?: string;
    categoryId?: string;
  };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [data, warehouses, categories, filteredOperations] = await Promise.all([
    getDashboardKPIs(),
    getWarehouses(),
    getCategories(),
    getDashboardRecentOperations({
      type: searchParams.type,
      status: searchParams.status,
      warehouseId: searchParams.warehouseId,
      categoryId: searchParams.categoryId,
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Inventory Dashboard
        </h1>
        <p className="text-xs text-slate-500">
          Real-time snapshot of on-hand catalog stock, operations, and logistics activity
        </p>
      </div>

      {/* Low Stock Warning Banner */}
      <LowStockAlertBanner alerts={data.lowStockAlerts} />

      {/* KPI Metric Cards */}
      <KpiGrid kpis={data.kpis} />

      {/* Dynamic Multi-Attribute Filter Toolbar */}
      <DashboardFilterBar warehouses={warehouses} categories={categories} />

      {/* Charts & Operations Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <StockChart data={data.chartData} />
        <RecentActivity operations={filteredOperations} />
      </div>
    </div>
  );
}

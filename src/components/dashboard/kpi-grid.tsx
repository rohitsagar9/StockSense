/**
 * ==============================================================================
 * COMPONENT: KpiGrid (src/components/dashboard/kpi-grid.tsx)
 * PURPOSE: Grid of Key Performance Indicator cards requested in StockSense spec:
 *          - Total Products in Stock
 *          - Low Stock / Out of Stock Items
 *          - Pending Receipts
 *          - Pending Deliveries
 *          - Internal Transfers Scheduled
 * ==============================================================================
 */

import { Card, CardContent } from "@/components/ui/card";
import {
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";

interface KpiGridProps {
  kpis: {
    totalProductsCatalog: number;
    totalProductsInStock: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    scheduledTransfers: number;
  };
}

export function KpiGrid({ kpis }: KpiGridProps) {
  const cards = [
    {
      title: "In Stock Products",
      value: kpis.totalProductsInStock,
      subtitle: `${kpis.totalProductsCatalog} Total in Catalog`,
      icon: Boxes,
      iconBg: "bg-blue-100 text-blue-700",
      href: "/products",
    },
    {
      title: "Low / Out of Stock",
      value: kpis.lowStockCount + kpis.outOfStockCount,
      subtitle: `${kpis.outOfStockCount} critical (0 stock)`,
      icon: AlertTriangle,
      iconBg:
        kpis.lowStockCount + kpis.outOfStockCount > 0
          ? "bg-rose-100 text-rose-700"
          : "bg-slate-100 text-slate-600",
      href: "/products?lowStock=true",
    },
    {
      title: "Pending Receipts",
      value: kpis.pendingReceipts,
      subtitle: "Awaiting incoming validation",
      icon: ArrowDownToLine,
      iconBg: "bg-emerald-100 text-emerald-700",
      href: "/operations/receipts",
    },
    {
      title: "Pending Deliveries",
      value: kpis.pendingDeliveries,
      subtitle: "Awaiting customer shipment",
      icon: ArrowUpFromLine,
      iconBg: "bg-purple-100 text-purple-700",
      href: "/operations/deliveries",
    },
    {
      title: "Internal Transfers",
      value: kpis.scheduledTransfers,
      subtitle: "Scheduled relocation tasks",
      icon: ArrowLeftRight,
      iconBg: "bg-sky-100 text-sky-700",
      href: "/operations/transfers",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Link key={c.title} href={c.href} className="group block">
            <Card className="transition-all hover:border-blue-400 hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {c.title}
                  </span>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.iconBg}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                    {c.value}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{c.subtitle}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * ==============================================================================
 * FILE: src/actions/dashboard.actions.ts
 * PURPOSE: Aggregates real-time inventory KPIs, low stock alerts,
 *          pending operation counts, and charts data for the dashboard landing view.
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import { OperationType, OperationStatus } from "@prisma/client";

/**
 * Computes high-level Key Performance Indicators for the dashboard.
 */
export async function getDashboardKPIs() {
  const [
    allProducts,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
    recentMoves,
  ] = await Promise.all([
    // Fetch products with their current stock levels
    db.product.findMany({
      include: {
        stockLevels: true,
        category: true,
      },
    }),

    // Pending Receipts (Draft, Waiting, Ready)
    db.operation.count({
      where: {
        type: "RECEIPT",
        status: { in: ["DRAFT", "WAITING", "READY"] },
      },
    }),

    // Pending Deliveries (Draft, Waiting, Ready)
    db.operation.count({
      where: {
        type: "DELIVERY",
        status: { in: ["DRAFT", "WAITING", "READY"] },
      },
    }),

    // Scheduled Internal Transfers
    db.operation.count({
      where: {
        type: "TRANSFER",
        status: { in: ["DRAFT", "WAITING", "READY"] },
      },
    }),

    // Recent stock moves
    db.stockMove.findMany({
      take: 6,
      orderBy: { movedAt: "desc" },
      include: {
        product: true,
        sourceLocation: true,
        destLocation: true,
      },
    }),
  ]);

  let totalProductsInStock = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const lowStockAlerts: Array<{
    id: string;
    name: string;
    sku: string;
    currentStock: number;
    reorderLevel: number;
    reorderQty: number;
  }> = [];

  const chartData: Array<{ name: string; stock: number; reorder: number }> = [];

  for (const p of allProducts) {
    const currentStock = p.stockLevels.reduce((acc, sl) => acc + sl.quantity, 0);

    if (currentStock > 0) {
      totalProductsInStock += 1;
    }

    if (currentStock === 0) {
      outOfStockCount += 1;
      lowStockAlerts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock,
        reorderLevel: p.reorderLevel,
        reorderQty: p.reorderQty,
      });
    } else if (currentStock <= p.reorderLevel) {
      lowStockCount += 1;
      lowStockAlerts.push({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock,
        reorderLevel: p.reorderLevel,
        reorderQty: p.reorderQty,
      });
    }

    // Add to chart display (first 10 products)
    if (chartData.length < 10) {
      chartData.push({
        name: p.name.length > 16 ? p.name.slice(0, 16) + "…" : p.name,
        stock: currentStock,
        reorder: p.reorderLevel,
      });
    }
  }

  return {
    kpis: {
      totalProductsCatalog: allProducts.length,
      totalProductsInStock,
      lowStockCount,
      outOfStockCount,
      pendingReceipts,
      pendingDeliveries,
      scheduledTransfers,
    },
    lowStockAlerts,
    chartData,
    recentMoves,
  };
}

/**
 * Filtered operations feed for dashboard live view.
 */
export async function getDashboardRecentOperations(options: {
  type?: OperationType;
  status?: OperationStatus;
  warehouseId?: string;
  categoryId?: string;
}) {
  const whereClause: any = {};
  if (options.type) whereClause.type = options.type;
  if (options.status) whereClause.status = options.status;

  if (options.warehouseId) {
    whereClause.OR = [
      { sourceLocation: { warehouseId: options.warehouseId } },
      { destLocation: { warehouseId: options.warehouseId } },
    ];
  }

  if (options.categoryId) {
    whereClause.lines = {
      some: {
        product: {
          categoryId: options.categoryId,
        },
      },
    };
  }

  return await db.operation.findMany({
    where: whereClause,
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      sourceLocation: { select: { name: true } },
      destLocation: { select: { name: true } },
      lines: {
        include: {
          product: { select: { name: true, sku: true } },
        },
      },
    },
  });
}

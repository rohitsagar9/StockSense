/**
 * ==============================================================================
 * FILE: src/actions/move-history.actions.ts
 * PURPOSE: Queries and filters the immutable Stock Move Ledger (audit log).
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import { OperationType } from "@prisma/client";

interface GetStockMovesOptions {
  productId?: string;
  locationId?: string;
  moveType?: OperationType;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieves paginated stock movement audit records with rich location and operator details.
 */
export async function getStockMoves(options: GetStockMovesOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (options.productId) whereClause.productId = options.productId;
  if (options.moveType) whereClause.moveType = options.moveType;

  if (options.locationId) {
    whereClause.OR = [
      { sourceLocationId: options.locationId },
      { destLocationId: options.locationId },
    ];
  }

  if (options.search?.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { product: { name: { contains: q, mode: "insensitive" } } },
      { product: { sku: { contains: q, mode: "insensitive" } } },
      { operation: { referenceNo: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [totalCount, moves] = await Promise.all([
    db.stockMove.count({ where: whereClause }),
    db.stockMove.findMany({
      where: whereClause,
      include: {
        product: { select: { id: true, name: true, sku: true, unitOfMeasure: true } },
        sourceLocation: {
          select: { id: true, name: true, code: true, warehouse: { select: { name: true } } },
        },
        destLocation: {
          select: { id: true, name: true, code: true, warehouse: { select: { name: true } } },
        },
        operation: { select: { id: true, referenceNo: true, type: true } },
        movedBy: { select: { id: true, name: true } },
      },
      orderBy: { movedAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    moves,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

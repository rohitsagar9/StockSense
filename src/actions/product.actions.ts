/**
 * ==============================================================================
 * FILE: src/actions/product.actions.ts
 * PURPOSE: Server Actions for Product Catalog management and stock queries.
 *          Product registration and deletion are restricted to Managers.
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import { productSchema, ProductInput } from "@/validators/product.validators";
import { requireAuth, requireManager } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  lowStockOnly?: boolean;
}

/**
 * Retrieves a paginated list of catalog products with current total stock calculation.
 */
export async function getProducts(options: GetProductsOptions = {}) {
  await requireAuth();
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 15));
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (options.search?.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (options.categoryId) {
    whereClause.categoryId = options.categoryId;
  }

  const [totalCount, rawProducts] = await Promise.all([
    db.product.count({ where: whereClause }),
    db.product.findMany({
      where: whereClause,
      include: {
        category: true,
        stockLevels: {
          include: {
            location: {
              include: { warehouse: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
      skip,
      take: limit,
    }),
  ]);

  // Calculate aggregated on-hand quantities for each product
  const products = rawProducts.map((p) => {
    const totalStock = p.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);
    const isLowStock = totalStock <= p.reorderLevel;
    const isOutOfStock = totalStock <= 0;
    return {
      ...p,
      totalStock,
      isLowStock,
      isOutOfStock,
    };
  });

  // Filter low stock in-memory if requested
  const filtered = options.lowStockOnly
    ? products.filter((p) => p.isLowStock)
    : products;

  return {
    products: filtered,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Lightweight helper to fetch active products for dropdown pickers.
 */
export async function getProductsSimple() {
  await requireAuth();
  return await db.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      unitOfMeasure: true,
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Retrieves a single product with full location breakdown and stock ledger history.
 */
export async function getProductById(id: string) {
  await requireAuth();
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: true,
      stockLevels: {
        include: {
          location: {
            include: { warehouse: true },
          },
        },
      },
      stockMoves: {
        include: {
          sourceLocation: true,
          destLocation: true,
          movedBy: { select: { name: true } },
          operation: { select: { referenceNo: true } },
        },
        orderBy: { movedAt: "desc" },
        take: 25,
      },
    },
  });

  if (!product) return null;

  const totalStock = product.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);

  return {
    ...product,
    totalStock,
    isLowStock: totalStock <= product.reorderLevel,
    isOutOfStock: totalStock <= 0,
  };
}

/**
 * Creates a new product and optionally provisions initial stock. (Manager Exclusive)
 */
export async function createProduct(data: ProductInput) {
  try {
    const manager = await requireManager();
    const validated = productSchema.parse(data);

    const existingSku = await db.product.findUnique({
      where: { sku: validated.sku.trim().toUpperCase() },
    });
    if (existingSku) {
      return { success: false, error: "SKU code already exists. Please choose a unique SKU." };
    }

    // Execute in a transaction to handle product creation + initial stock atomically
    const product = await db.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: validated.name.trim(),
          sku: validated.sku.trim().toUpperCase(),
          description: validated.description?.trim() || null,
          categoryId: validated.categoryId,
          unitOfMeasure: validated.unitOfMeasure.trim(),
          reorderLevel: validated.reorderLevel,
          reorderQty: validated.reorderQty,
        },
      });

      // If initial stock was provided, create StockLevel and initial stock ledger entry
      if (
        validated.initialStock !== undefined &&
        validated.initialStock > 0 &&
        validated.initialLocationId
      ) {
        await tx.stockLevel.create({
          data: {
            productId: p.id,
            locationId: validated.initialLocationId,
            quantity: validated.initialStock,
          },
        });

        // Find or create virtual vendor location for initial stock move record
        let vendorLoc = await tx.location.findFirst({
          where: { type: "VENDOR" },
        });

        if (!vendorLoc) {
          vendorLoc = await tx.location.create({
            data: {
              name: "Initial Inventory Setup",
              code: "VIRTUAL/SETUP",
              type: "VENDOR",
            },
          });
        }

        await tx.stockMove.create({
          data: {
            productId: p.id,
            sourceLocationId: vendorLoc.id,
            destLocationId: validated.initialLocationId,
            quantity: validated.initialStock,
            moveType: "RECEIPT",
            movedById: manager.id,
          },
        });
      }

      return p;
    });

    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create product." };
  }
}

/**
 * Updates product details and reorder thresholds. (Manager Exclusive for safety thresholds)
 */
export async function updateProduct(id: string, data: ProductInput) {
  try {
    await requireManager();
    const validated = productSchema.parse(data);

    const existingSku = await db.product.findFirst({
      where: {
        sku: validated.sku.trim().toUpperCase(),
        NOT: { id },
      },
    });

    if (existingSku) {
      return { success: false, error: "Another product already uses this SKU." };
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        sku: validated.sku.trim().toUpperCase(),
        description: validated.description?.trim() || null,
        categoryId: validated.categoryId,
        unitOfMeasure: validated.unitOfMeasure.trim(),
        reorderLevel: validated.reorderLevel,
        reorderQty: validated.reorderQty,
      },
    });

    revalidatePath(`/products/${id}`);
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, product };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update product." };
  }
}

/**
 * Deletes a product if it has no completed moves or operations. (Manager Exclusive)
 */
export async function deleteProduct(id: string) {
  try {
    await requireManager();
    const movesCount = await db.stockMove.count({ where: { productId: id } });
    if (movesCount > 0) {
      return {
        success: false,
        error: `Cannot delete product: It has ${movesCount} historical stock movements recorded in the ledger.`,
      };
    }

    await db.product.delete({ where: { id } });
    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete product." };
  }
}

/**
 * ==============================================================================
 * FILE: src/actions/operation.actions.ts
 * PURPOSE: Core Inventory Operations business logic:
 *          - Receipts (Incoming vendor stock)
 *          - Delivery Orders (Outgoing customer stock)
 *          - Internal Transfers (Inter-warehouse & inter-location relocation)
 *          - Inventory Adjustments (Physical count reconciliation)
 *          All validation updates run inside atomic Prisma transactions.
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import {
  receiptSchema,
  deliverySchema,
  transferSchema,
  adjustmentSchema,
  ReceiptInput,
  DeliveryInput,
  TransferInput,
  AdjustmentInput,
} from "@/validators/operation.validators";
import { requireAuth } from "@/lib/auth-guard";
import { generateReference } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { OperationType, OperationStatus } from "@prisma/client";

interface GetOperationsOptions {
  type?: OperationType;
  status?: OperationStatus;
  warehouseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Retrieves a filtered and paginated list of inventory operations.
 */
export async function getOperations(options: GetOperationsOptions = {}) {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 15));
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (options.type) whereClause.type = options.type;
  if (options.status) whereClause.status = options.status;

  if (options.search?.trim()) {
    const q = options.search.trim();
    whereClause.OR = [
      { referenceNo: { contains: q, mode: "insensitive" } },
      { partnerName: { contains: q, mode: "insensitive" } },
      { notes: { contains: q, mode: "insensitive" } },
    ];
  }

  if (options.warehouseId) {
    whereClause.OR = [
      { sourceLocation: { warehouseId: options.warehouseId } },
      { destLocation: { warehouseId: options.warehouseId } },
    ];
  }

  const [totalCount, operations] = await Promise.all([
    db.operation.count({ where: whereClause }),
    db.operation.findMany({
      where: whereClause,
      include: {
        sourceLocation: { include: { warehouse: true } },
        destLocation: { include: { warehouse: true } },
        createdBy: { select: { name: true, email: true } },
        lines: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
  ]);

  return {
    operations,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

/**
 * Retrieves a single operation by ID with lines and stock moves.
 */
export async function getOperationById(id: string) {
  return await db.operation.findUnique({
    where: { id },
    include: {
      sourceLocation: { include: { warehouse: true } },
      destLocation: { include: { warehouse: true } },
      createdBy: { select: { name: true, email: true } },
      lines: {
        include: {
          product: {
            include: {
              stockLevels: true,
            },
          },
        },
      },
      stockMoves: {
        include: {
          product: true,
          sourceLocation: true,
          destLocation: true,
          movedBy: { select: { name: true } },
        },
        orderBy: { movedAt: "desc" },
      },
    },
  });
}

// ------------------------------------------------------------------------------
// RECEIPTS (Incoming Stock)
// ------------------------------------------------------------------------------

/**
 * Creates a new incoming goods Receipt (status: READY).
 */
export async function createReceipt(data: ReceiptInput) {
  try {
    const user = await requireAuth();
    const validated = receiptSchema.parse(data);

    // Get or create virtual vendor location
    let vendorLoc = await db.location.findFirst({ where: { type: "VENDOR" } });
    if (!vendorLoc) {
      vendorLoc = await db.location.create({
        data: {
          name: "Vendor Locations",
          code: "VIRTUAL/VENDOR",
          type: "VENDOR",
        },
      });
    }

    const ref = generateReference("REC");

    const receipt = await db.operation.create({
      data: {
        referenceNo: ref,
        type: "RECEIPT",
        status: "READY",
        sourceLocationId: vendorLoc.id,
        destLocationId: validated.destLocationId,
        partnerName: validated.partnerName.trim(),
        notes: validated.notes?.trim() || null,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : new Date(),
        createdById: user.id,
        lines: {
          create: validated.lines.map((l) => ({
            productId: l.productId,
            demandQty: l.demandQty,
            doneQty: l.demandQty, // Default done to demand
          })),
        },
      },
    });

    revalidatePath("/operations/receipts");
    revalidatePath("/dashboard");
    return { success: true, operationId: receipt.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create receipt." };
  }
}

/**
 * Validates a Receipt:
 * - Updates StockLevel for all products at destination location (+doneQty)
 * - Writes immutable entries into the StockMove ledger
 * - Updates operation status to DONE
 */
export async function validateReceipt(id: string) {
  try {
    const user = await requireAuth();

    const op = await db.operation.findUnique({
      where: { id },
      include: { lines: true },
    });

    if (!op || op.type !== "RECEIPT") {
      return { success: false, error: "Receipt not found." };
    }

    if (op.status === "DONE") {
      return { success: false, error: "Receipt has already been validated." };
    }

    if (!op.destLocationId) {
      return { success: false, error: "Destination location is missing." };
    }

    await db.$transaction(async (tx) => {
      // 1. Process each line item
      for (const line of op.lines) {
        const qtyToAdd = line.doneQty > 0 ? line.doneQty : line.demandQty;

        // Upsert destination StockLevel
        const existingStock = await tx.stockLevel.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: op.destLocationId!,
            },
          },
        });

        if (existingStock) {
          await tx.stockLevel.update({
            where: { id: existingStock.id },
            data: { quantity: existingStock.quantity + qtyToAdd },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              productId: line.productId,
              locationId: op.destLocationId!,
              quantity: qtyToAdd,
            },
          });
        }

        // Update line item doneQty
        await tx.operationLine.update({
          where: { id: line.id },
          data: { doneQty: qtyToAdd },
        });

        // Record stock ledger move
        await tx.stockMove.create({
          data: {
            operationId: op.id,
            operationLineId: line.id,
            productId: line.productId,
            sourceLocationId: op.sourceLocationId!,
            destLocationId: op.destLocationId!,
            quantity: qtyToAdd,
            moveType: "RECEIPT",
            movedById: user.id,
          },
        });
      }

      // 2. Mark operation DONE
      await tx.operation.update({
        where: { id: op.id },
        data: {
          status: "DONE",
          completedDate: new Date(),
        },
      });
    });

    revalidatePath(`/operations/receipts/${id}`);
    revalidatePath("/operations/receipts");
    revalidatePath("/move-history");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to validate receipt." };
  }
}

// ------------------------------------------------------------------------------
// DELIVERY ORDERS (Outgoing Stock)
// ------------------------------------------------------------------------------

/**
 * Creates a new outgoing Delivery Order.
 */
export async function createDelivery(data: DeliveryInput) {
  try {
    const user = await requireAuth();
    const validated = deliverySchema.parse(data);

    let customerLoc = await db.location.findFirst({ where: { type: "CUSTOMER" } });
    if (!customerLoc) {
      customerLoc = await db.location.create({
        data: {
          name: "Customer Locations",
          code: "VIRTUAL/CUSTOMER",
          type: "CUSTOMER",
        },
      });
    }

    const ref = generateReference("DEL");

    const delivery = await db.operation.create({
      data: {
        referenceNo: ref,
        type: "DELIVERY",
        status: "READY",
        sourceLocationId: validated.sourceLocationId,
        destLocationId: customerLoc.id,
        partnerName: validated.partnerName.trim(),
        notes: validated.notes?.trim() || null,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : new Date(),
        createdById: user.id,
        lines: {
          create: validated.lines.map((l) => ({
            productId: l.productId,
            demandQty: l.demandQty,
            doneQty: l.demandQty,
          })),
        },
      },
    });

    revalidatePath("/operations/deliveries");
    revalidatePath("/dashboard");
    return { success: true, operationId: delivery.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create delivery order." };
  }
}

/**
 * Validates a Delivery Order:
 * - Checks that sufficient stock exists at source location
 * - Decreases StockLevel at source location (-doneQty)
 * - Logs to StockMove ledger
 * - Marks status as DONE
 */
export async function validateDelivery(id: string) {
  try {
    const user = await requireAuth();

    const op = await db.operation.findUnique({
      where: { id },
      include: { lines: { include: { product: true } } },
    });

    if (!op || op.type !== "DELIVERY") {
      return { success: false, error: "Delivery order not found." };
    }

    if (op.status === "DONE") {
      return { success: false, error: "Delivery order has already been validated." };
    }

    await db.$transaction(async (tx) => {
      // 1. Verify availability and deduct stock
      for (const line of op.lines) {
        const qtyToDeliver = line.doneQty > 0 ? line.doneQty : line.demandQty;

        const currentStock = await tx.stockLevel.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: op.sourceLocationId!,
            },
          },
        });

        if (!currentStock || currentStock.quantity < qtyToDeliver) {
          throw new Error(
            `Insufficient stock for "${line.product.name}" at selected location. Available: ${
              currentStock?.quantity || 0
            }, Required: ${qtyToDeliver}`
          );
        }

        // Deduct from source
        await tx.stockLevel.update({
          where: { id: currentStock.id },
          data: { quantity: currentStock.quantity - qtyToDeliver },
        });

        // Update line doneQty
        await tx.operationLine.update({
          where: { id: line.id },
          data: { doneQty: qtyToDeliver },
        });

        // Record stock ledger move
        await tx.stockMove.create({
          data: {
            operationId: op.id,
            operationLineId: line.id,
            productId: line.productId,
            sourceLocationId: op.sourceLocationId!,
            destLocationId: op.destLocationId!,
            quantity: qtyToDeliver,
            moveType: "DELIVERY",
            movedById: user.id,
          },
        });
      }

      // 2. Mark operation DONE
      await tx.operation.update({
        where: { id: op.id },
        data: {
          status: "DONE",
          completedDate: new Date(),
        },
      });
    });

    revalidatePath(`/operations/deliveries/${id}`);
    revalidatePath("/operations/deliveries");
    revalidatePath("/move-history");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to validate delivery." };
  }
}

// ------------------------------------------------------------------------------
// INTERNAL TRANSFERS (Inter-location movements)
// ------------------------------------------------------------------------------

/**
 * Creates an Internal Stock Transfer.
 */
export async function createTransfer(data: TransferInput) {
  try {
    const user = await requireAuth();
    const validated = transferSchema.parse(data);

    const ref = generateReference("TRF");

    const transfer = await db.operation.create({
      data: {
        referenceNo: ref,
        type: "TRANSFER",
        status: "READY",
        sourceLocationId: validated.sourceLocationId,
        destLocationId: validated.destLocationId,
        notes: validated.notes?.trim() || null,
        scheduledDate: validated.scheduledDate ? new Date(validated.scheduledDate) : new Date(),
        createdById: user.id,
        lines: {
          create: validated.lines.map((l) => ({
            productId: l.productId,
            demandQty: l.demandQty,
            doneQty: l.demandQty,
          })),
        },
      },
    });

    revalidatePath("/operations/transfers");
    revalidatePath("/dashboard");
    return { success: true, operationId: transfer.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create transfer." };
  }
}

/**
 * Validates an Internal Transfer:
 * - Decreases stock at source location
 * - Increases stock at destination location
 * - Net total company stock remains unchanged
 * - Records move in ledger
 */
export async function validateTransfer(id: string) {
  try {
    const user = await requireAuth();

    const op = await db.operation.findUnique({
      where: { id },
      include: { lines: { include: { product: true } } },
    });

    if (!op || op.type !== "TRANSFER") {
      return { success: false, error: "Transfer not found." };
    }

    if (op.status === "DONE") {
      return { success: false, error: "Transfer has already been validated." };
    }

    await db.$transaction(async (tx) => {
      for (const line of op.lines) {
        const qtyToMove = line.doneQty > 0 ? line.doneQty : line.demandQty;

        // 1. Verify and deduct from source
        const sourceStock = await tx.stockLevel.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: op.sourceLocationId!,
            },
          },
        });

        if (!sourceStock || sourceStock.quantity < qtyToMove) {
          throw new Error(
            `Insufficient stock for "${line.product.name}" at source. Available: ${
              sourceStock?.quantity || 0
            }, Required: ${qtyToMove}`
          );
        }

        await tx.stockLevel.update({
          where: { id: sourceStock.id },
          data: { quantity: sourceStock.quantity - qtyToMove },
        });

        // 2. Add to destination
        const destStock = await tx.stockLevel.findUnique({
          where: {
            productId_locationId: {
              productId: line.productId,
              locationId: op.destLocationId!,
            },
          },
        });

        if (destStock) {
          await tx.stockLevel.update({
            where: { id: destStock.id },
            data: { quantity: destStock.quantity + qtyToMove },
          });
        } else {
          await tx.stockLevel.create({
            data: {
              productId: line.productId,
              locationId: op.destLocationId!,
              quantity: qtyToMove,
            },
          });
        }

        // 3. Update line and move ledger
        await tx.operationLine.update({
          where: { id: line.id },
          data: { doneQty: qtyToMove },
        });

        await tx.stockMove.create({
          data: {
            operationId: op.id,
            operationLineId: line.id,
            productId: line.productId,
            sourceLocationId: op.sourceLocationId!,
            destLocationId: op.destLocationId!,
            quantity: qtyToMove,
            moveType: "TRANSFER",
            movedById: user.id,
          },
        });
      }

      await tx.operation.update({
        where: { id: op.id },
        data: {
          status: "DONE",
          completedDate: new Date(),
        },
      });
    });

    revalidatePath(`/operations/transfers/${id}`);
    revalidatePath("/operations/transfers");
    revalidatePath("/move-history");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to validate transfer." };
  }
}

// ------------------------------------------------------------------------------
// INVENTORY ADJUSTMENTS (Audit reconciliations)
// ------------------------------------------------------------------------------

/**
 * Creates and instantly applies an Inventory Adjustment:
 * - Compares physical counted count vs recorded system count
 * - Adjusts StockLevel directly
 * - Logs delta to Virtual Scrap / Inventory Loss location in the ledger
 */
export async function createAdjustment(data: AdjustmentInput) {
  try {
    const user = await requireAuth();
    const validated = adjustmentSchema.parse(data);

    let lossLoc = await db.location.findFirst({ where: { type: "INVENTORY_LOSS" } });
    if (!lossLoc) {
      lossLoc = await db.location.create({
        data: {
          name: "Inventory Scrap & Loss",
          code: "VIRTUAL/LOSS",
          type: "INVENTORY_LOSS",
        },
      });
    }

    const ref = generateReference("ADJ");

    const adjustment = await db.$transaction(async (tx) => {
      // Find current recorded quantity
      const existingStock = await tx.stockLevel.findUnique({
        where: {
          productId_locationId: {
            productId: validated.productId,
            locationId: validated.locationId,
          },
        },
      });

      const currentQty = existingStock?.quantity || 0;
      const difference = validated.countedQty - currentQty;

      // Create operation document (already DONE)
      const op = await tx.operation.create({
        data: {
          referenceNo: ref,
          type: "ADJUSTMENT",
          status: "DONE",
          sourceLocationId: difference < 0 ? validated.locationId : lossLoc.id,
          destLocationId: difference < 0 ? lossLoc.id : validated.locationId,
          notes:
            validated.notes ||
            `Physical audit adjustment: Recorded ${currentQty} -> Counted ${validated.countedQty} (Delta: ${difference > 0 ? "+" : ""}${difference})`,
          completedDate: new Date(),
          createdById: user.id,
          lines: {
            create: [
              {
                productId: validated.productId,
                demandQty: Math.abs(difference),
                doneQty: Math.abs(difference),
              },
            ],
          },
        },
      });

      // Update StockLevel to match the counted quantity
      if (existingStock) {
        await tx.stockLevel.update({
          where: { id: existingStock.id },
          data: { quantity: validated.countedQty },
        });
      } else {
        await tx.stockLevel.create({
          data: {
            productId: validated.productId,
            locationId: validated.locationId,
            quantity: validated.countedQty,
          },
        });
      }

      // Record move if there was a non-zero difference
      if (difference !== 0) {
        await tx.stockMove.create({
          data: {
            operationId: op.id,
            productId: validated.productId,
            sourceLocationId: difference < 0 ? validated.locationId : lossLoc.id,
            destLocationId: difference < 0 ? lossLoc.id : validated.locationId,
            quantity: Math.abs(difference),
            moveType: "ADJUSTMENT",
            movedById: user.id,
          },
        });
      }

      return op;
    });

    revalidatePath("/operations/adjustments");
    revalidatePath("/move-history");
    revalidatePath("/products");
    revalidatePath("/dashboard");
    return { success: true, operationId: adjustment.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to apply adjustment." };
  }
}

/**
 * Cancels a draft, waiting, or ready operation.
 */
export async function cancelOperation(id: string) {
  try {
    await requireAuth();

    const op = await db.operation.findUnique({ where: { id } });
    if (!op) return { success: false, error: "Operation not found." };
    if (op.status === "DONE") {
      return {
        success: false,
        error: "Cannot cancel an already completed operation. Use an adjustment instead.",
      };
    }

    await db.operation.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/operations");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to cancel operation." };
  }
}

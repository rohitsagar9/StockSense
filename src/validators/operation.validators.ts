/**
 * ==============================================================================
 * FILE: src/validators/operation.validators.ts
 * PURPOSE: Zod validation schemas for Inventory Operations
 *          (Receipts, Deliveries, Internal Transfers, and Stock Adjustments).
 * ==============================================================================
 */

import { z } from "zod";

const operationLineSchema = z.object({
  productId: z.string().min(1, "Product selection is required."),
  demandQty: z.coerce.number().int().min(1, "Demand quantity must be at least 1."),
  doneQty: z.coerce.number().int().min(0).default(0),
});

export const receiptSchema = z.object({
  partnerName: z.string().min(2, "Vendor / Supplier name is required."),
  destLocationId: z.string().min(1, "Please select destination receiving location."),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(operationLineSchema).min(1, "Add at least one product item to receive."),
});

export const deliverySchema = z.object({
  partnerName: z.string().min(2, "Customer name is required."),
  sourceLocationId: z.string().min(1, "Please select source shipping location."),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(operationLineSchema).min(1, "Add at least one product item to deliver."),
});

export const transferSchema = z.object({
  sourceLocationId: z.string().min(1, "Please select source location."),
  destLocationId: z.string().min(1, "Please select destination location."),
  scheduledDate: z.string().optional(),
  notes: z.string().optional(),
  lines: z.array(operationLineSchema).min(1, "Add at least one product to transfer."),
}).refine((data) => data.sourceLocationId !== data.destLocationId, {
  message: "Source and destination locations cannot be identical.",
  path: ["destLocationId"],
});

export const adjustmentSchema = z.object({
  productId: z.string().min(1, "Select product to adjust."),
  locationId: z.string().min(1, "Select storage location."),
  countedQty: z.coerce.number().int().min(0, "Counted quantity must be 0 or positive."),
  notes: z.string().optional(),
});

export type ReceiptInput = z.infer<typeof receiptSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;

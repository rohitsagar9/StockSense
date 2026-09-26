/**
 * ==============================================================================
 * FILE: src/validators/warehouse.validators.ts
 * PURPOSE: Zod validation schemas for Warehouses and Locations.
 * ==============================================================================
 */

import { z } from "zod";

export const warehouseSchema = z.object({
  name: z.string().min(2, "Warehouse name must be at least 2 characters."),
  code: z.string().min(2, "Warehouse code must be at least 2 characters.").toUpperCase(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const locationSchema = z.object({
  name: z.string().min(2, "Location name must be at least 2 characters."),
  code: z.string().min(2, "Location code must be at least 2 characters.").toUpperCase(),
  warehouseId: z.string().optional().nullable(),
  type: z.enum(["INTERNAL", "VENDOR", "CUSTOMER", "INVENTORY_LOSS"]).default("INTERNAL"),
});

export type WarehouseInput = z.infer<typeof warehouseSchema>;
export type LocationInput = z.infer<typeof locationSchema>;

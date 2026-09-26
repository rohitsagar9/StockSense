/**
 * ==============================================================================
 * FILE: src/actions/warehouse.actions.ts
 * PURPOSE: Server Actions for Warehouses and Inventory Locations.
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import {
  warehouseSchema,
  locationSchema,
  WarehouseInput,
  LocationInput,
} from "@/validators/warehouse.validators";
import { requireAuth } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { LocationType } from "@prisma/client";

/**
 * Retrieves all warehouses with their child locations and total stock summary.
 */
export async function getWarehouses() {
  return await db.warehouse.findMany({
    include: {
      locations: {
        include: {
          _count: {
            select: { stockLevels: true },
          },
        },
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Retrieves storage locations, optionally filtered by location type (e.g. INTERNAL).
 */
export async function getLocations(type?: LocationType) {
  return await db.location.findMany({
    where: type ? { type } : undefined,
    include: {
      warehouse: {
        select: { id: true, name: true, code: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Creates a new physical warehouse facility.
 */
export async function createWarehouse(data: WarehouseInput) {
  try {
    await requireAuth();
    const validated = warehouseSchema.parse(data);

    const existingCode = await db.warehouse.findUnique({
      where: { code: validated.code.trim().toUpperCase() },
    });
    if (existingCode) {
      return { success: false, error: "A warehouse with this code already exists." };
    }

    const warehouse = await db.warehouse.create({
      data: {
        name: validated.name.trim(),
        code: validated.code.trim().toUpperCase(),
        address: validated.address?.trim() || null,
        isActive: validated.isActive,
      },
    });

    // Also automatically create a default "Main Stock" location for this warehouse
    await db.location.create({
      data: {
        name: `${validated.name.trim()} Stock`,
        code: `${validated.code.trim().toUpperCase()}/STOCK`,
        type: "INTERNAL",
        warehouseId: warehouse.id,
      },
    });

    revalidatePath("/settings/warehouses");
    return { success: true, warehouse };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create warehouse." };
  }
}

/**
 * Creates a new internal location (e.g. Rack, Shelf, Bin) under a warehouse.
 */
export async function createLocation(data: LocationInput) {
  try {
    await requireAuth();
    const validated = locationSchema.parse(data);

    const existingCode = await db.location.findUnique({
      where: { code: validated.code.trim().toUpperCase() },
    });
    if (existingCode) {
      return { success: false, error: "A location with this code already exists." };
    }

    const location = await db.location.create({
      data: {
        name: validated.name.trim(),
        code: validated.code.trim().toUpperCase(),
        warehouseId: validated.warehouseId || null,
        type: validated.type as LocationType,
      },
    });

    revalidatePath("/settings/warehouses");
    return { success: true, location };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create location." };
  }
}

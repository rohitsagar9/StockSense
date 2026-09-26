/**
 * ==============================================================================
 * FILE: src/validators/product.validators.ts
 * PURPOSE: Zod validation schemas for Products and Categories.
 * ==============================================================================
 */

import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
  description: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  sku: z.string().min(2, "SKU must be at least 2 characters.").toUpperCase(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a product category."),
  unitOfMeasure: z.string().min(1, "Unit of measure is required (e.g., Units, kg)."),
  reorderLevel: z.coerce.number().int().min(0, "Reorder level must be 0 or greater."),
  reorderQty: z.coerce.number().int().min(1, "Reorder quantity must be at least 1."),
  initialStock: z.coerce.number().int().min(0).optional(),
  initialLocationId: z.string().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;

/**
 * ==============================================================================
 * FILE: src/actions/category.actions.ts
 * PURPOSE: Server Actions for Category CRUD management.
 *          Modifications are strictly restricted to Inventory Managers.
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import { categorySchema, CategoryInput } from "@/validators/product.validators";
import { requireAuth, requireManager } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

/**
 * Retrieves all categories with their associated product counts.
 */
export async function getCategories() {
  await requireAuth();
  return await db.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Creates a new category. (Manager Exclusive)
 */
export async function createCategory(data: CategoryInput) {
  try {
    await requireManager();
    const validated = categorySchema.parse(data);

    const existing = await db.category.findUnique({
      where: { name: validated.name.trim() },
    });

    if (existing) {
      return { success: false, error: "A category with this name already exists." };
    }

    const category = await db.category.create({
      data: {
        name: validated.name.trim(),
        description: validated.description?.trim() || null,
      },
    });

    revalidatePath("/products/categories");
    revalidatePath("/products");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create category." };
  }
}

/**
 * Updates an existing category. (Manager Exclusive)
 */
export async function updateCategory(id: string, data: CategoryInput) {
  try {
    await requireManager();
    const validated = categorySchema.parse(data);

    const category = await db.category.update({
      where: { id },
      data: {
        name: validated.name.trim(),
        description: validated.description?.trim() || null,
      },
    });

    revalidatePath("/products/categories");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update category." };
  }
}

/**
 * Deletes a category if it contains no associated products. (Manager Exclusive)
 */
export async function deleteCategory(id: string) {
  try {
    await requireManager();
    const count = await db.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return {
        success: false,
        error: `Cannot delete category: contains ${count} linked products. Please reassign them first.`,
      };
    }

    await db.category.delete({ where: { id } });
    revalidatePath("/products/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to delete category." };
  }
}

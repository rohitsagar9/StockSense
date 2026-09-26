/**
 * ==============================================================================
 * FILE: src/actions/user.actions.ts
 * PURPOSE: Server Actions for Team & Staff Administration (Manager Exclusive).
 * ==============================================================================
 */

"use server";

import { db } from "@/lib/db";
import { requireManager } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

/**
 * Retrieves all registered users (Manager only).
 */
export async function getUsers() {
  await requireManager();
  return await db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          operationsCreated: true,
          stockMovesMoved: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Updates a team member's role (promote/demote between MANAGER and STAFF).
 */
export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const currentManager = await requireManager();

    // Prevent a manager from accidentally demoting themselves if they are the last manager
    if (userId === currentManager.id && newRole !== "MANAGER") {
      const managerCount = await db.user.count({ where: { role: "MANAGER" } });
      if (managerCount <= 1) {
        return {
          success: false,
          error: "Cannot demote yourself: At least one Manager must exist in the system.",
        };
      }
    }

    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/settings/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to update user role." };
  }
}

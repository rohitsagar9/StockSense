/**
 * ==============================================================================
 * FILE: src/lib/auth-guard.ts
 * PURPOSE: Server-side authentication and authorization guards for Next.js.
 *          Provides role-based access control (RBAC) helpers for Managers & Staff.
 * ==============================================================================
 */

import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Returns the current authenticated session on the server.
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Ensures the user is authenticated. Throws if unauthenticated.
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized: Please log in to perform this operation.");
  }
  return session.user as {
    id: string;
    name: string;
    email: string;
    role: "MANAGER" | "STAFF";
  };
}

/**
 * Ensures the user is authenticated AND holds the MANAGER role.
 * Throws 403 Forbidden error if user is a standard warehouse staff member.
 */
export async function requireManager() {
  const user = await requireAuth();
  if (user.role !== "MANAGER") {
    throw new Error("Forbidden: This action requires Inventory Manager privileges.");
  }
  return user;
}

/**
 * ==============================================================================
 * FILE: src/lib/auth-guard.ts
 * PURPOSE: Server-side authentication guard helper for server actions and pages.
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
 * Ensures the user is authenticated. Throws or returns user info.
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

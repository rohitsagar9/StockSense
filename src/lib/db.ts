/**
 * ==============================================================================
 * FILE: src/lib/db.ts
 * PURPOSE: Singleton pattern for Prisma Client in Next.js.
 *          Prevents exhausting connection pool during hot-reloading in dev.
 * ==============================================================================
 */

import { PrismaClient } from "@prisma/client";

// Augment NodeJS global namespace with prisma singleton reference
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

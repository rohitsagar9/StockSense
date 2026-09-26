/**
 * ==============================================================================
 * FILE: src/lib/utils.ts
 * PURPOSE: General utility helper functions for classnames merging,
 *          date formatting, unique reference generation, and numbers.
 * ==============================================================================
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes conditionally without conflicting styles.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date object or ISO string to a human-readable date.
 * Example: "Sep 26, 2026, 12:30 PM"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(d);
}

/**
 * Format a Date object or ISO string to a short date (no time).
 * Example: "Sep 26, 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

/**
 * Generates an operational sequence reference number.
 * Example: generateReference("REC") => "REC-2026-9821"
 */
export function generateReference(prefix: string): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomSuffix}`;
}

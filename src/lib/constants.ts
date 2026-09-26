/**
 * ==============================================================================
 * FILE: src/lib/constants.ts
 * PURPOSE: Application constants, navigation links, operation status badges,
 *          and default fallback values.
 * ==============================================================================
 */

export const APP_NAME = "StockSense";
export const APP_DESCRIPTION = "Modular Real-Time Inventory Management System";

/**
 * Status color mappings for Operation statuses:
 * DRAFT, WAITING, READY, DONE, CANCELLED
 */
export const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  DRAFT: {
    label: "Draft",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
  WAITING: {
    label: "Waiting",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-300",
  },
  READY: {
    label: "Ready",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-300",
  },
  DONE: {
    label: "Done",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-300",
  },
  CANCELLED: {
    label: "Cancelled",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-300",
  },
};

/**
 * Operation type descriptions and display titles
 */
export const OPERATION_TYPE_CONFIG: Record<
  string,
  { label: string; badgeClass: string; prefix: string }
> = {
  RECEIPT: {
    label: "Receipt",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    prefix: "REC",
  },
  DELIVERY: {
    label: "Delivery Order",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    prefix: "DEL",
  },
  TRANSFER: {
    label: "Internal Transfer",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-200",
    prefix: "TRF",
  },
  ADJUSTMENT: {
    label: "Inventory Adjustment",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    prefix: "ADJ",
  },
};

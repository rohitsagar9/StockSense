/**
 * ==============================================================================
 * COMPONENT: Sidebar (src/components/layout/sidebar.tsx)
 * PURPOSE: Main navigation sidebar for StockSense.
 *          Features collapsible groups, active link highlights,
 *          and quick access to all core modules.
 * ==============================================================================
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Warehouse,
  User,
  LogOut,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole = "STAFF", userName = "User" }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      title: "Core",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Inventory",
      items: [
        {
          name: "Products Catalog",
          href: "/products",
          icon: Package,
        },
        {
          name: "Categories",
          href: "/products/categories",
          icon: FolderTree,
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          name: "Receipts (Incoming)",
          href: "/operations/receipts",
          icon: ArrowDownToLine,
        },
        {
          name: "Deliveries (Outgoing)",
          href: "/operations/deliveries",
          icon: ArrowUpFromLine,
        },
        {
          name: "Internal Transfers",
          href: "/operations/transfers",
          icon: ArrowLeftRight,
        },
        {
          name: "Stock Adjustments",
          href: "/operations/adjustments",
          icon: SlidersHorizontal,
        },
      ],
    },
    {
      title: "Audit & Config",
      items: [
        {
          name: "Move History / Ledger",
          href: "/move-history",
          icon: History,
        },
        {
          name: "Warehouses & Locations",
          href: "/settings/warehouses",
          icon: Warehouse,
        },
      ],
    },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Boxes className="h-5 w-5" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            StockSense
          </span>
          <span className="block text-[11px] font-medium text-slate-400">
            Inventory System
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.title}>
            <h4 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {group.title}
            </h4>
            <div className="mt-2 space-y-1">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-blue-600" : "text-slate-400"
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile & Footer Menu */}
      <div className="border-t border-slate-200 p-4">
        <div className="mb-2 flex items-center gap-3 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold text-slate-900">
              {userName}
            </p>
            <p className="text-[10px] uppercase font-bold text-blue-600">
              {userRole}
            </p>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <User className="h-3.5 w-3.5 text-slate-400" />
            <span>My Profile</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

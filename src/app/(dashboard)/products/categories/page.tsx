/**
 * ==============================================================================
 * PAGE: Product Categories (src/app/(dashboard)/products/categories/page.tsx)
 * PURPOSE: Manage product categorization and groupings.
 * ==============================================================================
 */

import { getCategories } from "@/actions/category.actions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CategoryClientView } from "./category-client-view";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Product Categories
        </h1>
        <p className="text-xs text-slate-500">
          Organize inventory items into hierarchical product groups
        </p>
      </div>

      <CategoryClientView initialCategories={categories} />
    </div>
  );
}

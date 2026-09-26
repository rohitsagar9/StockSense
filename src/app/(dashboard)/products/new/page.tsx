/**
 * ==============================================================================
 * PAGE: Create Product (src/app/(dashboard)/products/new/page.tsx)
 * PURPOSE: Renders the new product creation form.
 * ==============================================================================
 */

import { getCategories } from "@/actions/category.actions";
import { getLocations } from "@/actions/warehouse.actions";
import { ProductForm } from "@/components/products/product-form";

export default async function NewProductPage() {
  const [categories, locations] = await Promise.all([
    getCategories(),
    getLocations("INTERNAL"),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Catalog Product
        </h1>
        <p className="text-xs text-slate-500">
          Define SKU, category classification, reordering limits, and optional initial stock
        </p>
      </div>

      <ProductForm categories={categories} locations={locations} />
    </div>
  );
}

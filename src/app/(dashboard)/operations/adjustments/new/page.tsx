/**
 * ==============================================================================
 * PAGE: Create Stock Adjustment (src/app/(dashboard)/operations/adjustments/new/page.tsx)
 * PURPOSE: Renders the stock audit adjustment reconciliation form.
 * ==============================================================================
 */

import { getProductsSimple } from "@/actions/product.actions";
import { getLocations } from "@/actions/warehouse.actions";
import { AdjustmentForm } from "@/components/operations/adjustment-form";

export default async function NewAdjustmentPage() {
  const [products, locations] = await Promise.all([
    getProductsSimple(),
    getLocations("INTERNAL"),
  ]);

  return (
    <div className="space-y-6">
      <AdjustmentForm products={products} locations={locations} />
    </div>
  );
}

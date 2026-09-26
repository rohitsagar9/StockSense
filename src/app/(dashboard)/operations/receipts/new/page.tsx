/**
 * ==============================================================================
 * PAGE: Create Receipt (src/app/(dashboard)/operations/receipts/new/page.tsx)
 * PURPOSE: Renders the incoming receipt creation form.
 * ==============================================================================
 */

import { getProductsSimple } from "@/actions/product.actions";
import { getLocations } from "@/actions/warehouse.actions";
import { ReceiptForm } from "@/components/operations/receipt-form";

export default async function NewReceiptPage() {
  const [products, locations] = await Promise.all([
    getProductsSimple(),
    getLocations("INTERNAL"),
  ]);

  return (
    <div className="space-y-6">
      <ReceiptForm products={products} locations={locations} />
    </div>
  );
}

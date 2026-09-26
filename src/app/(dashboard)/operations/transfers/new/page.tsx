/**
 * ==============================================================================
 * PAGE: Create Internal Transfer (src/app/(dashboard)/operations/transfers/new/page.tsx)
 * PURPOSE: Form for relocating goods between internal company locations.
 * ==============================================================================
 */

import { getProductsSimple } from "@/actions/product.actions";
import { getLocations } from "@/actions/warehouse.actions";
import { TransferForm } from "@/components/operations/transfer-form";

export default async function NewTransferPage() {
  const [products, locations] = await Promise.all([
    getProductsSimple(),
    getLocations("INTERNAL"),
  ]);

  return (
    <div className="space-y-6">
      <TransferForm products={products} locations={locations} />
    </div>
  );
}

/**
 * ==============================================================================
 * PAGE: Create Delivery Order (src/app/(dashboard)/operations/deliveries/new/page.tsx)
 * PURPOSE: Renders the outgoing delivery creation form.
 * ==============================================================================
 */

import { getProductsSimple } from "@/actions/product.actions";
import { getLocations } from "@/actions/warehouse.actions";
import { DeliveryForm } from "@/components/operations/delivery-form";

export default async function NewDeliveryPage() {
  const [products, locations] = await Promise.all([
    getProductsSimple(),
    getLocations("INTERNAL"),
  ]);

  return (
    <div className="space-y-6">
      <DeliveryForm products={products} locations={locations} />
    </div>
  );
}

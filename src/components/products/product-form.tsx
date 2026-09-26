/**
 * ==============================================================================
 * COMPONENT: ProductForm (src/components/products/product-form.tsx)
 * PURPOSE: Interactive form for creating and updating catalog products.
 *          Includes SKU generation helper, category selection, reorder rules,
 *          and initial stock provisioning.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/actions/product.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  categories: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string; code: string }>;
  initialData?: any;
}

export function ProductForm({
  categories,
  locations = [],
  initialData,
}: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    unitOfMeasure: initialData?.unitOfMeasure || "Units",
    reorderLevel: initialData?.reorderLevel ?? 10,
    reorderQty: initialData?.reorderQty ?? 50,
    initialStock: 0,
    initialLocationId: locations[0]?.id || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const res = await updateProduct(initialData.id, formData);
        if (!res.success) {
          setError(res.error || "Failed to update product.");
          setLoading(false);
          return;
        }
        router.push(`/products/${initialData.id}`);
      } else {
        const res = await createProduct(formData);
        if (!res.success) {
          setError(res.error || "Failed to create product.");
          setLoading(false);
          return;
        }
        router.push("/products");
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">
          {isEditing ? "Edit Product Details" : "Create New Product"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Modify product details, category, or safety reorder thresholds."
            : "Register a new inventory item with SKU, unit of measure, and reordering rules."}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Product Name *
              </label>
              <Input
                required
                placeholder="e.g. Structural Steel Rods 10mm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                SKU / Code *
              </label>
              <Input
                required
                placeholder="e.g. RAW-STEEL-10"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value.toUpperCase() })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                required
                aria-label="Category"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit of Measure *
              </label>
              <Input
                required
                placeholder="Units, kg, Litres, Meters, etc."
                value={formData.unitOfMeasure}
                onChange={(e) =>
                  setFormData({ ...formData, unitOfMeasure: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Product specifications or notes..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full rounded-md border border-slate-300 bg-white p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Reordering Rules Section */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Reordering Rules & Stock Alerts
            </h4>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reorder Level (Min Threshold)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.reorderLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderLevel: parseInt(e.target.value, 10) || 0,
                    })
                  }
                />
                <span className="text-[11px] text-slate-400">
                  Triggers dashboard low stock alert when on-hand is at or below this.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Reorder Quantity (Target replenishment)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.reorderQty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorderQty: parseInt(e.target.value, 10) || 1,
                    })
                  }
                />
                <span className="text-[11px] text-slate-400">
                  Default quantity suggested when drafting supplier orders.
                </span>
              </div>
            </div>
          </div>

          {/* Initial Stock (Only for new products) */}
          {!isEditing && locations.length > 0 && (
            <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Initial Stock Provisioning (Optional)
              </h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Initial Quantity
                  </label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.initialStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        initialStock: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Storage Location
                  </label>
                  <select
                    aria-label="Storage Location"
                    value={formData.initialLocationId}
                    onChange={(e) =>
                      setFormData({ ...formData, initialLocationId: e.target.value })
                    }
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </span>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Product"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

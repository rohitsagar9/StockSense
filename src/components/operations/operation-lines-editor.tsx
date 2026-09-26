/**
 * ==============================================================================
 * COMPONENT: OperationLinesEditor (src/components/operations/operation-lines-editor.tsx)
 * PURPOSE: Interactive line items editor for inventory operations (Receipts,
 *          Deliveries, Internal Transfers).
 *          Allows adding products, entering demand quantities, and removing lines.
 * ==============================================================================
 */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export interface LineItem {
  productId: string;
  demandQty: number;
}

interface OperationLinesEditorProps {
  products: Array<{ id: string; name: string; sku: string; unitOfMeasure: string }>;
  lines: LineItem[];
  onChange: (lines: LineItem[]) => void;
}

export function OperationLinesEditor({
  products,
  lines,
  onChange,
}: OperationLinesEditorProps) {
  const handleAddLine = () => {
    if (products.length === 0) return;
    onChange([...lines, { productId: products[0].id, demandQty: 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    const updated = lines.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdateLine = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Product Line Items ({lines.length})
        </h4>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLine}
          className="gap-1.5 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Product</span>
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
          No product items added yet. Click &quot;Add Product&quot; to begin.
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <div className="grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500">
            <div className="col-span-8">Product / SKU</div>
            <div className="col-span-3 text-right">Quantity</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {lines.map((line, index) => {
            const selectedProduct = products.find((p) => p.id === line.productId);

            return (
              <div
                key={index}
                className="grid grid-cols-12 items-center gap-2 px-4 py-2.5 bg-white"
              >
                {/* Product Dropdown */}
                <div className="col-span-8">
                  <select
                    value={line.productId}
                    aria-label="Select Product"
                    onChange={(e) =>
                      handleUpdateLine(index, "productId", e.target.value)
                    }
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}] ({p.unitOfMeasure})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity Input */}
                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    value={line.demandQty}
                    onChange={(e) =>
                      handleUpdateLine(
                        index,
                        "demandQty",
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                    className="w-20 text-right h-8 text-xs font-semibold"
                  />
                  <span className="text-xs text-slate-400 w-10 truncate">
                    {selectedProduct?.unitOfMeasure || "Units"}
                  </span>
                </div>

                {/* Remove Line */}
                <div className="col-span-1 flex justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveLine(index)}
                    aria-label="Remove item line"
                    className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

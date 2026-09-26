/**
 * ==============================================================================
 * COMPONENT: StockByLocation (src/components/products/stock-by-location.tsx)
 * PURPOSE: Renders stock availability per location/warehouse for a product.
 * ==============================================================================
 */

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Warehouse, MapPin } from "lucide-react";

interface StockByLocationProps {
  stockLevels: Array<{
    id: string;
    quantity: number;
    location: {
      name: string;
      code: string;
      warehouse?: {
        name: string;
      } | null;
    };
  }>;
  unitOfMeasure: string;
}

export function StockByLocation({
  stockLevels,
  unitOfMeasure,
}: StockByLocationProps) {
  const totalStock = stockLevels.reduce((sum, sl) => sum + sl.quantity, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base font-bold text-slate-800">
            Stock Availability Per Location
          </CardTitle>
          <CardDescription>
            Current physical distribution across company warehouses and zones
          </CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase">
            Total On-Hand
          </span>
          <p className="text-xl font-bold text-slate-900">
            {totalStock} {unitOfMeasure}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {stockLevels.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400 border border-dashed rounded-lg">
            No stock recorded at any location yet. Receive goods or perform an adjustment to initialize.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Warehouse</TableHead>
                <TableHead>Location / Shelf</TableHead>
                <TableHead>Location Code</TableHead>
                <TableHead className="text-right">On-Hand Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockLevels.map((sl) => (
                <TableRow key={sl.id}>
                  <TableCell className="font-medium text-slate-800">
                    <div className="flex items-center gap-2">
                      <Warehouse className="h-4 w-4 text-slate-400" />
                      <span>{sl.location.warehouse?.name || "Company Site"}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      <span>{sl.location.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {sl.location.code}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {sl.quantity} {unitOfMeasure}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

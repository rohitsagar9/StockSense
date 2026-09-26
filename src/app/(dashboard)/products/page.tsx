/**
 * ==============================================================================
 * PAGE: Products Catalog (src/app/(dashboard)/products/page.tsx)
 * PURPOSE: Browse, search, and filter inventory catalog products.
 * ==============================================================================
 */

import Link from "next/link";
import { getProducts } from "@/actions/product.actions";
import { getCategories } from "@/actions/category.actions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Search, Filter, AlertTriangle, ChevronRight } from "lucide-react";

interface ProductsPageProps {
  searchParams: {
    search?: string;
    categoryId?: string;
    lowStock?: string;
    page?: string;
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const page = parseInt(searchParams.page || "1", 10);
  const lowStockOnly = searchParams.lowStock === "true";

  const [result, categories] = await Promise.all([
    getProducts({
      page,
      search: searchParams.search,
      categoryId: searchParams.categoryId,
      lowStockOnly,
    }),
    getCategories(),
  ]);

  const { products, pagination } = result;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Products Catalog
          </h1>
          <p className="text-xs text-slate-500">
            Manage inventory items, SKUs, safety reorder thresholds, and stock levels
          </p>
        </div>

        <Link href="/products/new">
          <Button variant="primary" className="gap-1.5 shadow font-semibold">
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <form className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              placeholder="Search by name, SKU..."
              className="h-9 w-full rounded-md border border-slate-300 bg-slate-50 pl-9 pr-3 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm" className="h-9 text-xs">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Link
            href={`/products?${new URLSearchParams({
              ...(searchParams.search ? { search: searchParams.search } : {}),
              ...(lowStockOnly ? {} : { lowStock: "true" }),
            }).toString()}`}
          >
            <Button
              variant={lowStockOnly ? "destructive" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs font-semibold"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Low Stock Alerts</span>
            </Button>
          </Link>

          <Link href="/products/categories">
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold">
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>

      {/* Products Table */}
      {products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="No inventory items matched your search query or filters."
          actionHref="/products/new"
          actionLabel="Create First Product"
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total On-Hand</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead className="w-12 text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-bold text-slate-700">
                    {p.sku}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/products/${p.id}`}
                      className="font-semibold text-sm text-blue-600 hover:underline block"
                    >
                      {p.name}
                    </Link>
                    {p.description && (
                      <span className="text-[11px] text-slate-400 line-clamp-1">
                        {p.description}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-slate-600">
                    {p.category.name}
                  </TableCell>

                  <TableCell className="text-right font-bold text-slate-900 text-sm">
                    {p.totalStock} {p.unitOfMeasure}
                  </TableCell>

                  <TableCell className="text-right text-xs text-slate-500">
                    {p.reorderLevel} {p.unitOfMeasure}
                  </TableCell>

                  <TableCell>
                    {p.isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : p.isLowStock ? (
                      <Badge variant="warning">Low Stock</Badge>
                    ) : (
                      <Badge variant="success">Adequate</Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <Link href={`/products/${p.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-800">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
          />
        </div>
      )}
    </div>
  );
}

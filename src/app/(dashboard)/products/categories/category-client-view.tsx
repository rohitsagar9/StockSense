/**
 * ==============================================================================
 * COMPONENT: CategoryClientView (src/app/(dashboard)/products/categories/category-client-view.tsx)
 * PURPOSE: Interactive client component for creating and managing product categories.
 * ==============================================================================
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, deleteCategory } from "@/actions/category.actions";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2, FolderTree } from "lucide-react";

interface CategoryItem {
  id: string;
  name: string;
  description: string | null;
  _count: { products: number };
}

export function CategoryClientView({
  initialCategories,
}: {
  initialCategories: CategoryItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createCategory({ name, description });
      if (!res.success) {
        setError(res.error || "Failed to create category.");
        setLoading(false);
        return;
      }

      setName("");
      setDescription("");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const res = await deleteCategory(id);
      if (!res.success) {
        alert(res.error || "Failed to delete category.");
        return;
      }
      router.refresh();
    } catch (err: any) {
      alert(err?.message || "Failed to delete category.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Create Category Form */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Create Category
          </CardTitle>
          <CardDescription>
            Add a new classification for inventory catalog items
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleCreate}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name *
              </label>
              <Input
                required
                placeholder="e.g. Raw Materials"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description (Optional)
              </label>
              <Input
                placeholder="Brief summary..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full gap-1.5 text-xs font-semibold"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              <span>Add Category</span>
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Categories Table */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-800">
            Existing Categories ({initialCategories.length})
          </CardTitle>
          <CardDescription>
            List of all configured catalog groups and their linked products
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialCategories.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No categories configured yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Products Count</TableHead>
                  <TableHead className="w-12 text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialCategories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-sm text-slate-800">
                      <div className="flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-slate-400" />
                        <span>{c.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {c.description || "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 text-xs">
                      {c._count.products} item(s)
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id, c.name)}
                        aria-label="Delete category"
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

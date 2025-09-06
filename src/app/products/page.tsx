"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Pagination from "@/components/Pagination";
import DebouncedInput from "@/components/DebouncedInput";

type Product = { id: string; sku: string; title: string; category: string | null; priceCents: number; createdAt: string; };
type ListResp = { data: Product[]; page: number; pageSize: number; total: number; note?: string };

export default function ProductsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rows, setRows] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | undefined>();

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(q ? { q } : {}) }).toString();
    const res = await apiFetch<ListResp>(`/products?${qs}`);
    setRows(res.data); setTotal(res.total); setNote(res.note);
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, page]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Products</h1>
      <div className="flex items-center gap-3">
        <div className="w-64">
          <DebouncedInput placeholder="Search titles/categories" onChange={(v)=>{ setPage(1); setQ(v); }} />
        </div>
        <div className="ml-auto"><Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} /></div>
      </div>
      {note && <p className="text-xs text-amber-600">Note: {note}</p>}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">SKU</th>
              <th className="text-left p-2">Title</th>
              <th className="text-left p-2">Category</th>
              <th className="text-right p-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading…</td></tr> :
            rows.length === 0 ? <tr><td colSpan={4} className="p-6 text-center text-gray-500">No products</td></tr> :
            rows.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.title}</td>
                <td className="p-2">{p.category ?? "—"}</td>
                <td className="p-2 text-right">${(p.priceCents/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

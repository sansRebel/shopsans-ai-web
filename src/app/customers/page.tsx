"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Pagination from "@/components/Pagination";
import DebouncedInput from "@/components/DebouncedInput";

type Customer = { id: string; name: string; email: string | null; country: string | null; createdAt: string; };
type ListResp = { data: Customer[]; page: number; pageSize: number; total: number; note?: string };

export default function CustomersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [rows, setRows] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(q ? { q } : {}) }).toString();
      const res = await apiFetch<ListResp>(`/customers?${qs}`);
      setRows(res.data); setTotal(res.total); setNote(res.note);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError(e?.details?.error ?? `Failed: ${e?.status ?? ""}`);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [q, page]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Customers</h1>
      <div className="flex items-center gap-3">
        <div className="w-64">
          <DebouncedInput placeholder="Search (FTS, falls back to substring)" onChange={(v) => { setPage(1); setQ(v); }} />
        </div>
        <div className="ml-auto"><Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} /></div>
      </div>
      {note && <p className="text-xs text-amber-600">Note: {note}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Country</th>
              <th className="text-left p-2">Created</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={5} className="p-6 text-center text-gray-500">No customers</td></tr>
            ) : rows.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.email ?? "—"}</td>
                <td className="p-2">{c.country ?? "—"}</td>
                <td className="p-2">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="p-2 text-right">
                  <a className="text-blue-600 hover:underline" href={`/customers/${c.id}`}>View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

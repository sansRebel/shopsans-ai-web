"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Pagination from "@/components/Pagination";

type OrderRow = {
  id: string; customerId: string;
  orderDate: string; channel: "web"|"mobile"|"store"|"marketplace";
  status: "pending"|"paid"|"shipped"|"delivered"|"cancelled";
  totalCents: number;
  _count: { items: number };
  customer: { name: string | null; email: string | null };
};
type ListResp = { data: OrderRow[]; page: number; pageSize: number; total: number };

const STATUSES = ["pending","paid","shipped","delivered","cancelled"] as const;
const CHANNELS = ["web","mobile","store","marketplace"] as const;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [status, setStatus] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const q = new URLSearchParams({
      page: String(page), pageSize: String(pageSize),
      ...(status ? { status } : {}), ...(channel ? { channel } : {})
    }).toString();
    const res = await apiFetch<ListResp>(`/orders?${q}`);
    setRows(res.data); setTotal(res.total); setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, status, channel]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">Orders</h1>
      <div className="flex flex-wrap items-center gap-3">
        <select className="border rounded px-2 py-2" value={status} onChange={e=>{ setPage(1); setStatus(e.target.value); }}>
          <option value="">All statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="border rounded px-2 py-2" value={channel} onChange={e=>{ setPage(1); setChannel(e.target.value); }}>
          <option value="">All channels</option>
          {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="ml-auto"><Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} /></div>
      </div>
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Customer</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Channel</th>
              <th className="text-right p-2">Items</th>
              <th className="text-right p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="p-4 text-center">Loading…</td></tr> :
            rows.length === 0 ? <tr><td colSpan={6} className="p-6 text-center text-gray-500">No orders</td></tr> :
            rows.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{new Date(o.orderDate).toLocaleString()}</td>
                <td className="p-2">{o.customer?.name ?? "—"} <span className="text-gray-500">({o.customer?.email ?? "—"})</span></td>
                <td className="p-2">{o.status}</td>
                <td className="p-2">{o.channel}</td>
                <td className="p-2 text-right">{o._count.items}</td>
                <td className="p-2 text-right">${(o.totalCents/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

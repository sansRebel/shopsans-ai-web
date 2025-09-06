"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Customer = { id: string; name: string; email: string | null; country: string | null; createdAt: string; };
type Detail = Customer & { metrics: { orders: number; tickets: number; lifetimeValueCents: number } };

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setData(await apiFetch<Detail>(`/customers/${id}`)); }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catch (e: any) { setError(e?.details?.error ?? `Error: ${e?.status ?? ""}`); }
    })();
  }, [id]);

  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!data) return <p className="p-4">Loading…</p>;

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">{data.name}</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Orders" value={data.metrics.orders} />
        <Stat label="Tickets" value={data.metrics.tickets} />
        <Stat label="LTV" value={`$${(data.metrics.lifetimeValueCents/100).toFixed(2)}`} />
        <Stat label="Since" value={new Date(data.createdAt).toLocaleDateString()} />
      </div>
      <div className="p-4 border rounded">
        <p><strong>Email:</strong> {data.email ?? "—"}</p>
        <p><strong>Country:</strong> {data.country ?? "—"}</p>
        <p className="text-xs text-gray-500 mt-2">ID: {data.id}</p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="p-3 border rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

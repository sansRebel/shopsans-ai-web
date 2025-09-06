"use client";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";

type Overview = {
  range: { from: string; to: string };
  kpis: { revenueCents: number; ordersCount: number; aovCents: number; customersCount: number };
  topProducts: Array<{ productId: string; title: string; revenueCents: number; units: number }>;
};
type RevDay = { range: { from: string; to: string }; series: Array<{ day: string; revenueCents: number }> };
type OrdStatus = { breakdown: Array<{ status: string; count: number }> };

export default function AnalyticsPage() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [rev, setRev] = useState<RevDay | null>(null);
  const [st, setSt] = useState<OrdStatus | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [o, r, s] = await Promise.all([
          apiFetch<Overview>("/analytics/overview"),
          apiFetch<RevDay>("/analytics/revenue-by-day"),
          apiFetch<OrdStatus>("/analytics/orders-by-status"),
        ]);
        setOv(o); setRev(r); setSt(s);
      } catch (e) {
        setErr("Failed to load analytics");
      }
    })();
  }, []);

  const revSeries = rev?.series ?? [];
  const maxY = useMemo(() => Math.max(1, ...revSeries.map(d => d.revenueCents)), [revSeries]);

  if (err) return <p className="p-4 text-red-600">{err}</p>;
  if (!ov || !rev || !st) return <p className="p-4">Loading…</p>;

  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Revenue" value={formatUSD(ov.kpis.revenueCents)} />
        <Stat label="Orders" value={ov.kpis.ordersCount.toLocaleString()} />
        <Stat label="AOV" value={formatUSD(ov.kpis.aovCents)} />
        <Stat label="Customers" value={ov.kpis.customersCount.toLocaleString()} />
      </div>

      <section className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 border rounded p-3">
          <h2 className="font-medium mb-2">Revenue by Day</h2>
          <LineChart data={revSeries.map((d, i) => ({ x: i, y: d.revenueCents }))} maxY={maxY} height={220} />
          <div className="text-xs text-gray-500 mt-1">
            {new Date(ov.range.from).toLocaleDateString()} — {new Date(ov.range.to).toLocaleDateString()}
          </div>
        </div>

        <div className="border rounded p-3">
          <h2 className="font-medium mb-2">Orders by Status</h2>
          <BarChart data={(st.breakdown).map((b, i) => ({ x: b.status, y: b.count }))} height={220} />
        </div>
      </section>

      <section className="border rounded p-3">
        <h2 className="font-medium mb-2">Top Products (by revenue)</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="text-left p-2">Title</th>
            <th className="text-right p-2">Units</th>
            <th className="text-right p-2">Revenue</th>
          </tr></thead>
          <tbody>
            {ov.topProducts.length === 0 ? (
              <tr><td colSpan={3} className="p-4 text-center text-gray-500">No data</td></tr>
            ) : ov.topProducts.map(tp => (
              <tr key={tp.productId} className="border-t">
                <td className="p-2">{tp.title}</td>
                <td className="p-2 text-right">{tp.units.toLocaleString()}</td>
                <td className="p-2 text-right">{formatUSD(tp.revenueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 border rounded">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function formatUSD(cents: number) {
  return `$${(cents/100).toLocaleString(undefined,{ maximumFractionDigits: 2 })}`;
}

/** Simple SVG line chart (no deps) */
function LineChart({ data, maxY, height = 200 }: { data: Array<{ x: number; y: number }>; maxY: number; height?: number; }) {
  const W = 640;
  const H = height;
  if (data.length === 0) return <div className="text-sm text-gray-500">No data</div>;
  const maxX = data[data.length - 1].x || 1;
  const pts = data.map(d => {
    const x = (d.x / (maxX || 1)) * (W - 20) + 10;
    const y = H - (d.y / (maxY || 1)) * (H - 20) - 10;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-white rounded border">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" points={pts} />
    </svg>
  );
}

/** Simple SVG bar chart (no deps) */
function BarChart({ data, height = 200 }: { data: Array<{ x: string; y: number }>; height?: number; }) {
  const W = 320; const H = height; const n = data.length || 1;
  const maxY = Math.max(1, ...data.map(d => d.y));
  const bw = (W - 20) / n;
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="bg-white rounded border">
      {data.map((d, i) => {
        const h = (d.y / maxY) * (H - 20);
        const x = 10 + i * bw;
        const y = H - h - 10;
        return <g key={i}>
          <rect x={x} y={y} width={bw * 0.8} height={h} fill="currentColor" />
          <text x={x + bw*0.4} y={H - 2} fontSize="10" textAnchor="middle">{d.x}</text>
        </g>;
      })}
    </svg>
  );
}

"use client";
type Props = { page: number; pageSize: number; total: number; onPage: (p: number) => void; };
export default function Pagination({ page, pageSize, total, onPage }: Props) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="flex items-center gap-2 justify-end">
      <button className="px-2 py-1 border rounded disabled:opacity-50"
        disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
      <span className="text-sm">{page} / {pages}</span>
      <button className="px-2 py-1 border rounded disabled:opacity-50"
        disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button>
    </div>
  );
}

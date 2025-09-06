"use client";
import Link from "next/link";
export default function AppHeader() {
  return (
    <header className="border-b">
      <nav className="max-w-6xl mx-auto flex gap-4 p-3">
        <Link className="font-semibold" href="/">ShopSans AI</Link>
        <Link href="/customers">Customers</Link>
        <Link href="/products">Products</Link>
        <Link href="/orders">Orders</Link>
        <Link href="/analytics">Analytics</Link>
      </nav>
    </header>
  );
}

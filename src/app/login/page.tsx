"use client";
import { useState } from "react";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });
    if (res.ok) setMsg("Logged in ✅");
    else {
      const j = await res.json().catch(() => ({}));
      setMsg(`Login failed: ${j.error ?? res.status}`);
    }
  }

  return (
    <main className="p-8 max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="border p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" />
        <input className="border p-2 w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
        <button className="px-4 py-2 rounded bg-black text-white">Sign in</button>
      </form>
      {msg && <p>{msg}</p>}
    </main>
  );
}

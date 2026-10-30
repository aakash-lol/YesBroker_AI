"use client";

import { useState } from "react";
import { Lock, RefreshCw } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Could not sign in.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      // Only allow same-site relative redirects.
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/admin/properties";
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = {
    background: "var(--glass-1-bg)",
    border: "1px solid var(--glass-1-border)",
    color: "var(--text-primary)",
  } as const;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-7"
        style={{
          background: "rgba(255,255,255,0.82)",
          border: "1px solid rgba(100,116,180,0.12)",
          borderRadius: "var(--radius-xl)",
          backdropFilter: "blur(24px) saturate(150%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)" }}
        >
          <Lock className="w-5 h-5" style={{ color: "#4F46E5" }} />
        </div>
        <h1 className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
          Admin sign in
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Manage listings and internal dashboards.
        </p>

        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Email</label>
        <input
          type="email"
          required
          autoFocus
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
          style={input}
        />
        <label className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Password</label>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-4"
          style={input}
        />

        {error && <p className="text-xs mb-4" style={{ color: "#DC2626" }} role="alert">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
        >
          {busy && <RefreshCw className="w-4 h-4 animate-spin" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

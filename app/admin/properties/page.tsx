"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Pencil, Trash2, Search, X, RefreshCw, LogOut, Star, Eye, EyeOff, DatabaseZap } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Row = {
  id: string;
  property_code?: string | null;
  project_name: string;
  location: string;
  property_type: string;
  seller_price: number;
  minimum_price?: number | null;
  amenities: string[];
  payment_plan?: string | null;
  builder_details?: string | null;
  locality_advantages?: string | null;
  brochure_url?: string | null;
  image_url?: string | null;
  availability_status: string;
  total_units?: number | null;
  available_units?: number | null;
  possession_date?: string | null;
  rera_number?: string | null;
  featured: boolean;
  is_published: boolean;
};

type Form = {
  id?: string;
  project_name: string;
  property_code: string;
  location: string;
  property_type: string;
  price_lakhs: string;
  min_price_lakhs: string;
  amenities: string;
  builder_details: string;
  payment_plan: string;
  locality_advantages: string;
  possession_date: string;
  rera_number: string;
  availability_status: string;
  total_units: string;
  available_units: string;
  image_url: string;
  brochure_url: string;
  featured: boolean;
  is_published: boolean;
};

const TYPES = ["Apartment", "Villa", "Penthouse", "Townhouse", "Plot"];
const STATUSES = [
  { v: "available", l: "Available" },
  { v: "upcoming", l: "Upcoming" },
  { v: "on_hold", l: "On hold" },
  { v: "sold", l: "Sold out" },
];

const EMPTY: Form = {
  project_name: "", property_code: "", location: "", property_type: "Apartment", price_lakhs: "", min_price_lakhs: "",
  amenities: "", builder_details: "", payment_plan: "", locality_advantages: "", possession_date: "", rera_number: "",
  availability_status: "available", total_units: "", available_units: "", image_url: "", brochure_url: "",
  featured: false, is_published: true,
};

const lakhs = (n?: number | null) => (n ? String(Math.round((n / 100000) * 100) / 100) : "");
const toRupees = (s: string) => (s.trim() === "" ? null : Math.round(Number(s) * 100000));
const numOrNull = (s: string) => (s.trim() === "" ? null : Number(s));

function toForm(r: Row): Form {
  return {
    id: r.id,
    project_name: r.project_name, property_code: r.property_code ?? "", location: r.location, property_type: r.property_type,
    price_lakhs: lakhs(r.seller_price), min_price_lakhs: lakhs(r.minimum_price), amenities: (r.amenities ?? []).join(", "),
    builder_details: r.builder_details ?? "", payment_plan: r.payment_plan ?? "", locality_advantages: r.locality_advantages ?? "",
    possession_date: r.possession_date ?? "", rera_number: r.rera_number ?? "", availability_status: r.availability_status,
    total_units: r.total_units?.toString() ?? "", available_units: r.available_units?.toString() ?? "",
    image_url: r.image_url ?? "", brochure_url: r.brochure_url ?? "", featured: r.featured, is_published: r.is_published,
  };
}

function toPayload(f: Form) {
  return {
    project_name: f.project_name, property_code: f.property_code, location: f.location, property_type: f.property_type,
    seller_price: toRupees(f.price_lakhs), minimum_price: toRupees(f.min_price_lakhs), amenities: f.amenities,
    builder_details: f.builder_details, payment_plan: f.payment_plan, locality_advantages: f.locality_advantages,
    possession_date: f.possession_date, rera_number: f.rera_number, availability_status: f.availability_status,
    total_units: numOrNull(f.total_units), available_units: numOrNull(f.available_units),
    image_url: f.image_url, brochure_url: f.brochure_url, featured: f.featured, is_published: f.is_published,
  };
}

const card = {
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(100,116,180,0.12)",
  borderRadius: "var(--radius-lg)",
  backdropFilter: "blur(24px) saturate(150%)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
} as const;
const inputStyle = { background: "var(--glass-1-bg)", border: "1px solid var(--glass-1-border)", color: "var(--text-primary)" } as const;

function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{hint}</span>}
    </label>
  );
}

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<{ kind: "ok" | "warn" | "err"; text: string } | null>(null);
  const [syncing, setSyncing] = useState(false);

  const notify = (kind: "ok" | "warn" | "err", text: string) => {
    setToast({ kind, text });
    setTimeout(() => setToast(null), 6000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/properties", { cache: "no-store" });
    if (res.status === 401) { setLoading(false); return router.replace("/admin/login?next=/admin/properties"); }
    if (res.ok) setRows(await res.json());
    else notify("err", "Could not load properties.");
    setLoading(false);
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((r) => [r.project_name, r.location, r.property_code ?? "", r.property_type].join(" ").toLowerCase().includes(q)) : rows;
  }, [rows, search]);

  function reportSync(sync?: { ok: boolean; error?: string }, okText = "Saved.") {
    if (!sync || sync.ok) notify("ok", `${okText} Voice-agent search is up to date.`);
    else notify("warn", `${okText} The voice-agent search index did not update (${sync.error}). Use “Re-sync search” once fixed.`);
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setFormError("");
    const isEdit = Boolean(form.id);
    const res = await fetch(isEdit ? `/api/admin/properties/${form.id}` : "/api/admin/properties", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(form)),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setFormError(data.error ?? "Could not save.");
    setForm(null);
    await load();
    reportSync(data.sync, isEdit ? "Changes saved." : "Property added.");
  }

  async function quick(r: Row, patch: Partial<Row>) {
    setRows((p) => p.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
    const res = await fetch(`/api/admin/properties/${r.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { notify("err", data.error ?? "Update failed."); load(); return; }
    if (data.sync && !data.sync.ok) reportSync(data.sync, "Updated.");
  }

  async function remove(r: Row) {
    if (!window.confirm(`Delete “${r.project_name}”? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/properties/${r.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return notify("err", data.error ?? "Delete failed.");
    setRows((p) => p.filter((x) => x.id !== r.id));
    reportSync(data.sync, "Property deleted.");
  }

  async function resync() {
    setSyncing(true);
    const res = await fetch("/api/admin/qdrant-sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setSyncing(false);
    if (!res.ok) return notify("err", data.error ?? "Re-sync failed.");
    if (data.failed?.length) notify("warn", `Synced ${data.synced} of ${data.total}. ${data.failed.length} failed: ${data.failed[0].error}`);
    else notify("ok", `Search index rebuilt: ${data.synced} properties.`);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => (f ? { ...f, [k]: v } : f));
  const text = (k: keyof Form, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input
      value={(form?.[k] as string) ?? ""}
      onChange={(e) => set(k, e.target.value as never)}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none"
      style={inputStyle}
      {...props}
    />
  );
  const area = (k: keyof Form) => (
    <textarea
      rows={2}
      value={(form?.[k] as string) ?? ""}
      onChange={(e) => set(k, e.target.value as never)}
      className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none resize-y"
      style={inputStyle}
    />
  );

  return (
    <div className="min-h-screen pt-24 px-4 pb-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-black text-3xl" style={{ color: "var(--text-primary)" }}>Properties</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Edits here appear on the marketplace and in voice-agent search.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={resync} disabled={syncing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50" style={{ ...card, color: "var(--text-secondary)" }}>
              <DatabaseZap className={`w-4 h-4 ${syncing ? "animate-pulse" : ""}`} />
              {syncing ? "Rebuilding…" : "Re-sync search"}
            </button>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold" style={{ ...card, color: "var(--text-secondary)" }}>
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <button onClick={() => { setFormError(""); setForm({ ...EMPTY }); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
              <Plus className="w-4 h-4" /> Add property
            </button>
          </div>
        </div>

        {toast && (
          <div
            role="status"
            className="mb-4 px-4 py-3 rounded-xl text-sm"
            style={{
              background: toast.kind === "ok" ? "rgba(16,185,129,0.1)" : toast.kind === "warn" ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.1)",
              border: `1px solid ${toast.kind === "ok" ? "rgba(16,185,129,0.3)" : toast.kind === "warn" ? "rgba(245,158,11,0.35)" : "rgba(239,68,68,0.3)"}`,
              color: "var(--text-primary)",
            }}
          >
            {toast.text}
          </div>
        )}

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, location or code" className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none" style={inputStyle} />
        </div>

        <div style={card} className="overflow-x-auto">
          {loading ? (
            <p className="py-16 text-center text-sm" style={{ color: "var(--text-muted)" }}>Loading properties…</p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "#6366F1" }} />
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {rows.length === 0 ? "No properties yet. Add your first listing." : "No properties match your search."}
              </p>
            </div>
          ) : (
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="text-left text-xs" style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--glass-1-border)" }}>
                  <th className="px-4 py-3 font-semibold">Property</th>
                  <th className="px-4 py-3 font-semibold">Price</th>
                  <th className="px-4 py-3 font-semibold">Floor</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Featured</th>
                  <th className="px-4 py-3 font-semibold">Visible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid var(--glass-1-border)", opacity: r.is_published ? 1 : 0.55 }}>
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{r.project_name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {r.property_type} in {r.location}{r.property_code ? ` (${r.property_code})` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-primary)" }}>{formatPrice(r.seller_price)}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{r.minimum_price ? formatPrice(r.minimum_price) : "—"}</td>
                    <td className="px-4 py-3">
                      <select value={r.availability_status} onChange={(e) => quick(r, { availability_status: e.target.value })} className="rounded-lg px-2 py-1 text-xs outline-none" style={inputStyle}>
                        {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => quick(r, { featured: !r.featured })} aria-label={r.featured ? "Remove from featured" : "Mark as featured"} title="Featured">
                        <Star className="w-4 h-4" style={{ color: r.featured ? "#F59E0B" : "var(--text-muted)", fill: r.featured ? "#F59E0B" : "none" }} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => quick(r, { is_published: !r.is_published })} aria-label={r.is_published ? "Hide from marketplace" : "Show on marketplace"} title={r.is_published ? "Visible on site" : "Hidden"}>
                        {r.is_published ? <Eye className="w-4 h-4" style={{ color: "#10B981" }} /> : <EyeOff className="w-4 h-4" style={{ color: "var(--text-muted)" }} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => { setFormError(""); setForm(toForm(r)); }} className="p-2 rounded-lg" aria-label={`Edit ${r.project_name}`} style={{ color: "#4F46E5" }}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(r)} className="p-2 rounded-lg" aria-label={`Delete ${r.project_name}`} style={{ color: "#DC2626" }}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {form && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4" style={{ background: "rgba(15,23,42,0.5)" }} onClick={() => !saving && setForm(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-3xl my-8 p-6" style={{ ...card, background: "rgba(255,255,255,0.97)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>{form.id ? "Edit property" : "Add property"}</h2>
              <button onClick={() => setForm(null)} aria-label="Close" className="p-1.5 rounded-lg"><X className="w-4 h-4" style={{ color: "var(--text-secondary)" }} /></button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Project name *">{text("project_name")}</Field>
              <Field label="Property code" hint="Optional unique ID, e.g. WF-001">{text("property_code")}</Field>
              <Field label="Location *" hint="Area, City (e.g. Whitefield, Bangalore)">{text("location")}</Field>
              <Field label="Type *">
                <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)} className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none" style={inputStyle}>
                  {TYPES.concat(TYPES.includes(form.property_type) ? [] : [form.property_type]).map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Listed price (₹ Lakhs) *" hint="85 means ₹85 Lakhs; 120 means ₹1.2 Cr">{text("price_lakhs", { inputMode: "decimal" })}</Field>
              <Field label="Minimum price (₹ Lakhs)" hint="Private negotiation floor. Never shown to visitors or the voice agent.">{text("min_price_lakhs", { inputMode: "decimal" })}</Field>
              <Field label="Availability">
                <select value={form.availability_status} onChange={(e) => set("availability_status", e.target.value)} className="w-full rounded-xl px-3.5 py-2.5 text-sm outline-none" style={inputStyle}>
                  {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </Field>
              <Field label="Possession">{text("possession_date", { placeholder: "Dec 2027 or Ready to move" })}</Field>
              <Field label="Total units">{text("total_units", { inputMode: "numeric" })}</Field>
              <Field label="Units available">{text("available_units", { inputMode: "numeric" })}</Field>
              <Field label="RERA number">{text("rera_number")}</Field>
              <Field label="Builder">{text("builder_details")}</Field>
              <Field label="Amenities" hint="Comma separated: Pool, Gym, Clubhouse" wide>{text("amenities")}</Field>
              <Field label="Payment plan" wide>{area("payment_plan")}</Field>
              <Field label="Locality advantages" wide>{area("locality_advantages")}</Field>
              <Field label="Image URL" hint="/images/name.png or a full https:// link">{text("image_url")}</Field>
              <Field label="Brochure URL">{text("brochure_url")}</Field>
            </div>

            <div className="flex flex-wrap gap-6 mt-5">
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <input type="checkbox" checked={form.is_published} onChange={(e) => set("is_published", e.target.checked)} /> Visible on marketplace
              </label>
            </div>

            {formError && <p className="text-sm mt-4" style={{ color: "#DC2626" }} role="alert">{formError}</p>}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setForm(null)} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ ...card, color: "var(--text-secondary)" }}>Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                {form.id ? "Save changes" : "Add property"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

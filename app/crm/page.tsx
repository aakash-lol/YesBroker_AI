"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Phone,
  Calendar,
  Search,
  Brain,
  Star,
  Clock,
  MapPin,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { UILead, UICallLog, UISiteVisit } from "@/lib/mappers";

/* ─────────────────────────────────────────────
   STATUS PILL CONFIG — redesign-plan.md Section 6.2
   Functional colors mapped onto the token system:
   hot = danger, warm = warning, converted = success,
   cold = neutral/muted (sapphire is reserved for AI-only
   moments per the design system, so "cold" doesn't borrow it).
───────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  hot: {
    label: "Hot",
    color: "var(--danger)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.3)",
  },
  warm: {
    label: "Warm",
    color: "var(--warning)",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
  },
  cold: {
    label: "Cold",
    color: "var(--text-muted)",
    bg: "var(--glass-1-bg)",
    border: "var(--glass-1-border)",
  },
  converted: {
    label: "Converted",
    color: "var(--success)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
  },
};

const ACCENT_STYLES: Record<
  string,
  { icon: string; bg: string; border: string }
> = {
  gold: {
    icon: "var(--gold-400)",
    bg: "rgba(99,102,241,0.08)",
    border: "var(--border-gold)",
  },
  danger: {
    icon: "var(--danger)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
  },
  success: {
    icon: "var(--success)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
};

export default function CRMPage() {
  const [leads, setLeads] = useState<UILead[]>([]);
  const [callLogs, setCallLogs] = useState<UICallLog[]>([]);
  const [siteVisits, setSiteVisits] = useState<UISiteVisit[]>([]);
  const [activeTab, setActiveTab] = useState<"leads" | "calls" | "visits">(
    "leads",
  );
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/leads", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/calls", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/site-visit", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([leadsData, callsData, visitsData]) => {
        if (Array.isArray(leadsData)) setLeads(leadsData);
        if (Array.isArray(callsData)) setCallLogs(callsData);
        if (Array.isArray(visitsData)) setSiteVisits(visitsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLeads = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone_number.includes(search);
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = [
    {
      key: "leads",
      label: "Total Leads",
      value: leads.length,
      icon: Users,
      accent: "gold",
    },
    {
      key: "hot",
      label: "Hot Leads",
      value: leads.filter((l) => l.status === "hot").length,
      icon: Star,
      accent: "danger",
    },
    {
      key: "calls",
      label: "Calls Logged",
      value: callLogs.length,
      icon: Phone,
      accent: "success",
    },
    {
      key: "visits",
      label: "Visits Booked",
      value: siteVisits.length,
      icon: Calendar,
      accent: "gold",
    },
  ];

  const tabs: {
    key: "leads" | "calls" | "visits";
    label: string;
    count: number;
  }[] = [
    { key: "leads", label: "Leads", count: leads.length },
    { key: "calls", label: "Call Logs", count: callLogs.length },
    { key: "visits", label: "Site Visits", count: siteVisits.length },
  ];

  return (
    <div
      className="min-h-screen pt-20 px-4 pb-20"
      style={{ background: "transparent" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p
            className="section-label mb-3"
            style={{ color: "var(--gold-400)" }}
          >
            CRM Intelligence
          </p>
          <h1
            className="font-display font-black text-4xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            CRM Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Live data from Supabase — populated by your n8n Real Estate Voice
            Agent Pro workflow.
          </p>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => {
            const a = ACCENT_STYLES[s.accent];
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-5"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: "var(--radius-lg)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  boxShadow: "var(--glass-2-highlight)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: a.bg, border: `1px solid ${a.border}` }}
                >
                  <s.icon className="w-5 h-5" style={{ color: a.icon }} />
                </div>
                <p
                  className="font-display font-black text-2xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.value}
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {s.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Tabs — Mac-style segmented glass control ── */}
        <div
          className="inline-flex items-stretch gap-1 p-1 w-full sm:w-auto mb-6"
          style={{
            background: "var(--glass-2-bg)",
            border: "1px solid var(--glass-2-border)",
            borderRadius: "var(--radius-lg)",
            backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
            WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                color:
                  activeTab === tab.key
                    ? "var(--void)"
                    : "var(--text-secondary)",
              }}
            >
              {activeTab === tab.key && (
                <motion.div
                  layoutId="crm-tab-pill"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                    boxShadow: "0 4px 12px rgba(99,102,241,0.18)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
              <span
                className="relative z-10 text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background:
                    activeTab === tab.key
                      ? "rgba(8,8,11,0.15)"
                      : "var(--glass-1-bg)",
                  color:
                    activeTab === tab.key ? "var(--void)" : "var(--text-muted)",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Search + filter (leads tab only) ── */}
        {activeTab === "leads" && (
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1 w-full sm:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads..."
                className="w-full rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: "var(--glass-1-bg)",
                  border: "1px solid var(--glass-1-border)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = "var(--border-gold)")
                }
                onBlur={(e) =>
                  (e.currentTarget.style.borderColor = "var(--glass-1-border)")
                }
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl px-4 py-2.5 text-sm outline-none w-full sm:w-auto"
              style={{
                background: "var(--glass-1-bg)",
                border: "1px solid var(--glass-1-border)",
                color: "var(--text-primary)",
              }}
            >
              {["all", "hot", "warm", "cold", "converted"].map((s) => (
                <option
                  key={s}
                  value={s}
                  style={{ background: "#0F172A", color: "white" }}
                  className="capitalize"
                >
                  {s === "all" ? "All Status" : s}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading CRM data from Supabase…
          </div>
        ) : (
          <>
            {/* ── LEADS ── */}
            {activeTab === "leads" && (
              <div
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: "var(--radius-lg)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  overflow: "hidden",
                }}
              >
                {filteredLeads.length === 0 ? (
                  <p
                    className="text-center py-12 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No leads yet — start a voice call to capture leads via n8n.
                  </p>
                ) : (
                  <div>
                    {filteredLeads.map((lead, i) => {
                      const cfg =
                        STATUS_CONFIG[lead.status] || STATUS_CONFIG.cold;
                      return (
                        <motion.div
                          key={lead.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="px-6 py-5 flex items-center gap-4 transition-colors"
                          style={{
                            borderBottom:
                              i < filteredLeads.length - 1
                                ? "1px solid var(--glass-1-border)"
                                : "none",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(255,255,255,0.02)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "transparent")
                          }
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(99,102,241,0.14), rgba(99,102,241,0.06))",
                              color: "var(--gold-400)",
                              border: "1px solid var(--border-gold)",
                            }}
                          >
                            {lead.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                              <p
                                className="text-sm font-semibold"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {lead.name}
                              </p>
                              <span
                                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide"
                                style={{
                                  color: cfg.color,
                                  background: cfg.bg,
                                  border: `1px solid ${cfg.border}`,
                                }}
                              >
                                {cfg.label}
                              </span>
                              {lead.interest_score > 0 && (
                                <span
                                  className="text-xs"
                                  style={{ color: "var(--gold-400)" }}
                                >
                                  {lead.interest_score}/100
                                </span>
                              )}
                            </div>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {lead.phone_number}
                            </p>
                            {lead.next_action && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {lead.next_action}
                              </p>
                            )}
                          </div>
                          <div className="hidden sm:flex flex-col items-end gap-1">
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {lead.interest}
                            </p>
                            <p
                              className="text-xs font-medium"
                              style={{ color: "var(--gold-400)" }}
                            >
                              {lead.budget}
                            </p>
                          </div>
                          <div
                            className="text-xs hidden md:block"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {formatDate(lead.created_at)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── CALLS ── */}
            {activeTab === "calls" && (
              <div
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: "var(--radius-lg)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  overflow: "hidden",
                }}
              >
                {callLogs.length === 0 ? (
                  <p
                    className="text-center py-12 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No calls logged yet.
                  </p>
                ) : (
                  <div>
                    {callLogs.map((log, i) => (
                      <motion.div
                        key={log.id ?? log.call_id ?? i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="px-6 py-5"
                        style={{
                          borderBottom:
                            i < callLogs.length - 1
                              ? "1px solid var(--glass-1-border)"
                              : "none",
                        }}
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              background: "rgba(16,185,129,0.12)",
                              border: "1px solid rgba(16,185,129,0.25)",
                            }}
                          >
                            <Phone
                              className="w-4 h-4"
                              style={{ color: "var(--success)" }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "var(--text-primary)" }}
                              >
                                {log.customer_name ||
                                  log.customer_phone ||
                                  "Unknown caller"}
                              </p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full capitalize"
                                  style={{
                                    color: "var(--success)",
                                    background: "rgba(16,185,129,0.12)",
                                    border: "1px solid rgba(16,185,129,0.25)",
                                  }}
                                >
                                  {log.call_status}
                                </span>
                                {log.duration_seconds != null && (
                                  <span
                                    className="text-xs flex items-center gap-1"
                                    style={{ color: "var(--text-muted)" }}
                                  >
                                    <Clock className="w-3 h-3" />
                                    {Math.floor(
                                      log.duration_seconds / 60,
                                    )}m {log.duration_seconds % 60}s
                                  </span>
                                )}
                              </div>
                            </div>
                            {log.property_queried && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: "var(--text-muted)" }}
                              >
                                Property: {log.property_queried}
                              </p>
                            )}
                          </div>
                        </div>
                        {log.summary && (
                          <div
                            className="ml-[52px] rounded-xl p-3"
                            style={{
                              background: "var(--glass-1-bg)",
                              border: "1px solid var(--glass-1-border)",
                            }}
                          >
                            <p
                              className="text-xs mb-1.5 flex items-center gap-1"
                              style={{ color: "var(--text-muted)" }}
                            >
                              <Brain
                                className="w-3 h-3"
                                style={{ color: "var(--gold-400)" }}
                              />
                              AI Call Summary
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              {log.summary}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── VISITS ── */}
            {activeTab === "visits" && (
              <div
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: "var(--radius-lg)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  overflow: "hidden",
                }}
              >
                {siteVisits.length === 0 ? (
                  <p
                    className="text-center py-12 text-sm"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No site visits booked yet.
                  </p>
                ) : (
                  <div>
                    {siteVisits.map((visit, i) => (
                      <motion.div
                        key={visit.id ?? i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="px-6 py-5 flex items-center gap-4"
                        style={{
                          borderBottom:
                            i < siteVisits.length - 1
                              ? "1px solid var(--glass-1-border)"
                              : "none",
                        }}
                      >
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: "rgba(16,185,129,0.12)",
                            border: "1px solid rgba(16,185,129,0.25)",
                          }}
                        >
                          <Calendar
                            className="w-4 h-4"
                            style={{ color: "var(--success)" }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p
                              className="text-sm font-medium"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {visit.lead_name}
                            </p>
                            <span
                              className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full capitalize"
                              style={{
                                color: "var(--success)",
                                background: "rgba(16,185,129,0.12)",
                                border: "1px solid rgba(16,185,129,0.25)",
                              }}
                            >
                              {visit.status}
                            </span>
                          </div>
                          <p
                            className="text-xs flex items-center gap-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            <MapPin className="w-3 h-3" />
                            {visit.property_address}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {visit.phone_number}
                          </p>
                        </div>
                        <div
                          className="text-right text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <p
                            className="font-medium"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {visit.visit_date}
                          </p>
                          <p>{visit.visit_time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

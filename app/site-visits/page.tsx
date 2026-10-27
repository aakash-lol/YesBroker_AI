"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { UISiteVisit } from "@/lib/mappers";

/* ─────────────────────────────────────────────
   STATUS BADGE CONFIG — redesign-plan.md Section 6.4
   Same semantic-color pattern as CRM's STATUS_CONFIG:
   success/warning/danger/sapphire tokens, not raw
   Tailwind color classes.
───────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  confirmed: {
    label: "Confirmed",
    color: "var(--success)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  booked: {
    label: "Booked",
    color: "var(--success)",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
  },
  pending: {
    label: "Pending",
    color: "var(--warning)",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
  },
  completed: {
    label: "Completed",
    color: "var(--sapphire-500)",
    bg: "rgba(37,99,235,0.08)",
    border: "var(--border-sapphire)",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--danger)",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
  },
};

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<UISiteVisit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = () => {
    setLoading(true);
    fetch("/api/site-visit", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setVisits(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    await fetch("/api/site-visit", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }).catch(() => {});
  };

  const upcoming = visits.filter((v) =>
    ["confirmed", "pending", "booked"].includes(v.status),
  );
  const completed = visits.filter((v) => v.status === "completed");
  const cancelled = visits.filter((v) => v.status === "cancelled");

  const VisitCard = ({ visit }: { visit: UISiteVisit }) => {
    const cfg = STATUS_CONFIG[visit.status] || STATUS_CONFIG.pending;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 transition-colors"
        style={{
          background: "var(--glass-2-bg)",
          border: "1px solid var(--glass-2-border)",
          borderRadius: "var(--radius-lg)",
          backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
          WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
          boxShadow: "var(--glass-2-highlight)",
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p
              className="font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {visit.lead_name}
            </p>
            {visit.phone_number && (
              <p
                className="text-xs flex items-center gap-1 mt-0.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Phone className="w-3 h-3" />
                {visit.phone_number}
              </p>
            )}
          </div>
          <span
            className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wide"
            style={{
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
            }}
          >
            {cfg.label}
          </span>
        </div>
        <div className="space-y-2 mb-4">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <MapPin
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--gold-400)" }}
            />
            {visit.property_address}
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <Calendar
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--gold-400)" }}
            />
            {visit.visit_date}
          </div>
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            <Clock
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--gold-400)" }}
            />
            {visit.visit_time}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Source: {visit.source}
          </p>
        </div>
        {["confirmed", "pending", "booked"].includes(visit.status) && (
          <div className="flex gap-2">
            {visit.status === "pending" && (
              <button
                onClick={() => updateStatus(visit.id, "confirmed")}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-colors"
                style={{
                  color: "var(--success)",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.25)",
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Confirm
              </button>
            )}
            {visit.status === "confirmed" && (
              <button
                onClick={() => updateStatus(visit.id, "completed")}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-medium transition-colors"
                style={{
                  color: "var(--sapphire-500)",
                  background: "rgba(37,99,235,0.06)",
                  border: "1px solid var(--border-sapphire)",
                }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Done
              </button>
            )}
            <button
              onClick={() => updateStatus(visit.id, "cancelled")}
              className="px-3 text-xs py-2 rounded-lg transition-colors"
              style={{
                color: "var(--text-muted)",
                background: "var(--glass-1-bg)",
                border: "1px solid var(--glass-1-border)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--danger)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div
      className="min-h-screen pt-20 px-4 pb-20"
      style={{ background: "transparent" }}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-end justify-between"
        >
          <div>
            <p
              className="section-label mb-3"
              style={{ color: "var(--gold-400)" }}
            >
              Booking Management
            </p>
            <h1
              className="font-display font-black text-4xl mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              Site Visit Dashboard
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              From n8n bookSiteVisit tool, call_analytics.visit_booked, and
              frontend bookings.
            </p>
          </div>
          <button
            onClick={loadVisits}
            className="p-2 rounded-full transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "var(--gold-400)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "var(--text-muted)")
            }
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </motion.div>

        {/* ── Summary strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Upcoming",
              value: upcoming.length,
              color: "var(--gold-400)",
            },
            {
              label: "Completed",
              value: completed.length,
              color: "var(--sapphire-500)",
            },
            {
              label: "Cancelled",
              value: cancelled.length,
              color: "var(--danger)",
            },
            {
              label: "Total",
              value: visits.length,
              color: "var(--text-primary)",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="p-4 text-center"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: "var(--radius-md)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
              }}
            >
              <p className="text-2xl font-bold" style={{ color: s.color }}>
                {s.value}
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--text-muted)" }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {loading ? (
          <div
            className="text-center py-20 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading visits from Supabase…
          </div>
        ) : visits.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ color: "var(--text-muted)" }}
          >
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">
              No site visits yet. Book via voice agent or property pages.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h2
                className="font-display font-semibold text-lg mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Upcoming Visits
              </h2>
              <div className="space-y-4">
                {upcoming.map((v) => (
                  <VisitCard key={v.id} visit={v} />
                ))}
                {upcoming.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No upcoming visits.
                  </p>
                )}
              </div>
            </div>
            <div>
              <h2
                className="font-display font-semibold text-lg mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Past Visits
              </h2>
              <div className="space-y-4">
                {[...completed, ...cancelled].map((v) => (
                  <VisitCard key={v.id} visit={v} />
                ))}
                {completed.length === 0 && cancelled.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No past visits yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

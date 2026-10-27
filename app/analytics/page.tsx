"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  Phone,
  DollarSign,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type AnalyticsData = {
  totalLeads: number;
  totalCalls: number;
  totalVisits: number;
  totalProperties: number;
  hotLeads: number;
  conversions: number;
  revenue: number;
  sentiment: { positive: number; neutral: number; negative: number };
  funnel: {
    calls: number;
    leads: number;
    visits: number;
    offers: number;
    deals: number;
  };
  monthlyTrend: { month: string; leads: number; calls: number }[];
  propertyPerformance: {
    name: string;
    inquiries: number;
    visits: number;
    deals: number;
  }[];
};

/* ─────────────────────────────────────────────
   RECHARTS COLOR SYSTEM — redesign-plan.md Section 6.3
   Gold = brand/platform metrics, Sapphire = AI-specific
   (calls are placed by the AI voice agent, so the two-series
   charts pair gold "leads/inquiries" against sapphire "calls/visits").
   Sentiment stays semantic (success/gold/danger) since it's
   reporting a functional state, not a brand moment.
───────────────────────────────────────────── */
const CHART_COLORS = {
  gold: "var(--gold-500)",
  goldFill: "#D4AF3733",
  sapphire: "var(--sapphire-500)",
  sapphireFill: "#3B82F633",
  success: "#10B981",
  danger: "#EF4444",
  grid: "rgba(255,255,255,0.05)",
  axisText: "#64748B",
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
  sapphire: {
    icon: "var(--sapphire-500)",
    bg: "rgba(37,99,235,0.08)",
    border: "var(--border-sapphire)",
  },
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{
        background: "var(--glass-3-bg)",
        border: "1px solid var(--border-gold)",
        backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
      }}
    >
      <p className="font-medium mb-1" style={{ color: "var(--gold-400)" }}>
        {label}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/** Shared glass-2 panel wrapper for chart cards — Section 6.3 */
function ChartPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-4 sm:p-6 w-full min-w-0"
      style={{
        background: "var(--glass-2-bg)",
        border: "1px solid var(--glass-2-border)",
        borderRadius: "var(--radius-lg)",
        backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
        WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
        boxShadow: "var(--glass-2-highlight)",
      }}
    >
      <h3
        className="font-display font-semibold text-sm mb-5"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false));
  }, []);

  const m = metrics ?? {
    totalLeads: 0,
    totalCalls: 0,
    totalVisits: 0,
    totalProperties: 0,
    hotLeads: 0,
    conversions: 0,
    revenue: 0,
    sentiment: { positive: 0, neutral: 0, negative: 0 },
    funnel: { calls: 0, leads: 0, visits: 0, offers: 0, deals: 0 },
    monthlyTrend: [],
    propertyPerformance: [],
  };

  const sentimentData = [
    {
      name: "Positive",
      value: m.sentiment.positive || 1,
      color: CHART_COLORS.success,
    },
    {
      name: "Neutral",
      value: m.sentiment.neutral || 1,
      color: CHART_COLORS.gold,
    },
    {
      name: "Negative",
      value: m.sentiment.negative || 1,
      color: CHART_COLORS.danger,
    },
  ];

  const funnelData = [
    { stage: "Calls", value: m.funnel.calls },
    { stage: "Leads", value: m.funnel.leads },
    { stage: "Visits", value: m.funnel.visits },
    { stage: "Offers", value: m.funnel.offers },
    { stage: "Deals", value: m.funnel.deals },
  ];

  /* Only "AI Calls" is genuinely AI-specific → sapphire.
     The rest are general platform credibility metrics → gold,
     mirroring the homepage trust-stats accent rule. */
  const kpis: {
    label: string;
    value: string;
    icon: React.ElementType;
    accent: "gold" | "sapphire";
  }[] = [
    {
      label: "Total Leads",
      value: m.totalLeads.toLocaleString(),
      icon: Users,
      accent: "gold",
    },
    {
      label: "AI Calls",
      value: m.totalCalls.toLocaleString(),
      icon: Phone,
      accent: "sapphire",
    },
    {
      label: "Site Visits",
      value: m.totalVisits.toLocaleString(),
      icon: Calendar,
      accent: "gold",
    },
    {
      label: "Deal Value",
      value: m.revenue > 0 ? formatPrice(m.revenue) : "—",
      icon: DollarSign,
      accent: "gold",
    },
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
            Real-Time Intelligence
          </p>
          <h1
            className="font-display font-black text-4xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Analytics Dashboard
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Live from call_logs · call_analytics · leads · negotiation_logs
          </p>
        </motion.div>

        {loading ? (
          <div
            className="text-center py-20 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            Loading analytics…
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, i) => {
                const a = ACCENT_STYLES[kpi.accent];
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="p-5"
                    style={{
                      background: "var(--glass-2-bg)",
                      border: "1px solid var(--glass-2-border)",
                      borderRadius: "var(--radius-lg)",
                      backdropFilter:
                        "blur(var(--glass-2-blur)) saturate(160%)",
                      WebkitBackdropFilter:
                        "blur(var(--glass-2-blur)) saturate(160%)",
                      boxShadow: "var(--glass-2-highlight)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: a.bg,
                          border: `1px solid ${a.border}`,
                        }}
                      >
                        <kpi.icon
                          className="w-5 h-5"
                          style={{ color: a.icon }}
                        />
                      </div>
                      {m.hotLeads > 0 && kpi.label === "Total Leads" && (
                        <span
                          className="text-xs flex items-center gap-0.5 px-2 py-0.5 rounded-full"
                          style={{
                            color: "var(--success)",
                            background: "rgba(16,185,129,0.12)",
                          }}
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          {m.hotLeads} hot
                        </span>
                      )}
                    </div>
                    <p
                      className="font-display font-black text-2xl"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {kpi.value}
                    </p>
                    <p
                      className="text-sm mt-0.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {kpi.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Trends + Sentiment ── */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <ChartPanel title="Call Sentiment">
                <div className="flex justify-center mb-4">
                  <PieChart width={160} height={160}>
                    <Pie
                      data={sentimentData}
                      cx={75}
                      cy={75}
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="space-y-2">
                  {sentimentData.map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: s.color }}
                        />
                        <span style={{ color: "var(--text-secondary)" }}>
                          {s.name}
                        </span>
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {m.totalCalls > 0 ? `${s.value}%` : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              </ChartPanel>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

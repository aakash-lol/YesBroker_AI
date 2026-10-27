"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Phone,
  Brain,
  Zap,
  BarChart3,
  Building2,
  Search,
  ArrowRight,
  MapPin,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  Sparkles,
  CheckCircle,
  MessageSquare,
  ChevronDown
} from "lucide-react";

import type { UIProperty } from "@/lib/mappers";
import PropertyCard from "@/components/property/PropertyCard";
import Testimonials from "@/components/sections/Testimonials";
import FAQSection from "@/components/sections/FAQSection";
import Footer from "@/components/layout/Footer";

type Property = UIProperty;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const kpiStats: {
  icon: React.ElementType;
  value: string;
  label: string;
  sub: string;
  accent: "indigo" | "blue" | "purple" | "emerald";
}[] = [
  {
    icon: Building2,
    value: "10K+",
    label: "Properties Managed",
    sub: "Across 50+ cities",
    accent: "indigo",
  },
  {
    icon: Activity,
    value: "97%",
    label: "AI Match Accuracy",
    sub: "In recommendations",
    accent: "blue",
  },
  {
    icon: Zap,
    value: "45%",
    label: "Faster Closings",
    sub: "vs traditional methods",
    accent: "purple",
  },
  {
    icon: DollarSign,
    value: "$2B+",
    label: "Transactions",
    sub: "Total value assisted",
    accent: "emerald",
  },
];

const workflowSteps = [
  {
    icon: Phone,
    label: "Call Comes In",
    desc: "Vapi Voice AI answers 24/7",
    num: "01",
  },
  {
    icon: Brain,
    label: "AI Qualifies",
    desc: "Intent & budget scored",
    num: "02",
  },
  {
    icon: Search,
    label: "Property Match",
    desc: "Semantic RAG search",
    num: "03",
  },
  {
    icon: Zap,
    label: "AI Negotiates",
    desc: "Optimal counter-offers",
    num: "04",
  },
  {
    icon: CheckCircle,
    label: "Deal Closed",
    desc: "Commission earned",
    num: "05",
  },
];

/* KPI icon color helper */
function kpiColor(accent: string) {
  switch (accent) {
    case "indigo":  return { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.20)", icon: "#6366F1" };
    case "blue":    return { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.20)", icon: "#3B82F6" };
    case "purple":  return { bg: "rgba(124,58,237,0.08)", border: "rgba(124,58,237,0.20)", icon: "#7C3AED" };
    case "emerald": return { bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.20)", icon: "#10B981" };
    default:        return { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.20)", icon: "#6366F1" };
  }
}

/* ─────────────────────────────────────────────
   MAIN PAGE — Light Theme
───────────────────────────────────────────── */

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [typedText, setTypedText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);

  const phrases = [
    "Find a 4BHK villa under 10M...",
    "Show off-plan apartments with 8%+ rental yield...",
    "Luxury penthouse with city views...",
    "Investment property with high ROI...",
  ];

  useEffect(() => {
    const phrase = phrases[phraseIndex];
    let i = 0;
    setTypedText("");
    const typer = setInterval(() => {
      if (i < phrase.length) {
        setTypedText(phrase.slice(0, i + 1));
        i++;
      } else {
        clearInterval(typer);
        setTimeout(
          () => setPhraseIndex((phraseIndex + 1) % phrases.length),
          2500,
        );
      }
    }, 45);
    return () => clearInterval(typer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phraseIndex]);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d: UIProperty[]) => {
        if (Array.isArray(d)) setProperties(d.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "transparent" }}>

      {/* ══════════════════════════════════════════════
          HERO SECTION — Light Theme
      ══════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden"
      >
        {/* ── Full-bleed Background Image ── */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/homepage.png"
            alt="Luxury city skyline — AI Real Estate"
            fill
            className="object-cover object-[75%_100%] md:object-bottom"
            style={{ opacity: 0.95 }}
            priority
            sizes="100vw"
          />

          {/* Left gradient — white fade for text readability */}
          <div
            className="absolute inset-0 hidden md:block pointer-events-none"
            style={{
              background:
                "linear-gradient(105deg, rgba(248,249,252,0.92) 0%, rgba(248,249,252,0.78) 32%, rgba(248,249,252,0.25) 55%, rgba(248,249,252,0.0) 100%)",
            }}
          />

          {/* Mobile — lighter overall overlay */}
          <div
            className="absolute inset-0 md:hidden pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(248,249,252,0.95) 0%, rgba(248,249,252,0.85) 40%, rgba(248,249,252,0.3) 75%, rgba(248,249,252,0.0) 100%)",
            }}
          />

          {/* Bottom fade to page background */}
          <div
            className="absolute bottom-0 inset-x-0 pointer-events-none"
            style={{
              height: "150px",
              background:
                "linear-gradient(to top, rgba(248,249,252,1) 0%, rgba(248,249,252,0.3) 50%, transparent 100%)",
            }}
          />
        </div>

        {/* ── Hero Content ── */}
        <div className="relative z-10 flex flex-col flex-1 w-full">
          {/* Spacer for navbar */}
          <div style={{ height: "clamp(76px, 9vw, 100px)" }} />

          {/* Main content area */}
          <div className="flex-1 flex items-center">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
              <div className="max-w-xl xl:max-w-2xl">

                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex items-center gap-2 mb-5 md:mb-7"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    borderRadius: "9999px",
                    padding: "7px 18px",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Sparkles
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: "#6366F1" }}
                  />
                  <span
                    className="text-[11px] sm:text-[12px] font-semibold tracking-wide"
                    style={{ color: "#4F46E5" }}
                  >
                    Enterprise AI Platform for Real Estate
                  </span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display font-black tracking-tight mb-5 md:mb-6"
                  style={{
                    fontSize: "clamp(38px, 6vw, 76px)",
                    lineHeight: 1.04,
                    color: "#0F172A",
                  }}
                >
                  The{" "}
                  <span
                    style={{
                      background:
                        "linear-gradient(135deg, #4F46E5 0%, #6366F1 40%, #818CF8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    AI-Powered
                  </span>
                  <br />
                  Real Estate Agent
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.65 }}
                  className="text-base sm:text-lg leading-relaxed mb-8 md:mb-10"
                  style={{
                    color: "#475569",
                    maxWidth: "440px",
                  }}
                >
                  Experience the future of real estate with intelligent
                  matchmaking, autonomous negotiations, and 24/7 AI-powered
                  advisory.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.6 }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4"
                >
                  {/* Primary — Indigo/Purple gradient */}
                  <Link
                    href="/voice-agent"
                    id="hero-cta-voice"
                    className="flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background:
                        "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                      color: "#FFFFFF",
                      borderRadius: "9999px",
                      padding: "14px 28px",
                      boxShadow:
                        "0 8px 28px rgba(99,102,241,0.35), 0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    Start AI Voice Agent
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>

                  {/* Secondary — White outlined */}
                  <Link
                    href="/marketplace"
                    id="hero-cta-marketplace"
                    className="flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
                    style={{
                      background: "rgba(255,255,255,0.75)",
                      border: "1px solid rgba(100,116,180,0.18)",
                      color: "#0F172A",
                      borderRadius: "9999px",
                      padding: "14px 28px",
                      backdropFilter: "blur(16px) saturate(150%)",
                      WebkitBackdropFilter: "blur(16px) saturate(150%)",
                      boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Search className="w-4 h-4 shrink-0" style={{ color: "#6366F1" }} />
                    Explore Marketplace
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>

          {/* ── Stats bar — frosted white glass ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.52, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-8 md:pb-14 mt-12 md:mt-0"
          >
            <div
              className="grid grid-cols-2 lg:grid-cols-4"
              style={{
                background: "rgba(255,255,255,0.78)",
                border: "1px solid rgba(100,116,180,0.12)",
                backdropFilter: "blur(32px) saturate(150%)",
                WebkitBackdropFilter: "blur(32px) saturate(150%)",
                borderRadius: "20px",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              {kpiStats.map((s, i) => {
                const c = kpiColor(s.accent);
                return (
                  <div
                    key={s.label}
                    className="relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-5 md:p-6"
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: c.bg,
                        border: `1px solid ${c.border}`,
                      }}
                    >
                      <s.icon
                        className="w-5 h-5"
                        style={{ color: c.icon }}
                      />
                    </div>
                    <div className="text-center sm:text-left min-w-0">
                      <p
                        className="font-display font-black text-lg leading-none"
                        style={{ color: "#0F172A" }}
                      >
                        {s.value}
                      </p>
                      <p
                        className="text-xs font-medium mt-1 leading-snug"
                        style={{ color: "#475569" }}
                      >
                        {s.label}
                      </p>
                      {s.sub && (
                        <p
                          className="text-[10px] mt-0.5 leading-snug truncate"
                          style={{ color: "#94A3B8" }}
                        >
                          {s.sub}
                        </p>
                      )}
                    </div>
                    {/* Dividers */}
                    {i < kpiStats.length - 1 && (
                      <div
                        className="hidden lg:block absolute right-0 top-1/4 bottom-1/4 w-px"
                        style={{ background: "rgba(100,116,180,0.12)" }}
                      />
                    )}
                    {i < 2 && (
                      <div
                        className="lg:hidden absolute bottom-0 left-5 right-5 h-px"
                        style={{ background: "rgba(100,116,180,0.10)" }}
                      />
                    )}
                    {i % 2 === 0 && (
                      <div
                        className="lg:hidden absolute right-0 top-5 bottom-5 w-px"
                        style={{ background: "rgba(100,116,180,0.10)" }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          AI SEARCH BAR
      ══════════════════════════════════════════════ */}
      <section id="ai-search" className="relative z-10 py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label text-center mb-4">AI Discovery</p>
            <h2
              className="font-display font-black text-center mb-8"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--text-primary)" }}
            >
              Ask anything about properties
            </h2>

            <div
              className="relative p-2"
              style={{
                background: "rgba(255,255,255,0.82)",
                border: "1px solid rgba(99,102,241,0.18)",
                backdropFilter: "blur(32px) saturate(150%)",
                WebkitBackdropFilter: "blur(32px) saturate(150%)",
                borderRadius: "var(--radius-xl)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9), 0 0 20px rgba(99,102,241,0.04)",
              }}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-2 sm:px-4 py-2 sm:py-3">
                <div className="flex items-center w-full gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.18)",
                    }}
                  >
                    <Brain className="w-4 h-4" style={{ color: "#6366F1" }} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      searchQuery.trim() &&
                      (window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`)
                    }
                    placeholder={typedText || "Ask AI anything about properties..."}
                    className="flex-1 min-w-0 bg-transparent placeholder-[var(--text-muted)] outline-none text-sm sm:text-base font-medium"
                    style={{ color: "var(--text-primary)" }}
                    id="hero-search-input"
                  />
                  <span className="hidden sm:inline cursor-blink font-light shrink-0" style={{ color: "#6366F1" }}>|</span>
                </div>
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  id="hero-search-btn"
                  className="btn-primary w-full sm:w-auto justify-center text-sm px-5 py-3 sm:py-2.5 rounded-xl shrink-0 mt-2 sm:mt-0"
                >
                  <Search className="w-4 h-4" />
                  Search
                </Link>
              </div>
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                "4BHK Palm Jumeirah",
                "ROI 8%+ Dubai",
                "Off-plan Creek Harbour",
                "Penthouse DIFC",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => setSearchQuery(q)}
                  className="text-xs font-medium transition-all duration-200 px-4 py-2 rounded-full whitespace-nowrap hover:bg-[rgba(99,102,241,0.10)]"
                  style={{
                    background: "rgba(99,102,241,0.05)",
                    border: "1px solid rgba(99,102,241,0.14)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — WORKFLOW
      ══════════════════════════════════════════════ */}
      <section id="workflow" className="relative z-10 py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none hidden md:block"
            style={{
              width: "80%",
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.10), rgba(124,58,237,0.08), transparent)",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 md:mb-16"
          >
            <p className="section-label mb-4">Workflow</p>
            <h2
              className="font-display font-black"
              style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--text-primary)" }}
            >
              From call to <span className="text-gradient-blue">closed deal</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-4 items-start relative">
            <div
              className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.15), rgba(124,58,237,0.12), transparent)",
              }}
            />

            {workflowSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-row lg:flex-col items-center text-left lg:text-center gap-4 relative z-10"
              >
                <div
                  className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(99,102,241,0.15)",
                    backdropFilter: "blur(20px) saturate(150%)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.04), 0 0 12px rgba(99,102,241,0.04)",
                  }}
                >
                  <step.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: "#6366F1" }} />
                  <div
                    className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-7 md:h-7 rounded-xl flex items-center justify-center text-[10px] md:text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg, #6366F1, #818CF8)" }}
                  >
                    {step.num}
                  </div>
                </div>
                <div>
                  <p style={{ color: "var(--text-primary)" }} className="font-bold text-sm md:text-base mb-1">
                    {step.label}
                  </p>
                  <p style={{ color: "var(--text-muted)" }} className="text-xs md:text-sm">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURED PROPERTIES
      ══════════════════════════════════════════════ */}
      <section id="featured-properties" className="relative z-10 py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="section-label mb-3">Marketplace</p>
              <h2
                className="font-display font-black"
                style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--text-primary)" }}
              >
                Featured Properties
              </h2>
            </div>
            <Link
              href="/marketplace"
              className="btn-secondary text-sm hidden sm:flex"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {properties.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 md:py-24 flex flex-col items-center gap-4"
            >
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center"
                style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)" }}
              >
                <Building2 className="w-8 h-8 md:w-9 md:h-9 opacity-50" style={{ color: "#6366F1" }} />
              </div>
              <p className="text-xs md:text-sm" style={{ color: "var(--text-muted)" }}>
                No properties found. Add properties via Supabase or the n8n workflow.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {properties.map((p, i) => (
                <PropertyCard key={p.id} property={p} index={i} />
              ))}
            </div>
          )}

          <div className="sm:hidden flex justify-center mt-8">
            <Link href="/marketplace" className="btn-secondary w-full justify-center text-sm">
              View All Properties
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════ */}
      <Testimonials />

      {/* ══════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════ */}
      <section id="cta-banner" className="relative z-10 py-16 md:py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative overflow-hidden text-center p-8 md:p-12"
            style={{
              background: "rgba(255,255,255,0.78)",
              border: "1px solid rgba(100,116,180,0.12)",
              backdropFilter: "blur(32px) saturate(150%)",
              WebkitBackdropFilter: "blur(32px) saturate(150%)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.9)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none" style={{ background: "radial-gradient(ellipse at center top, rgba(99,102,241,0.06), transparent)" }} />
            <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.20), rgba(129,140,248,0.15), transparent)" }} />

            <p className="mb-3 md:mb-5 relative z-10 text-[10px] md:text-[11px] font-bold uppercase" style={{ letterSpacing: "0.2em", color: "#6366F1" }}>
              Ready to automate?
            </p>
            <h2 className="font-display font-black mb-4 relative z-10" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--text-primary)" }}>
              Start closing deals <span className="text-gradient-aurora">with AI</span>
            </h2>
            <p className="text-sm md:text-lg mb-8 md:mb-10 max-w-xl mx-auto relative z-10" style={{ color: "var(--text-secondary)" }}>
              Deploy your AI real estate agent in minutes. Voice, search, negotiation, CRM — all in one enterprise platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center relative z-10">
              <Link href="/voice-agent" className="btn-gold text-sm px-6 md:px-8 py-3 md:py-4 justify-center rounded-full">
                <Phone className="w-4 h-4" /> Start AI Voice Agent
              </Link>
              <Link href="/analytics" className="btn-secondary text-sm px-6 md:px-8 py-3 md:py-4 justify-center rounded-full">
                <BarChart3 className="w-4 h-4" /> View Analytics
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <FAQSection />
      <Footer />
    </div>
  );
}

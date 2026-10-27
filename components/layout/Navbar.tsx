"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Building2,
  Menu,
  X,
  Home,
  Search,
  Zap,
  BarChart3,
  Users,
  MessageSquare,
  LayoutGrid,
  Calendar,
  Shield,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   NAV DATA — Light Theme
───────────────────────────────────────────── */

const publicNavItems: { label: string; href: string; icon: any }[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Marketplace", href: "/marketplace", icon: Building2 },
  { label: "Voice AI", href: "/voice-agent", icon: Zap },
];

const opsNavItems: { label: string; href: string; icon: any; sub: string }[] = [
  { label: "CRM", href: "/crm", icon: Users, sub: "Leads & calls" },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    sub: "Performance data",
  },
  {
    label: "Site Visits",
    href: "/site-visits",
    icon: Calendar,
    sub: "Booking pipeline",
  },
  {
    label: "WhatsApp",
    href: "/whatsapp",
    icon: MessageSquare,
    sub: "Twilio activity",
  },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [opsOpen, setOpsOpen] = useState(false);
  const opsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const isOpsRoute = opsNavItems.some((item) => item.href === pathname);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpsOpen(false);
  }, [pathname]);

  // Close the ops dropdown on outside click
  useEffect(() => {
    if (!opsOpen) return;
    const handler = (e: MouseEvent) => {
      if (opsRef.current && !opsRef.current.contains(e.target as Node)) {
        setOpsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [opsOpen]);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed z-50"
      style={{
        top: "max(1rem, env(safe-area-inset-top))",
        left: "max(1rem, env(safe-area-inset-left))",
        right: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <div className="max-w-6xl mx-auto relative">
        {/* ── Floating pill — white frosted glass ── */}
        <nav
          className="glass-fixed flex items-center justify-between gap-3 px-3 md:px-5 py-2.5 transition-shadow duration-300"
          style={{
            background: isScrolled
              ? "rgba(255,255,255,0.88)"
              : "rgba(255,255,255,0.72)",
            border: "1px solid rgba(100,116,180,0.12)",
            backdropFilter: "blur(32px) saturate(150%)",
            WebkitBackdropFilter: "blur(32px) saturate(150%)",
            borderRadius: "999px",
            boxShadow: isScrolled
              ? "0 4px 24px rgba(0,0,0,0.06), 0 1px 0 rgba(255,255,255,0.9) inset"
              : "0 2px 12px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.9) inset",
          }}
        >
          {/* ── Logo ── */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
            id="nav-logo"
          >
            <div className="relative w-9 h-9 shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#4F46E5] opacity-15 blur-md group-hover:opacity-25 transition-opacity duration-300" />
              <div
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #6366F1, #4F46E5)",
                  boxShadow: "0 4px 12px rgba(99,102,241,0.25)",
                }}
              >
                <Building2
                  className="w-4.5 h-4.5"
                  style={{ color: "#FFFFFF", width: "18px", height: "18px" }}
                />
              </div>
            </div>
            <span className="font-sans font-bold text-[15px] sm:text-[16px] tracking-tight leading-none inline">
              <span style={{ color: "var(--text-primary)" }}>YesBroker</span>{" "}
              <span
                className="font-black text-[12px] sm:text-[13px]"
                style={{
                  background: "linear-gradient(135deg, #6366F1, #818CF8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AI
              </span>
            </span>
          </Link>

          {/* ── Desktop Nav — public items with icons ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {publicNavItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="relative flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-colors duration-200"
                  style={{
                    color: active
                      ? "#4F46E5"
                      : "var(--text-secondary)",
                  }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "rgba(99,102,241,0.08)",
                        border: "1px solid rgba(99,102,241,0.18)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <item.icon className="relative z-10 w-3.5 h-3.5" />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}

            {/* ── Ops dropdown trigger ── */}
            <div className="relative ml-1" ref={opsRef}>
              <button
                onClick={() => setOpsOpen((v) => !v)}
                id="nav-ops-toggle"
                className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-medium transition-colors duration-200"
                style={{
                  color:
                    isOpsRoute || opsOpen
                      ? "#4F46E5"
                      : "var(--text-secondary)",
                  background: isOpsRoute
                    ? "rgba(99,102,241,0.08)"
                    : opsOpen
                      ? "rgba(99,102,241,0.05)"
                      : "transparent",
                  border: isOpsRoute
                    ? "1px solid rgba(99,102,241,0.18)"
                    : "1px solid transparent",
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Ops
              </button>

              <AnimatePresence>
                {opsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 z-50 overflow-hidden"
                    style={{
                      width: 320,
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(100,116,180,0.15)",
                      backdropFilter:
                        "blur(40px) saturate(150%)",
                      WebkitBackdropFilter:
                        "blur(40px) saturate(150%)",
                      borderRadius: "var(--radius-lg)",
                      boxShadow:
                        "0 12px 40px rgba(0,0,0,0.08), 0 0 20px rgba(99,102,241,0.04)",
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{
                        borderBottom: "1px solid rgba(100,116,180,0.10)",
                      }}
                    >
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          color: "#6366F1",
                          letterSpacing: "0.14em",
                        }}
                      >
                        Internal Tools
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-2">
                      {opsNavItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            id={`nav-ops-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                            className="flex flex-col gap-1.5 p-3 rounded-xl transition-colors"
                            style={{
                              background: active
                                ? "rgba(99,102,241,0.06)"
                                : "transparent",
                              border: active
                                ? "1px solid rgba(99,102,241,0.18)"
                                : "1px solid transparent",
                            }}
                          >
                            <item.icon
                              className="w-4 h-4"
                              style={{
                                color: active
                                  ? "#4F46E5"
                                  : "var(--text-muted)",
                              }}
                            />
                            <div>
                              <p
                                className="text-xs font-semibold leading-none"
                                style={{
                                  color: active
                                    ? "var(--text-primary)"
                                    : "var(--text-secondary)",
                                }}
                              >
                                {item.label}
                              </p>
                              <p
                                className="text-[10px] mt-1"
                                style={{ color: "var(--text-muted)" }}
                              >
                                {item.sub}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ── Desktop CTA — Purple/blue gradient with arrow ── */}
          <Link
            href="/voice-agent"
            id="nav-cta"
            className="hidden lg:flex items-center gap-1.5 px-5 py-2.5 rounded-full text-[13px] font-bold shrink-0 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            style={{
              background:
                "linear-gradient(135deg, #6366F1, #4F46E5)",
              color: "#FFFFFF",
              boxShadow: "0 4px 16px rgba(99,102,241,0.30)",
            }}
          >
            Get Started
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          {/* ── Mobile Toggle ── */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            id="nav-mobile-toggle"
            className="lg:hidden p-2 rounded-full transition-colors shrink-0"
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.12)",
            }}
          >
            {mobileOpen ? (
              <X
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
            ) : (
              <Menu
                className="w-4 h-4"
                style={{ color: "var(--text-secondary)" }}
              />
            )}
          </button>
        </nav>

        {/* ── Mobile Menu — light glass panel ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="glass-fixed lg:hidden absolute top-full left-0 right-0 mt-2 overflow-hidden max-h-[75vh] overflow-y-auto"
              style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(100,116,180,0.12)",
                backdropFilter: "blur(40px) saturate(150%)",
                WebkitBackdropFilter:
                  "blur(40px) saturate(150%)",
                borderRadius: "var(--radius-xl)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="px-3 pt-3 pb-1 space-y-1">
                <p
                  className="px-4 pb-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{ color: "#6366F1", letterSpacing: "0.14em" }}
                >
                  Explore
                </p>
                {publicNavItems.map((item, i) => {
                  const active = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        id={`nav-mobile-${item.label.toLowerCase()}`}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={{
                          color: active
                            ? "#4F46E5"
                            : "var(--text-secondary)",
                          background: active
                            ? "rgba(99,102,241,0.06)"
                            : "transparent",
                          border: active
                            ? "1px solid rgba(99,102,241,0.18)"
                            : "1px solid transparent",
                        }}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Internal ops */}
              <div
                className="px-3 pt-3 pb-2 space-y-1"
                style={{ borderTop: "1px solid rgba(100,116,180,0.10)" }}
              >
                <p
                  className="px-4 pb-1 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: "#6366F1",
                    letterSpacing: "0.14em",
                  }}
                >
                  Internal Tools
                </p>
                <div className="grid grid-cols-2 gap-1.5 px-1">
                  {opsNavItems.map((item, i) => {
                    const active = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.03 }}
                      >
                        <Link
                          href={item.href}
                          id={`nav-mobile-ops-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex flex-col gap-1 p-3 rounded-xl transition-all"
                          style={{
                            color: active
                              ? "#4F46E5"
                              : "var(--text-secondary)",
                            background: active
                              ? "rgba(99,102,241,0.06)"
                              : "rgba(255,255,255,0.5)",
                            border: active
                              ? "1px solid rgba(99,102,241,0.18)"
                              : "1px solid rgba(100,116,180,0.08)",
                          }}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-medium">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="px-3 pt-2 pb-3">
                <Link
                  href="/voice-agent"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold"
                  style={{
                    background:
                      "linear-gradient(135deg, #6366F1, #4F46E5)",
                    color: "#FFFFFF",
                    boxShadow: "0 4px 16px rgba(99,102,241,0.25)",
                  }}
                >
                  <Phone className="w-4 h-4" />
                  Get Started
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

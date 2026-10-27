import Link from "next/link";
import { Building2, ShieldCheck, Lock, Zap, Headphones } from "lucide-react";

/* ─────────────────────────────────────────────
   SHARED FOOTER — Light Theme
───────────────────────────────────────────── */

const TRUST_BADGES: { icon: React.ElementType; label: string }[] = [
  { icon: ShieldCheck, label: "RERA Verified Listings" },
  { icon: Zap, label: "AI Voice Agents" },
  { icon: Lock, label: "Secure Cloud" },
  { icon: Headphones, label: "24/7 Automation" },
];

const PRODUCT_LINKS = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Voice AI", href: "/voice-agent" },
  { label: "AI Search", href: "/search" },
  { label: "Negotiation", href: "/negotiation" },
];

const COMPANY_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 pt-16 pb-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ── Trust badges strip ── */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12 p-2"
          style={{
            background: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(100,116,180,0.12)",
            borderRadius: "var(--radius-lg)",
            backdropFilter: "blur(20px) saturate(150%)",
            WebkitBackdropFilter: "blur(20px) saturate(150%)",
          }}
        >
          {TRUST_BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <b.icon
                  className="w-4 h-4"
                  style={{ color: "#6366F1" }}
                />
              </div>
              <span
                className="text-xs font-medium leading-tight"
                style={{ color: "var(--text-secondary)" }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-10 mb-10">
          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, #6366F1, #4F46E5)",
                }}
              >
                <Building2
                  className="w-4 h-4"
                  style={{ color: "#FFFFFF" }}
                />
              </div>
              <span
                className="font-display font-bold text-base"
                style={{ color: "var(--text-primary)" }}
              >
                <span>Yes</span>Broker{" "}
                <span className="text-gradient-gold">AI</span>
              </span>
            </div>
            <p
              className="text-sm max-w-sm leading-relaxed"
              style={{ color: "var(--text-muted)" }}
            >
              Enterprise-grade AI operating system for modern real estate. Voice
              agents, negotiation engine, and intelligent marketplace in one
              platform.
            </p>
          </div>

          {/* Product links */}
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "#6366F1", letterSpacing: "0.14em" }}
            >
              Product
            </p>
            <div className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm transition-colors w-fit hover:text-[#4F46E5]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-wider mb-4"
              style={{ color: "#6366F1", letterSpacing: "0.14em" }}
            >
              Company
            </p>
            <div className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm transition-colors w-fit hover:text-[#4F46E5]"
                  style={{ color: "var(--text-muted)" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="divider-glow mb-6" />

        {/* ── Legal / RERA line ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p
            className="text-xs text-center sm:text-left"
            style={{ color: "var(--text-muted)" }}
          >
            © {new Date().getFullYear()} YesBroker AI. Enterprise Real Estate
            Intelligence Platform. All properties listed are RERA-compliant
            where applicable; verify registration numbers independently before
            transacting.
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <ShieldCheck
              className="w-3.5 h-3.5"
              style={{ color: "#6366F1" }}
            />
            <span
              className="text-[11px] font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              RERA Registered Platform
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

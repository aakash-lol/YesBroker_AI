"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  Brain,
  Phone,
  Calendar,
  Star,
  ChevronLeft,
  Zap,
  ShieldCheck,
  Sparkles,
  Calculator,
} from "lucide-react";
import { formatPrice, demoProperties } from "@/lib/utils";
import type { UIProperty } from "@/lib/mappers";
import PropertyCard from "@/components/property/PropertyCard";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

function getPropertyImage(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("sobha dream") || t.includes("sobhadream"))
    return "/images/Sobha_Dream.png";
  if (t.includes("sobha")) return "/images/Sobha.png";
  if (t.includes("brigade cornerstone") || t.includes("cornerstone"))
    return "/images/Brigade_Cornerstone.png";
  if (t.includes("brigade el dorado") || t.includes("el dorado"))
    return "/images/Brigade_El_Dorado.png";
  if (t.includes("brigade")) return "/images/Brigade_Cornerstone.png";
  if (t.includes("prestige")) return "/images/Prestige.png";
  if (t.includes("godrej")) return "/images/Godrej.png";
  if (t.includes("purva") || t.includes("puravankara"))
    return "/images/Purva.png";
  if (t.includes("assetz")) return "/images/Assetz.png";
  if (t.includes("sattva")) return "/images/Sattva.png";
  if (t.includes("lakeview") || t.includes("lake view"))
    return "/images/Lakeview.png";
  return null;
}

/* ─────────────────────────────────────────────
   FLOATING-LABEL INPUT
   redesign-plan.md — Section 4.3
───────────────────────────────────────────── */
function FloatingInput({
  id,
  label,
  type = "text",
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0 || type === "date";
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-xl px-4 pt-5 pb-2 text-sm outline-none transition-colors [color-scheme:dark]"
        style={{
          background: "var(--glass-1-bg)",
          border: `1px solid ${focused ? "var(--border-gold)" : "var(--glass-1-border)"}`,
          color: "var(--text-primary)",
        }}
      />
      <label
        htmlFor={id}
        className="absolute left-4 pointer-events-none transition-all duration-200"
        style={{
          top: active ? 6 : "50%",
          transform: active ? "translateY(0)" : "translateY(-50%)",
          fontSize: active ? 10 : 13,
          fontWeight: active ? 700 : 500,
          letterSpacing: active ? "0.06em" : "normal",
          textTransform: active ? "uppercase" : "none",
          color: active ? "var(--gold-400)" : "var(--text-muted)",
        }}
      >
        {label}
      </label>
    </div>
  );
}

export default function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [property, setProperty] = useState<UIProperty | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "investment" | "area"
  >("overview");
  const [visitForm, setVisitForm] = useState({ name: "", phone: "", date: "" });
  const [visitBooked, setVisitBooked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [similarProperties, setSimilarProperties] = useState<UIProperty[]>([]);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenureYears, setTenureYears] = useState(20);

  useEffect(() => {
    fetch(`/api/properties?id=${encodeURIComponent(id)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        const isProd = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production";
        if (d?.id) {
          setProperty(d);
        } else if (!isProd) {
          // In development, allow demoProperties to act as a fallback so
          // clicking mock cards shows a detail page locally.
          const demo = demoProperties.find((p) => String(p.id) === String(id));
          if (demo) {
            setProperty({
              id: demo.id,
              title: demo.title,
              description: demo.description,
              location: `${demo.area}, ${demo.city}`,
              area: demo.area ?? "",
              city: demo.city,
              property_type: demo.property_type,
              price: demo.price,
              currency: demo.currency,
              amenities: [] as string[],
              featured: demo.featured ?? false,
              status: demo.status ?? "available",
              investment_score: demo.investment_score ?? 80,
              minimum_price: 0,
              availability_status: demo.status ?? "available",
              builder_details: "",
              possession_date: "",
              rera_number: "",
            } as UIProperty);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Similar Properties — Section 4.5 ── */
  useEffect(() => {
    if (!property) return;
    fetch("/api/properties", { cache: "no-store" })
      .then((r) => r.json())
      .then((all: UIProperty[]) => {
        if (!Array.isArray(all)) return;
        const scored = all
          .filter((p) => p.id !== property.id)
          .map((p) => {
            let score = 0;
            if (p.city && property.city && p.city === property.city) score += 2;
            if (p.property_type === property.property_type) score += 2;
            const priceDiff =
              Math.abs(p.price - property.price) / (property.price || 1);
            if (priceDiff < 0.35) score += 1;
            return { p, score };
          })
          .sort((a, b) => b.score - a.score);
        const top = scored
          .filter((s) => s.score > 0)
          .slice(0, 6)
          .map((s) => s.p);
        setSimilarProperties(
          top.length
            ? top
            : all.filter((p) => p.id !== property.id).slice(0, 6),
        );
      })
      .catch(() => {});
  }, [property]);

  const gradients = [
    "from-amber-900/60",
    "from-blue-900/60",
    "from-emerald-900/60",
    "from-violet-900/60",
  ];
  const gradient =
    gradients[parseInt(id.replace(/\D/g, "") || "0", 10) % gradients.length];

  const bookVisit = async () => {
    if (!property || !visitForm.name || !visitForm.phone || !visitForm.date)
      return;
    try {
      await fetch("/api/site-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_name: visitForm.name,
          lead_phone: visitForm.phone,
          property_id: property.id,
          property_address: property.title,
          visit_date: visitForm.date,
          visit_time: "10:00",
          notes: `Site visit for ${property.title}`,
        }),
      });
    } catch {
      /* non-blocking */
    }
    setVisitBooked(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center text-gray-500">
        Loading property…
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center text-gray-500 gap-4">
        <p>Property not found in Supabase.</p>
        <Link
          href="/marketplace"
          className="text-champagne-400 hover:underline"
        >
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const amenities = property.amenities.length
    ? property.amenities
    : [
        "Premium Location",
        "Modern Amenities",
        "RERA Registered",
        "Flexible Payment Plan",
      ];

  const imgSrc = getPropertyImage(property.title);

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 mb-6 relative z-10">
        <Link
          href="/marketplace"
          className="flex items-center gap-2 text-gray-500 hover:text-champagne-400 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>

      <div className="relative h-[440px] md:h-[520px] mb-8 overflow-hidden rounded-b-[28px] max-w-[1600px] mx-auto">
        {imgSrc ? (
          <>
            <Image
              src={imgSrc}
              alt={property.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          </>
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} to-obsidian-800`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2
                className="w-32 h-32"
                style={{ color: "var(--sapphire-500)", opacity: 0.12 }}
              />
            </div>
          </div>
        )}

        {/* Floating glass-3 info card — Section 4.1 */}
        <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-auto md:max-w-xl">
          <div
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 p-5 md:p-6"
            style={{
              background: "var(--glass-3-bg)",
              border: "1px solid var(--glass-3-border)",
              backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
              WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
              borderRadius: "var(--radius-xl)",
              boxShadow:
                "0 20px 50px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div className="min-w-0">
              <h1
                className="font-display font-bold text-2xl md:text-3xl leading-tight mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {property.title}
              </h1>
              <p
                className="flex items-center gap-1.5 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                <MapPin
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: "var(--gold-400)" }}
                />
                {property.location}
              </p>
              {property.rera_number && (
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  RERA: {property.rera_number}
                </p>
              )}
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-gradient-gold font-display font-black text-2xl md:text-3xl leading-none">
                {formatPrice(property.price, property.currency)}
              </p>
              {property.minimum_price && (
                <p
                  className="text-xs mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  Floor: {formatPrice(property.minimum_price)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Type", value: property.property_type },
                {
                  label: "Status",
                  value: property.availability_status ?? property.status,
                },
                {
                  label: "Possession",
                  value: property.possession_date ?? "TBD",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="glass rounded-xl p-4 border border-champagne-500/10 text-center"
                >
                  <p className="text-xs text-gray-500">{s.label}</p>
                  <p className="text-sm font-semibold text-ivory-100 mt-0.5 capitalize">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="inline-flex items-stretch gap-1 p-1 w-full sm:w-auto"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: "var(--radius-lg)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
              }}
            >
              {(
                [
                  ["overview", "Overview"],
                  ["investment", "AI Investment"],
                  ["area", "Details"],
                ] as [typeof activeTab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="relative flex-1 sm:flex-none text-center text-sm px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{
                    color:
                      activeTab === key
                        ? "var(--void)"
                        : "var(--text-secondary)",
                  }}
                >
                  {activeTab === key && (
                    <motion.div
                      layoutId="property-tab-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                        boxShadow: "0 4px 12px rgba(99,102,241,0.18)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>

            {activeTab === "overview" && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border border-champagne-500/10">
                  <h3 className="font-semibold text-ivory-100 mb-3">
                    About This Property
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {property.description}
                  </p>
                  {property.payment_plan && (
                    <p className="text-gray-500 text-sm mt-3">
                      <strong className="text-champagne-400">Payment:</strong>{" "}
                      {property.payment_plan}
                    </p>
                  )}
                </div>
                <div className="glass rounded-2xl p-6 border border-champagne-500/10">
                  <h3 className="font-semibold text-ivory-100 mb-4">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <div className="w-1.5 h-1.5 bg-champagne-400 rounded-full" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "investment" && (
              <div className="glass rounded-2xl p-6 border border-champagne-500/20">
                <div className="flex items-center gap-2 mb-5">
                  <Brain className="w-5 h-5 text-champagne-400" />
                  <h3 className="font-semibold text-ivory-100">
                    AI Investment Analysis
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">AI Score</p>
                    <p className="text-xl font-bold text-champagne-400">
                      {property.investment_score}/100
                    </p>
                  </div>
                  <div className="glass rounded-xl p-4 border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Listed Price</p>
                    <p className="text-xl font-bold text-emerald-400">
                      {formatPrice(property.price)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "area" && (
              <div className="glass rounded-2xl p-6 border border-champagne-500/10">
                <h3 className="font-semibold text-ivory-100 mb-4">
                  Location — {property.location}
                </h3>
                {property.locality_advantages && (
                  <p className="text-sm text-gray-600 mb-4">
                    {property.locality_advantages}
                  </p>
                )}
                {property.builder_details && (
                  <p className="text-sm text-gray-500">
                    <strong className="text-ivory-100">Builder:</strong>{" "}
                    {property.builder_details}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 self-start">
            {/* ── Booking card — glass-3, Section 4.3 ── */}
            <div
              className="p-6"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: "var(--radius-lg)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
                boxShadow: "var(--glass-2-highlight)",
              }}
            >
              <h3
                className="font-display font-bold text-sm mb-4 flex items-center gap-2"
                style={{ color: "var(--text-primary)" }}
              >
                <Calendar
                  className="w-4 h-4"
                  style={{ color: "var(--gold-400)" }}
                />
                Book Site Visit
              </h3>
              {visitBooked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <Star
                    className="w-8 h-8 mx-auto mb-3"
                    style={{ color: "#10B981" }}
                  />
                  <p className="font-medium" style={{ color: "#10B981" }}>
                    Visit Booked!
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Saved to Supabase — n8n will send WhatsApp if configured
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <FloatingInput
                    id="visit-name"
                    label="Full Name"
                    value={visitForm.name}
                    onChange={(v) => setVisitForm((p) => ({ ...p, name: v }))}
                  />
                  <FloatingInput
                    id="visit-phone"
                    label="Phone Number"
                    value={visitForm.phone}
                    onChange={(v) => setVisitForm((p) => ({ ...p, phone: v }))}
                  />
                  <FloatingInput
                    id="visit-date"
                    label="Preferred Date"
                    type="date"
                    value={visitForm.date}
                    onChange={(v) => setVisitForm((p) => ({ ...p, date: v }))}
                  />
                  <button
                    onClick={bookVisit}
                    className="w-full font-bold py-3 rounded-xl transition-all text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                      color: "var(--void)",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.18)",
                    }}
                  >
                    Book Site Visit
                  </button>
                </div>
              )}
            </div>


            {/* ── Voice AI CTA — sapphire (AI-only accent) ── */}
            <div
              className="p-5"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--border-sapphire)",
                borderRadius: "var(--radius-lg)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter:
                  "blur(var(--glass-2-blur)) saturate(160%)",
              }}
            >
              <Phone
                className="w-4 h-4 mb-2"
                style={{ color: "var(--sapphire-500)" }}
              />
              <p
                className="text-xs mb-4"
                style={{ color: "var(--text-muted)" }}
              >
                Ask our Vapi voice agent about this property — same n8n backend.
              </p>
              <Link
                href="/voice-agent"
                className="block text-center text-sm font-medium py-2.5 rounded-xl"
                style={{
                  background: "rgba(37,99,235,0.06)",
                  border: "1px solid var(--border-sapphire)",
                  color: "var(--sapphire-500)",
                }}
              >
                Start AI Call
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Similar Properties carousel — Section 4.5 ── */}
      {similarProperties.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <div className="mb-5">
            <p className="section-label mb-2">You Might Also Like</p>
            <h2
              className="font-display font-bold text-2xl"
              style={{ color: "var(--text-primary)" }}
            >
              Similar Properties
            </h2>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
            {similarProperties.map((p, i) => (
              <div
                key={p.id}
                className="shrink-0 snap-start"
                style={{ width: 300 }}
              >
                <PropertyCard property={p} index={i} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

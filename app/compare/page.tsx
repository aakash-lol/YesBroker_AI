"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { X, ArrowRight, GitCompare, Building2 } from "lucide-react";
import { formatPrice, demoProperties } from "@/lib/utils";
import type { UIProperty } from "@/lib/mappers";
import PropertyCard from "@/components/property/PropertyCard";
import VerifiedBadge from "@/components/ui/VerifiedBadge";

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;
const COLUMN_WIDTH = 260;
const LABEL_WIDTH = 168;

function extractBHK(type: string): number | null {
  const m = type.match(/(\d+)\s*bhk/i);
  return m ? parseInt(m[1], 10) : null;
}

function estimateEMI(price: number): number {
  if (!price) return 0;
  const principal = price * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 20 * 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

function formatEMI(price: number): string {
  const emi = estimateEMI(price);
  return emi ? `₹${emi.toLocaleString("en-IN")}/mo` : "—";
}

type Row = {
  label: string;
  render: (p: UIProperty) => React.ReactNode;
  isBest?: (p: UIProperty) => boolean;
};

function CompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids") ?? "";

  const [allProperties, setAllProperties] = useState<UIProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: UIProperty[]) => {
        const isProd = typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production";
        if (Array.isArray(d) && d.length) {
          setAllProperties(d);
        } else if (!isProd) {
          setAllProperties(
            demoProperties.map((p) => ({
              id: p.id,
              title: p.title,
              description: p.description,
              location: `${p.area}, ${p.city}`,
              area: p.area ?? "",
              city: p.city,
              property_type: p.property_type,
              price: p.price,
              currency: p.currency,
              amenities: [],
              featured: p.featured ?? false,
              status: p.status ?? "available",
              investment_score: p.investment_score ?? 80,
            })),
          );
        } else {
          setAllProperties([]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const properties = useMemo(() => {
    const ids = idsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_COMPARE);
    return ids
      .map((id) => allProperties.find((p) => p.id === id))
      .filter((p): p is UIProperty => Boolean(p));
  }, [idsParam, allProperties]);

  const bestPriceId = useMemo(
    () =>
      properties.reduce<UIProperty | null>(
        (best, p) => (!best || p.price < best.price ? p : best),
        null,
      )?.id,
    [properties],
  );
  const bestEmiId = useMemo(
    () =>
      properties.reduce<UIProperty | null>(
        (best, p) =>
          !best || estimateEMI(p.price) < estimateEMI(best.price) ? p : best,
        null,
      )?.id,
    [properties],
  );
  const bestScoreId = useMemo(
    () =>
      properties.reduce<UIProperty | null>(
        (best, p) =>
          !best || (p.investment_score ?? 0) > (best.investment_score ?? 0)
            ? p
            : best,
        null,
      )?.id,
    [properties],
  );

  const rows: Row[] = [
    {
      label: "Price",
      render: (p) => (
        <span className="text-gradient-gold font-display font-bold text-base">
          {formatPrice(p.price, p.currency)}
        </span>
      ),
      isBest: (p) => p.id === bestPriceId,
    },
    {
      label: "Est. EMI",
      render: (p) => (
        <span style={{ color: "var(--text-primary)" }}>
          {formatEMI(p.price)}
        </span>
      ),
      isBest: (p) => p.id === bestEmiId,
    },
    {
      label: "Configuration",
      render: (p) => {
        const bhk = extractBHK(p.property_type);
        return (
          <span style={{ color: "var(--text-primary)" }}>
            {bhk ? `${bhk} BHK · ` : ""}
            {p.property_type}
          </span>
        );
      },
    },
    {
      label: "Location",
      render: (p) => (
        <span style={{ color: "var(--text-secondary)" }}>{p.location}</span>
      ),
    },
    {
      label: "Verification",
      render: (p) => <VerifiedBadge reraNumber={p.rera_number} variant="row" />,
    },
    {
      label: "AI Investment Score",
      render: (p) => (
        <span className="font-bold" style={{ color: "var(--gold-400)" }}>
          {p.investment_score}/100
        </span>
      ),
      isBest: (p) => p.id === bestScoreId,
    },
    {
      label: "Availability",
      render: (p) => (
        <span className="capitalize" style={{ color: "var(--text-secondary)" }}>
          {p.availability_status ?? p.status}
        </span>
      ),
    },
    {
      label: "Possession",
      render: (p) => (
        <span style={{ color: "var(--text-secondary)" }}>
          {p.possession_date ?? "TBD"}
        </span>
      ),
    },
    {
      label: "Builder",
      render: (p) => (
        <span
          className="line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {p.builder_details || "—"}
        </span>
      ),
    },
    {
      label: "Amenities",
      render: (p) =>
        p.amenities.length ? (
          <div className="flex flex-wrap gap-1">
            {p.amenities.slice(0, 4).map((a, i) => (
              <span
                key={i}
                className="text-[10px] px-1.5 py-0.5 rounded-md"
                style={{
                  background: "var(--glass-1-bg)",
                  border: "1px solid var(--glass-1-border)",
                  color: "var(--text-secondary)",
                }}
              >
                {a}
              </span>
            ))}
            {p.amenities.length > 4 && (
              <span
                className="text-[10px]"
                style={{ color: "var(--text-muted)" }}
              >
                +{p.amenities.length - 4}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: "var(--text-muted)" }}>—</span>
        ),
    },
    {
      label: "Locality Intelligence",
      render: (p) => (
        <span
          className="line-clamp-3 text-xs leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {p.locality_advantages || "—"}
        </span>
      ),
    },
  ];

  const removeProperty = (id: string) => {
    const remaining = properties.filter((p) => p.id !== id).map((p) => p.id);
    router.replace(
      remaining.length ? `/compare?ids=${remaining.join(",")}` : "/compare",
    );
  };

  const insufficientCount = !loading && properties.length < MIN_COMPARE;

  return (
    <div className="min-h-screen relative" style={{ background: "transparent" }}>

      <div className="relative z-10" style={{ paddingTop: 68 }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-24">
          {/* ── PAGE HEADER ── */}
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <GitCompare
                  className="w-4 h-4"
                  style={{ color: "var(--gold-400)" }}
                />
                <span
                  className="section-label"
                  style={{ color: "var(--gold-400)" }}
                >
                  Side-by-Side
                </span>
              </div>
              <h1
                className="font-display font-black leading-none"
                style={{
                  fontSize: "clamp(32px, 4.5vw, 52px)",
                  color: "var(--text-primary)",
                }}
              >
                Compare Properties
              </h1>
              {!loading && properties.length > 0 && (
                <p
                  className="text-sm mt-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Comparing {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"}
                  {properties.length < MAX_COMPARE && (
                    <>
                      {" · "}
                      <Link
                        href="/shortlist"
                        style={{ color: "var(--gold-400)" }}
                      >
                        add more from your shortlist
                      </Link>
                    </>
                  )}
                </p>
              )}
            </motion.div>
          </div>

          {/* ── CONTENT ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <Building2
                  className="w-7 h-7 animate-pulse"
                  style={{ color: "var(--gold-400)" }}
                />
              </div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Loading comparison…
              </p>
            </div>
          ) : insufficientCount ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-32 gap-5 text-center"
            >
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center"
                style={{
                  background: "rgba(99,102,241,0.06)",
                  border: "1px solid var(--border-gold)",
                }}
              >
                <GitCompare
                  className="w-9 h-9"
                  style={{ color: "var(--gold-400)", opacity: 0.6 }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Select at least {MIN_COMPARE} properties to compare
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Head to your shortlist and pick a few to see them side by
                  side.
                </p>
              </div>
              <Link
                href="/shortlist"
                className="btn-gold text-sm px-6 py-3 inline-flex items-center gap-2"
              >
                Go to Shortlist
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ) : (
            <div className="overflow-x-auto -mx-6 lg:mx-0 px-6 lg:px-0 pb-4">
              <div
                style={{
                  minWidth:
                    LABEL_WIDTH + properties.length * (COLUMN_WIDTH + 16),
                }}
              >
                {/* Header row — shared PropertyCard, compact */}
                <div className="flex gap-4 mb-6">
                  <div style={{ width: LABEL_WIDTH }} className="shrink-0" />
                  {properties.map((p, i) => (
                    <div
                      key={p.id}
                      style={{ width: COLUMN_WIDTH }}
                      className="shrink-0 relative"
                    >
                      <button
                        onClick={() => removeProperty(p.id)}
                        className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: "rgba(8,8,11,0.75)",
                          border: "1px solid var(--glass-1-border)",
                          backdropFilter: "blur(8px) saturate(160%)",
                        }}
                        aria-label="Remove from comparison"
                      >
                        <X
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--text-secondary)" }}
                        />
                      </button>
                      <PropertyCard property={p} index={i} />
                    </div>
                  ))}
                </div>

                {/* Attribute rows */}
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="flex gap-4 items-stretch"
                    style={{ borderTop: "1px solid var(--glass-1-border)" }}
                  >
                    <div
                      style={{ width: LABEL_WIDTH }}
                      className="shrink-0 py-4 pr-3 text-[11px] font-semibold uppercase tracking-wide flex items-center"
                    >
                      <span
                        style={{
                          color: "var(--text-muted)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {row.label}
                      </span>
                    </div>
                    {properties.map((p) => {
                      const best = row.isBest?.(p);
                      return (
                        <div
                          key={p.id}
                          style={{ width: COLUMN_WIDTH }}
                          className="shrink-0 py-4 px-3 flex flex-col justify-center"
                        >
                          <div
                            className={best ? "rounded-xl px-3 py-2" : ""}
                            style={
                              best
                                ? {
                                    background: "rgba(99,102,241,0.06)",
                                    border: "1px solid var(--border-gold)",
                                  }
                                : undefined
                            }
                          >
                            {best && (
                              <span
                                className="block text-[9px] font-bold uppercase tracking-wider mb-1"
                                style={{
                                  color: "var(--gold-400)",
                                  letterSpacing: "0.1em",
                                }}
                              >
                                Best
                              </span>
                            )}
                            {row.render(p)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Building2, ArrowRight, Trash2, GitCompare } from "lucide-react";
import type { UIProperty } from "@/lib/mappers";
import { demoProperties } from "@/lib/utils";
import PropertyCard from "@/components/property/PropertyCard";
import {
  getShortlist,
  removeFromShortlist,
  SHORTLIST_EVENT,
} from "@/lib/shortlist";

const MAX_COMPARE = 4;
const MIN_COMPARE = 2;

export default function ShortlistPage() {
  const router = useRouter();
  const [allProperties, setAllProperties] = useState<UIProperty[]>([]);
  const [shortlistIds, setShortlistIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  /* ── Fetch full property catalog once ── */
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

  /* ── Read shortlist ids + stay in sync across tabs/pages ── */
  const refreshIds = useCallback(() => {
    setShortlistIds(getShortlist());
  }, []);

  useEffect(() => {
    refreshIds();
    window.addEventListener(SHORTLIST_EVENT, refreshIds);
    window.addEventListener("storage", refreshIds);
    return () => {
      window.removeEventListener(SHORTLIST_EVENT, refreshIds);
      window.removeEventListener("storage", refreshIds);
    };
  }, [refreshIds]);

  const shortlisted = useMemo(
    () =>
      shortlistIds
        .map((id) => allProperties.find((p) => p.id === id))
        .filter((p): p is UIProperty => Boolean(p)),
    [shortlistIds, allProperties],
  );

  /* ── Prune stale selections when a card is removed ── */
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set([...prev].filter((id) => shortlistIds.includes(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [shortlistIds]);

  const handleRemove = (id: string) => {
    removeFromShortlist(id);
    refreshIds();
  };

  const clearAll = () => {
    shortlistIds.forEach((id) => removeFromShortlist(id));
    refreshIds();
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_COMPARE) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const canCompare =
    selected.size >= MIN_COMPARE && selected.size <= MAX_COMPARE;

  const goToCompare = () => {
    if (!canCompare) return;
    router.push(`/compare?ids=${Array.from(selected).join(",")}`);
  };

  return (
    <div className="min-h-screen relative" style={{ background: "transparent" }}>

      <div className="relative z-10" style={{ paddingTop: 68 }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 pb-32">
          {/* ── PAGE HEADER ── */}
          <div className="py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart
                    className="w-4 h-4"
                    style={{ color: "var(--gold-400)" }}
                    fill="var(--gold-400)"
                  />
                  <span
                    className="section-label"
                    style={{ color: "var(--gold-400)" }}
                  >
                    Saved Properties
                  </span>
                </div>
                <h1
                  className="font-display font-black leading-none"
                  style={{
                    fontSize: "clamp(32px, 4.5vw, 52px)",
                    color: "var(--text-primary)",
                  }}
                >
                  Your Shortlist
                </h1>
                {!loading && (
                  <p
                    className="text-sm mt-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {shortlisted.length === 0
                      ? "Nothing saved yet"
                      : `${shortlisted.length} ${shortlisted.length === 1 ? "property" : "properties"} saved · select 2–4 to compare`}
                  </p>
                )}
              </div>

              {shortlisted.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl shrink-0 transition-colors"
                  style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--glass-2-border)",
                    background: "var(--glass-1-bg)",
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
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
                Loading your shortlist…
              </p>
            </div>
          ) : shortlisted.length === 0 ? (
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
                <Heart
                  className="w-9 h-9"
                  style={{ color: "var(--gold-400)", opacity: 0.6 }}
                />
              </div>
              <div>
                <p
                  className="text-sm font-medium mb-1"
                  style={{ color: "var(--text-primary)" }}
                >
                  Your shortlist is empty
                </p>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Tap the heart on any property to save it here.
                </p>
              </div>
              <Link
                href="/marketplace"
                className="btn-gold text-sm px-6 py-3 inline-flex items-center gap-2"
              >
                Browse Marketplace
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {shortlisted.map((p, i) => {
                const isSelected = selected.has(p.id);
                const selectionDisabled =
                  !isSelected && selected.size >= MAX_COMPARE;
                return (
                  <div key={p.id} className="flex flex-col gap-3">
                    <PropertyCard
                      property={p}
                      index={i}
                      liked
                      onLike={() => handleRemove(p.id)}
                    />
                    <label
                      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl cursor-pointer select-none transition-colors"
                      style={{
                        background: isSelected
                          ? "rgba(99,102,241,0.06)"
                          : "var(--glass-1-bg)",
                        border: `1px solid ${isSelected ? "var(--border-gold)" : "var(--glass-1-border)"}`,
                        opacity: selectionDisabled ? 0.5 : 1,
                        cursor: selectionDisabled ? "not-allowed" : "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={selectionDisabled}
                        onChange={() => toggleSelect(p.id)}
                        style={{ accentColor: "var(--gold-500)" }}
                        className="w-3.5 h-3.5"
                      />
                      <span
                        className="text-xs font-medium flex items-center gap-1.5"
                        style={{
                          color: isSelected
                            ? "var(--gold-400)"
                            : "var(--text-secondary)",
                        }}
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        {isSelected
                          ? "Selected for comparison"
                          : "Select to compare"}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── FLOATING COMPARE BAR ── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="glass-fixed fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3 sm:py-3.5 max-w-[calc(100vw-2rem)] flex-wrap justify-center"
            style={{
              background: "var(--glass-3-bg)",
              border: "1px solid var(--border-gold)",
              borderRadius: "var(--radius-xl)",
              backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
              WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
              boxShadow:
                "0 20px 50px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 30px rgba(99,102,241,0.04)",
            }}
          >
            <span
              className="text-sm font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              {selected.size} selected
              {selected.size < MIN_COMPARE && (
                <span style={{ color: "var(--text-muted)" }}>
                  {" "}
                  · pick at least {MIN_COMPARE}
                </span>
              )}
            </span>
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Clear
            </button>
            <button
              onClick={goToCompare}
              disabled={!canCompare}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                color: "var(--void)",
                boxShadow: "0 4px 16px rgba(99,102,241,0.18)",
              }}
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

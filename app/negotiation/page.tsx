"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Brain, AlertTriangle, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { UIProperty, UINegotiationRound } from "@/lib/mappers";

type NegotiationResult = {
  propertyPrice: number;
  buyerOffer: number;
  counterOffer: number;
  interestScore: number;
  recommendation: string;
  escalate: boolean;
  aiReason: string;
  accepted?: boolean;
};

type Round = NegotiationResult & { round: number };

/* ─────────────────────────────────────────────
   CIRCULAR SCORE RING
   redesign-plan.md — Section 5.3: replaces the flat
   interest-score bar with a circular progress ring.
───────────────────────────────────────────── */
function CircularScore({ score, size = 96 }: { score: number; size?: number }) {
  const stroke = size >= 80 ? 8 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, score));
  const offset = circumference - (progress / 100) * circumference;
  const color =
    score >= 80
      ? "var(--success)"
      : score >= 60
        ? "var(--warning)"
        : "var(--danger)";

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--glass-1-border)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-black leading-none"
          style={{
            color: "var(--text-primary)",
            fontSize: size >= 80 ? 20 : 12,
          }}
        >
          {score}
        </span>
        {size >= 80 && (
          <span
            className="text-[9px] font-semibold mt-0.5"
            style={{ color: "var(--text-muted)" }}
          >
            /100
          </span>
        )}
      </div>
    </div>
  );
}

export default function NegotiationPage() {
  const [properties, setProperties] = useState<UIProperty[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<UIProperty | null>(
    null,
  );
  const [buyerOffer, setBuyerOffer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [history, setHistory] = useState<UINegotiationRound[]>([]);

  useEffect(() => {
    fetch("/api/properties", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: UIProperty[]) => {
        if (Array.isArray(d) && d.length) {
          setProperties(d);
          setSelectedProperty(d[0]);
        }
      })
      .catch(() => {});

    fetch("/api/negotiations", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: UINegotiationRound[]) => {
        if (Array.isArray(d)) setHistory(d);
      })
      .catch(() => {});
  }, []);

  const handleNegotiate = async () => {
    if (!selectedProperty || !buyerOffer || isNaN(Number(buyerOffer))) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          propertyPrice: selectedProperty.price,
          minimumPrice: selectedProperty.minimum_price,
          buyerOffer: Number(buyerOffer) * 100_000,
          propertyTitle: selectedProperty.title,
        }),
      });
      const data = await res.json();
      setResult(data);
      setRounds((prev) => [{ ...data, round: prev.length + 1 }, ...prev]);
      fetch("/api/negotiations", { cache: "no-store" })
        .then((r) => r.json())
        .then((d: UINegotiationRound[]) => {
          if (Array.isArray(d)) setHistory(d);
        });
    } catch {
      alert("Negotiation engine unavailable");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedProperty && properties.length === 0) {
    return (
      <div
        className="min-h-screen pt-20 px-4 flex items-center justify-center"
        style={{ color: "var(--text-muted)" }}
      >
        Loading properties from Supabase…
      </div>
    );
  }

  return (
    <div
      className="min-h-screen pt-20 px-4 pb-20"
      style={{ background: "transparent" }}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <p className="section-label mb-3">Synced with n8n</p>
          <h1
            className="font-display font-black text-4xl mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            Negotiation <span className="text-gradient-sapphire">Engine</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Uses seller_price &amp; minimum_price from Supabase — same logic as
            voice agent negotiatePrice tool.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── LEFT: Property select + offer input ── */}
          <div className="lg:col-span-2 space-y-5">
            <div
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
              <h3
                className="text-sm font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Select Property
              </h3>
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {properties.map((p) => {
                  const active = selectedProperty?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProperty(p);
                        setResult(null);
                        setBuyerOffer("");
                      }}
                      className="w-full text-left p-3 rounded-xl text-sm transition-all"
                      style={{
                        background: active
                          ? "rgba(37,99,235,0.06)"
                          : "var(--glass-1-bg)",
                        border: `1px solid ${active ? "var(--border-sapphire)" : "var(--glass-1-border)"}`,
                      }}
                    >
                      <p
                        className="font-medium text-xs"
                        style={{
                          color: active
                            ? "var(--text-primary)"
                            : "var(--text-secondary)",
                        }}
                      >
                        {p.title}
                      </p>
                      <p className="text-gradient-gold text-xs mt-1 font-bold">
                        {formatPrice(p.price, p.currency)}
                      </p>
                      {p.minimum_price && (
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Floor: {formatPrice(p.minimum_price)}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedProperty && (
              <div
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
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--text-primary)" }}
                >
                  Buyer&apos;s Offer (Lakhs)
                </h3>
                <div className="mb-4">
                  <p
                    className="text-xs mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Listed Price
                  </p>
                  <p className="text-gradient-gold font-display font-black text-2xl">
                    {formatPrice(selectedProperty.price)}
                  </p>
                </div>
                <input
                  type="number"
                  value={buyerOffer}
                  onChange={(e) => setBuyerOffer(e.target.value)}
                  placeholder={`e.g. ${Math.round((selectedProperty.price / 100_000) * 0.9)}`}
                  className="w-full rounded-xl px-4 py-3 outline-none text-sm mb-4 transition-colors"
                  style={{
                    background: "var(--glass-1-bg)",
                    border: "1px solid var(--glass-1-border)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--border-sapphire)")
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor =
                      "var(--glass-1-border)")
                  }
                />
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[0.95, 0.9, 0.85, 0.8].map((pct) => (
                    <button
                      key={pct}
                      onClick={() =>
                        setBuyerOffer(
                          String(
                            Math.round(
                              (selectedProperty.price / 100_000) * pct,
                            ),
                          ),
                        )
                      }
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: "var(--glass-1-bg)",
                        border: "1px solid var(--glass-1-border)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {(pct * 100).toFixed(0)}%
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleNegotiate}
                  disabled={loading || !buyerOffer}
                  className="w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--sapphire-500), var(--sapphire-600))",
                    color: "white",
                    boxShadow: "0 4px 16px rgba(37,99,235,0.18)",
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Negotiate with AI
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ── RIGHT: Result + Timeline ── */}
          <div className="lg:col-span-3 space-y-5">
            <AnimatePresence>
              {result && selectedProperty && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    className="p-6 mb-5"
                    style={{
                      background: "var(--glass-3-bg)",
                      border: "1px solid var(--border-sapphire)",
                      borderRadius: "var(--radius-xl)",
                      backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
                      WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
                      boxShadow:
                        "0 20px 50px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 30px rgba(37,99,235,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <Brain
                        className="w-5 h-5"
                        style={{ color: "var(--sapphire-400)" }}
                      />
                      <h3
                        className="font-display font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        AI Negotiation Analysis
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[
                        {
                          label: "Listed Price",
                          value: result.propertyPrice,
                          className: "text-gradient-gold",
                        },
                        {
                          label: "Buyer Offer",
                          value: result.buyerOffer,
                          color: "var(--warning)",
                        },
                        {
                          label: "AI Counter",
                          value: result.counterOffer,
                          color: "var(--success)",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl p-4 text-center"
                          style={{
                            background: "var(--glass-1-bg)",
                            border: "1px solid var(--glass-1-border)",
                          }}
                        >
                          <p
                            className="text-xs mb-1"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {item.label}
                          </p>
                          <p
                            className={`font-bold text-sm ${item.className ?? ""}`}
                            style={
                              item.color ? { color: item.color } : undefined
                            }
                          >
                            {formatPrice(item.value)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Circular score ring — Section 5.3 */}
                    <div
                      className="rounded-xl p-4 mb-4 flex items-center gap-5"
                      style={{
                        background: "var(--glass-1-bg)",
                        border: "1px solid var(--glass-1-border)",
                      }}
                    >
                      <CircularScore score={result.interestScore} />
                      <div>
                        <p
                          className="text-sm mb-1"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Buyer Interest Score
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {result.interestScore >= 80
                            ? "Strong buying signal"
                            : result.interestScore >= 60
                              ? "Moderate interest — room to negotiate"
                              : "Low interest — significant gap to close"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{
                        background: "rgba(37,99,235,0.04)",
                        border: "1px solid var(--border-sapphire)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--sapphire-400)" }}
                      >
                        AI Recommendation
                      </p>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {result.recommendation}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: "var(--glass-1-bg)",
                        border: "1px solid var(--glass-1-border)",
                      }}
                    >
                      <p
                        className="text-xs mb-1"
                        style={{ color: "var(--gold-400)" }}
                      >
                        Analysis
                      </p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {result.aiReason}
                      </p>
                    </div>

                    {result.escalate && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 flex items-center gap-3 rounded-xl p-3"
                        style={{
                          background: "rgba(245,158,11,0.1)",
                          border: "1px solid rgba(245,158,11,0.25)",
                        }}
                      >
                        <AlertTriangle
                          className="w-4 h-4 shrink-0"
                          style={{ color: "var(--warning)" }}
                        />
                        <p className="text-xs" style={{ color: "#FCD34D" }}>
                          AI recommends escalating to senior agent for this
                          negotiation.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!result && (
              <div
                className="p-12 text-center"
                style={{
                  background: "var(--glass-2-bg)",
                  border: "1px solid var(--glass-2-border)",
                  borderRadius: "var(--radius-lg)",
                  backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                  WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                }}
              >
                <Zap
                  className="w-12 h-12 mx-auto mb-4"
                  style={{ color: "var(--sapphire-500)", opacity: 0.3 }}
                />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Select a property and enter a buyer offer in Lakhs
                </p>
              </div>
            )}

            {(rounds.length > 0 || history.length > 0) && (
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
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid var(--glass-1-border)" }}
                >
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Negotiation Timeline (from Supabase)
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {(history.length
                    ? history
                    : rounds.map((r, i) => ({
                        id: String(i),
                        buyer_offer: r.buyerOffer,
                        counter_offer: r.counterOffer,
                        buyer_interest_score: r.interestScore,
                        created_at: new Date().toISOString(),
                        lead_phone: "",
                        call_id: "",
                        seller_price: r.propertyPrice,
                        round_number: r.round,
                      }))
                  )
                    .slice(0, 10)
                    .map((r, i, arr) => (
                      <div
                        key={r.id ?? i}
                        className="px-5 py-4 flex items-center gap-4 text-xs"
                        style={{
                          borderBottom:
                            i < arr.length - 1
                              ? "1px solid var(--glass-1-border)"
                              : "none",
                        }}
                      >
                        <CircularScore
                          score={r.buyer_interest_score ?? 0}
                          size={40}
                        />
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <p style={{ color: "var(--text-muted)" }}>Offer</p>
                            <p
                              className="font-medium"
                              style={{ color: "var(--warning)" }}
                            >
                              {formatPrice(r.buyer_offer)}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "var(--text-muted)" }}>
                              Counter
                            </p>
                            <p
                              className="font-medium"
                              style={{ color: "var(--success)" }}
                            >
                              {formatPrice(r.counter_offer ?? 0)}
                            </p>
                          </div>
                          <div>
                            <p style={{ color: "var(--text-muted)" }}>Round</p>
                            <p
                              className="font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              #{r.round_number ?? i + 1}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

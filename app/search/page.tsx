"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { Brain, Send, Sparkles, RotateCcw } from "lucide-react";
import type { UIProperty } from "@/lib/mappers";
import PropertyCard from "@/components/property/PropertyCard";

const SUGGESTED = [
  "Find a 3BHK in Whitefield under 80 Lakhs",
  "Show me apartments with rental yield above 8%",
  "Luxury penthouse with city views",
  "Best investment properties in Bangalore",
  "Villa with private pool and garden",
];

/** Adapts the AI search API's lightweight property shape into a full
 *  UIProperty so results can render through the shared PropertyCard
 *  (redesign-plan.md Section 5.2) — display-only, no data logic changes. */
function toUIProperty(p: any): UIProperty {
  const area = p.area ?? "";
  const city = p.city ?? "";
  const location =
    [area, city].filter(Boolean).join(", ") || area || city || "India";
  return {
    id: String(p.id),
    title: p.title ?? "Property",
    description: p.description ?? "",
    location,
    area,
    city,
    property_type: p.property_type ?? "",
    price: p.price ?? 0,
    currency: p.currency ?? "INR",
    amenities: [],
    featured: false,
    status: "available",
    investment_score: p.investment_score ?? 75,
  };
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; content: string; properties?: any[] }[]
  >([]);
  const [input, setInput] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialQ) {
      setInput("");
      handleSearch(initialQ);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(query: string) {
    if (!query.trim() || loading) return;
    const userMsg = { role: "user" as const, content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: data.answer, properties: data.properties },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Sorry, AI search is unavailable. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen pt-20 flex flex-col max-w-4xl mx-auto px-4 pb-6"
      style={{ background: "transparent" }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-8 text-center"
      >
        <p className="section-label mb-3">AI Discovery</p>
        <h1
          className="font-display font-black text-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          AI Property <span className="text-gradient-sapphire">Discovery</span>
        </h1>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div
              className="p-8 text-center"
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
              <Sparkles
                className="w-12 h-12 mx-auto mb-4"
                style={{ color: "var(--sapphire-400)" }}
              />
              <h3
                className="font-display font-semibold text-lg"
                style={{ color: "var(--text-primary)" }}
              >
                Ask me anything about properties
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="p-4 text-left text-sm transition-all"
                  style={{
                    background: "var(--glass-1-bg)",
                    border: "1px solid var(--glass-1-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--border-sapphire)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-primary)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--glass-1-border)";
                    (e.currentTarget as HTMLButtonElement).style.color =
                      "var(--text-secondary)";
                  }}
                >
                  <Brain
                    className="w-4 h-4 mb-2"
                    style={{ color: "var(--sapphire-500)" }}
                  />
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "user" ? (
                <div
                  className="px-5 py-3 max-w-lg"
                  style={{
                    background: "var(--glass-2-bg)",
                    border: "1px solid var(--glass-2-border)",
                    borderRadius: "20px 20px 4px 20px",
                    backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                    WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                    boxShadow: "var(--glass-2-highlight)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {msg.content}
                  </p>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div
                    className="p-5"
                    style={{
                      background: "var(--glass-2-bg)",
                      border: "1px solid var(--border-sapphire)",
                      borderRadius: "20px 20px 20px 4px",
                      backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                      WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                      boxShadow:
                        "var(--glass-2-highlight), 0 0 30px rgba(59,130,246,0.05)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{
                          background: "rgba(37,99,235,0.10)",
                          border: "1px solid var(--border-sapphire)",
                        }}
                      >
                        <Brain
                          className="w-3.5 h-3.5"
                          style={{ color: "var(--sapphire-400)" }}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "var(--sapphire-400)" }}
                      >
                        YesBroker AI
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {msg.content}
                    </p>
                  </div>

                  {msg.properties && msg.properties.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {msg.properties.map((p, pi) => (
                        <PropertyCard
                          key={p.id}
                          property={toUIProperty(p)}
                          index={pi}

                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="p-4"
              style={{
                background: "var(--glass-2-bg)",
                border: "1px solid var(--glass-2-border)",
                borderRadius: "var(--radius-lg)",
                backdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
                WebkitBackdropFilter: "blur(var(--glass-2-blur)) saturate(160%)",
              }}
            >
              <div className="flex items-center gap-2">
                <Brain
                  className="w-4 h-4 animate-pulse"
                  style={{ color: "var(--sapphire-400)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Searching properties...
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "var(--sapphire-400)" }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="pt-4"
        style={{ borderTop: "1px solid var(--glass-1-border)" }}
      >
        <div
          className="p-2"
          style={{
            background: "var(--glass-3-bg)",
            border: "1px solid var(--border-sapphire)",
            borderRadius: "var(--radius-xl)",
            backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
            WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
            boxShadow:
              "0 20px 50px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.6), 0 0 20px rgba(37,99,235,0.04)",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-2">
            <Brain
              className="w-5 h-5 shrink-0"
              style={{ color: "var(--sapphire-500)" }}
            />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(input)}
              placeholder="Ask about properties in natural language..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: "var(--text-primary)" }}
            />
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-secondary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.color =
                    "var(--text-muted)")
                }
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => handleSearch(input)}
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl transition-all disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--sapphire-500), var(--sapphire-600))",
                color: "white",
                boxShadow: "0 4px 16px rgba(37,99,235,0.18)",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ color: "var(--text-muted)" }}
        >
          Loading...
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}

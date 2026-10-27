"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import {
  fadeUp,
  staggerContainer,
  cardHoverProps,
  viewportOnce,
} from "@/lib/motion";

/* ─────────────────────────────────────────────
   TESTIMONIALS / SOCIAL PROOF — Light Theme
───────────────────────────────────────────── */

type Testimonial = {
  name: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
};

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ananya Reddy",
    role: "Homebuyer",
    location: "Whitefield, Bangalore",
    quote:
      "The AI voice agent understood exactly what we needed and shortlisted three properties within a day. Booking the site visit took two minutes.",
    rating: 5,
  },
  {
    name: "Vikram Nair",
    role: "Investor",
    location: "Dubai Marina",
    quote:
      "The negotiation engine got us a better counter-offer than our previous broker managed in three rounds. Transparent pricing made the decision easy.",
    rating: 5,
  },
  {
    name: "Priya Menon",
    role: "First-time Buyer",
    location: "Panathur, Bangalore",
    quote:
      "RERA verification and locality intelligence were right there on the listing — no chasing the agent for basic facts.",
    rating: 4,
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative z-10 py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="section-label mb-3">Social Proof</p>

          <h2
            className="font-display font-black"
            style={{ fontSize: "clamp(28px, 3.5vw, 48px)", color: "var(--text-primary)" }}
          >
            Trusted by buyers and investors
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              {...cardHoverProps}
              className="glass-2 flex flex-col p-6"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              <Quote
                className="w-6 h-6 mb-4"
                style={{
                  color: "#6366F1",
                  opacity: 0.5,
                }}
              />

              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-3.5 h-3.5"
                    style={{
                      color:
                        si < t.rating ? "#F59E0B" : "var(--text-muted)",
                      fill: si < t.rating ? "#F59E0B" : "none",
                    }}
                  />
                ))}
              </div>

              <p
                className="text-sm leading-relaxed mb-6 flex-1"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>

              <div
                className="flex items-center gap-3 pt-4"
                style={{
                  borderTop: "1px solid rgba(100,116,180,0.10)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(99,102,241,0.06))",
                    color: "#6366F1",
                    border: "1px solid rgba(99,102,241,0.20)",
                  }}
                >
                  {initials(t.name)}
                </div>

                <div className="min-w-0">
                  <p
                    className="text-sm font-semibold truncate"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    {t.name}
                  </p>

                  <p
                    className="text-[11px] truncate"
                    style={{
                      color: "var(--text-muted)",
                    }}
                  >
                    {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

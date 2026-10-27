"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  Lock,
  FileText,
  Phone,
} from "lucide-react";

/* ─────────────────────────────────────────────
   FAQ + LEGAL/TRUST SECTION — Light Theme
───────────────────────────────────────────── */

type FAQItem = { question: string; answer: string };

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Is every listing on YesBroker AI RERA verified?",
    answer:
      "Every property card and detail page shows its RERA registration number when the builder has provided one, marked with a Verified badge. Listings without a submitted number show as pending verification — always independently confirm any RERA number before making a payment.",
  },
  {
    question: "How does the AI negotiation engine decide a counter-offer?",
    answer:
      "The engine compares your offer against the listed price and the seller's confidential floor price, then factors in how close you are to that floor to suggest a counter that keeps the deal moving without under-selling the property. A human agent reviews and can override any AI-recommended counter before it's sent.",
  },
  {
    question: "Is my phone number shared with third parties?",
    answer:
      "No. Your number is used only by YesBroker AI and its voice and WhatsApp agents to follow up on your enquiry — it is never sold or shared with external advertisers.",
  },
  {
    question: "How accurate is the AI Investment Score?",
    answer:
      "The score blends demand signals like view counts, locality trends, and pricing relative to comparable listings. It's a directional guide, not a valuation or financial guarantee — pair it with your own due diligence or a licensed advisor.",
  },
  {
    question: "Can I cancel or reschedule a site visit?",
    answer:
      "Yes. Visits booked through the platform can be confirmed, marked complete, or cancelled from the Site Visits dashboard, and our team is notified automatically to coordinate with the agent on the ground.",
  },
  {
    question: "Is YesBroker AI a licensed real estate broker?",
    answer:
      "YesBroker AI operates as a technology platform that connects buyers with RERA-registered projects and partner agents. We are not a party to the sale transaction itself — always review agreements with the seller or their registered agent directly.",
  },
];

function AccordionRow({
  item,
  isOpen,
  onToggle,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.72)",
        border: isOpen ? "1px solid rgba(99,102,241,0.20)" : "1px solid rgba(100,116,180,0.12)",
        borderRadius: "var(--radius-lg)",
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        boxShadow: isOpen ? "0 4px 24px rgba(0,0,0,0.04), 0 0 12px rgba(99,102,241,0.04)" : "0 2px 12px rgba(0,0,0,0.02)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span
          className="text-sm font-semibold"
          style={{ color: isOpen ? "#4F46E5" : "var(--text-primary)" }}
        >
          {item.question}
        </span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform"
          style={{
            color: isOpen ? "#6366F1" : "var(--text-muted)",
            transform: isOpen ? "rotate(180deg)" : "none",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 py-24 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <HelpCircle
              className="w-4 h-4"
              style={{ color: "#6366F1" }}
            />
            <span
              className="section-label"
              style={{ color: "#6366F1" }}
            >
              Frequently Asked
            </span>
          </div>
          <h2
            className="font-display font-black"
            style={{
              fontSize: "clamp(28px, 3.5vw, 44px)",
              color: "var(--text-primary)",
            }}
          >
            Questions, answered
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-14"
        >
          {FAQ_ITEMS.map((item, i) => (
            <AccordionRow
              key={item.question}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

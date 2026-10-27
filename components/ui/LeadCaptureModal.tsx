"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  User,
  Mail,
  MapPin,
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

/* ─────────────────────────────────────────────
   PROGRESSIVE LEAD CAPTURE MODAL
   redesign-plan.md — Section 7.5

   Two-step glass-3 modal: phone first, details second.
   Fully controlled — the parent owns `open` state, e.g.:

     const [leadOpen, setLeadOpen] = useState(false);
     <button onClick={() => setLeadOpen(true)}>Get Started</button>
     <LeadCaptureModal open={leadOpen} onOpenChange={setLeadOpen} />

   Posts to the existing /api/leads route (no backend changes).
───────────────────────────────────────────── */

const BUDGET_OPTIONS: { label: string; min?: number; max?: number }[] = [
  { label: "Any Budget" },
  { label: "Under ₹50 Lakhs", max: 5_000_000 },
  { label: "₹50L – ₹1 Cr", min: 5_000_000, max: 10_000_000 },
  { label: "₹1 Cr – ₹2 Cr", min: 10_000_000, max: 20_000_000 },
  { label: "₹2 Cr+", min: 20_000_000 },
];

const PROPERTY_TYPE_OPTIONS = [
  "Any Type",
  "Apartment",
  "Villa",
  "Penthouse",
  "Townhouse",
  "Plot",
];

export interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional context — attached to the lead as notes if provided. */
  propertyId?: string;
  propertyTitle?: string;
  /** Tag written to leads.source, defaults to a generic modal source. */
  source?: string;
  onSuccess?: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-[11px] font-semibold uppercase tracking-wide mb-1.5"
      style={{ color: "var(--text-muted)", letterSpacing: "0.06em" }}
    >
      {children}
    </label>
  );
}

const inputStyle = {
  background: "var(--glass-1-bg)",
  border: "1px solid var(--glass-1-border)",
  color: "var(--text-primary)",
} as const;

export default function LeadCaptureModal({
  open,
  onOpenChange,
  propertyId,
  propertyTitle,
  source = "lead_capture_modal",
  onSuccess,
}: LeadCaptureModalProps) {
  const [step, setStep] = useState<1 | 2 | "success">(1);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any Type");
  const [budget, setBudget] = useState("Any Budget");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /* Reset to a clean first step every time the modal opens */
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setPhone("");
    setName("");
    setEmail("");
    setPreferredLocation("");
    setPropertyType("Any Type");
    setBudget("Any Budget");
    setError("");
    setSubmitting(false);
  }, [open]);

  /* Escape to close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const phoneDigits = phone.replace(/\D/g, "");
  const isPhoneValid = phoneDigits.length >= 7;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setError("");
    const budgetOpt = BUDGET_OPTIONS.find((b) => b.label === budget);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number: phone.trim(),
          customer_name: name.trim(),
          email: email.trim() || undefined,
          preferred_location: preferredLocation.trim() || undefined,
          property_type: propertyType !== "Any Type" ? propertyType : undefined,
          budget_min: budgetOpt?.min,
          budget_max: budgetOpt?.max,
          source,
          notes: propertyId
            ? `Interested in ${propertyTitle ?? propertyId}`
            : undefined,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStep("success");
      onSuccess?.();
      setTimeout(() => onOpenChange(false), 2600);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[100]"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px) saturate(160%)",
            }}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="glass-fixed relative p-7"
              style={{
                background: "var(--glass-3-bg)",
                border: "1px solid var(--border-gold)",
                borderRadius: "var(--radius-xl)",
                backdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
                WebkitBackdropFilter: "blur(var(--glass-3-blur)) saturate(160%)",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.14), 0 0 40px rgba(99,102,241,0.06)",
              }}
            >
              {/* Close */}
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: "var(--glass-1-bg)",
                  border: "1px solid var(--glass-1-border)",
                }}
              >
                <X
                  className="w-3.5 h-3.5"
                  style={{ color: "var(--text-secondary)" }}
                />
              </button>

              {/* Progress dots */}
              {step !== "success" && (
                <div className="flex items-center gap-1.5 mb-6">
                  {[1, 2].map((n) => (
                    <div
                      key={n}
                      className="h-1 rounded-full flex-1 transition-colors"
                      style={{
                        background:
                          n <= (step as number)
                            ? "linear-gradient(135deg, var(--gold-500), var(--gold-400))"
                            : "var(--glass-1-border)",
                      }}
                    />
                  ))}
                </div>
              )}

              {/* ── STEP 1 — phone ── */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid var(--border-gold)",
                    }}
                  >
                    <Phone
                      className="w-5 h-5"
                      style={{ color: "var(--gold-400)" }}
                    />
                  </div>
                  <h3
                    className="font-display font-bold text-lg mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Let&apos;s find your perfect property
                  </h3>
                  <p
                    className="text-sm mb-5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Share your number and our AI will follow up with matches in
                    minutes.
                  </p>

                  <FieldLabel>Phone Number</FieldLabel>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && isPhoneValid && setStep(2)
                    }
                    placeholder="+91 98765 43210"
                    autoFocus
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-2"
                    style={inputStyle}
                  />
                  <p
                    className="text-[11px] mb-6"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No spam — used only to send updates on properties
                    you&apos;re interested in.
                  </p>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!isPhoneValid}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                      color: "var(--void)",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.18)",
                    }}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* ── STEP 2 — details ── */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-xs font-medium mb-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <h3
                    className="font-display font-bold text-lg mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Just a few more details
                  </h3>
                  <p
                    className="text-sm mb-5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    We&apos;ll reach out to{" "}
                    <span style={{ color: "var(--gold-400)" }}>{phone}</span>{" "}
                    with matches.
                  </p>

                  <div className="space-y-4 mb-5">
                    <div>
                      <FieldLabel>Full Name</FieldLabel>
                      <div className="relative">
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          autoFocus
                          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Email (optional)</FieldLabel>
                      <div className="relative">
                        <Mail
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Preferred Location (optional)</FieldLabel>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          type="text"
                          value={preferredLocation}
                          onChange={(e) => setPreferredLocation(e.target.value)}
                          placeholder="e.g. Whitefield"
                          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <FieldLabel>Property Type</FieldLabel>
                        <select
                          value={propertyType}
                          onChange={(e) => setPropertyType(e.target.value)}
                          className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                          style={inputStyle}
                        >
                          {PROPERTY_TYPE_OPTIONS.map((t) => (
                            <option
                              key={t}
                              value={t}
                              style={{ background: "#FFFFFF" }}
                            >
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Budget</FieldLabel>
                        <select
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full rounded-xl px-3 py-3 text-sm outline-none"
                          style={inputStyle}
                        >
                          {BUDGET_OPTIONS.map((b) => (
                            <option
                              key={b.label}
                              value={b.label}
                              style={{ background: "#FFFFFF" }}
                            >
                              {b.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-xs mb-4" style={{ color: "#F87171" }}>
                      {error}
                    </p>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !name.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--gold-500), var(--gold-600))",
                      color: "var(--void)",
                      boxShadow: "0 4px 16px rgba(99,102,241,0.18)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Submit
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* ── SUCCESS ── */}
              {step === "success" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6"
                >
                  <div className="flex justify-center mb-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        border: "1px solid rgba(16,185,129,0.3)",
                      }}
                    >
                      <CheckCircle
                        className="w-7 h-7"
                        style={{ color: "#10B981" }}
                      />
                    </div>
                  </div>
                  <p
                    className="font-display font-bold text-lg mb-1.5"
                    style={{ color: "var(--text-primary)" }}
                  >
                    You&apos;re all set!
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Our team will reach out to {phone} shortly.
                  </p>
                  <p
                    className="text-[11px] mt-4"
                    style={{ color: "var(--text-muted)" }}
                  >
                    This window will close automatically.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

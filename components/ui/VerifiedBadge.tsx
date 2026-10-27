"use client";

import { ShieldCheck } from "lucide-react";

/* ─────────────────────────────────────────────
   STANDARDIZED VERIFIED BADGE
   redesign-plan.md — Section 7.2

   Single source of truth for RERA verification UI.
   Two variants:
     - "chip": small inline pill (PropertyCard, list rows)
     - "row":  full-width bordered row with label + number
               (Trust panels, property detail page)
───────────────────────────────────────────── */

export interface VerifiedBadgeProps {
  /** RERA registration number. Omit/empty shows a pending state (row variant only). */
  reraNumber?: string | null;
  variant?: "chip" | "row";
  /** Chip variant only: hides the "Verified" label, icon only. */
  iconOnly?: boolean;
  className?: string;
}

export default function VerifiedBadge({
  reraNumber,
  variant = "chip",
  iconOnly = false,
  className = "",
}: VerifiedBadgeProps) {
  const isVerified = Boolean(reraNumber);

  if (variant === "row") {
    return (
      <div
        className={`flex items-center justify-between gap-3 p-3 rounded-xl ${className}`}
        style={{
          background: isVerified
            ? "rgba(99,102,241,0.06)"
            : "var(--glass-1-bg)",
          border: `1px solid ${isVerified ? "var(--border-gold)" : "var(--glass-1-border)"}`,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ShieldCheck
            className="w-4 h-4 shrink-0"
            style={{
              color: isVerified ? "var(--gold-400)" : "var(--text-muted)",
            }}
          />
          <span
            className="text-xs font-semibold truncate"
            style={{
              color: isVerified
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            }}
          >
            {isVerified ? "RERA Verified" : "Verification Pending"}
          </span>
        </div>
        {isVerified && (
          <span
            className="text-[10px] shrink-0"
            style={{ color: "var(--text-muted)" }}
          >
            {reraNumber}
          </span>
        )}
      </div>
    );
  }

  // "chip" variant — renders nothing if not verified (matches old inline behavior)
  if (!isVerified) return null;

  return (
    <span
      className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0 ${className}`}
      style={{
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(212,175,55,0.3)",
        color: "var(--gold-400)",
      }}
      title={`RERA Verified — ${reraNumber}`}
    >
      <ShieldCheck className="w-3 h-3" />
      {!iconOnly && "Verified"}
    </span>
  );
}

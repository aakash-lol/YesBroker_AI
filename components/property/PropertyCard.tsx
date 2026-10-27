"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  MapPin,
  ShieldCheck,
  Star,
  Heart,
  ArrowRight,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import VerifiedBadge from "@/components/ui/VerifiedBadge";
import type { UIProperty } from "@/lib/mappers";

/* ─────────────────────────────────────────────
   SHARED PROPERTY CARD — Light Theme
───────────────────────────────────────────── */

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

const FALLBACK_GRADIENTS = [
  "from-blue-100/60 to-slate-100/80",
  "from-amber-50/60 to-slate-100/80",
  "from-sky-100/50 to-slate-50/80",
  "from-emerald-50/50 to-slate-100/80",
  "from-indigo-100/50 to-blue-50/80",
  "from-stone-100/60 to-slate-50/80",
];

function extractBHK(type: string): number | null {
  const m = type.match(/(\d+)\s*bhk/i);
  return m ? parseInt(m[1], 10) : null;
}

/** Indicative EMI: 80% loan-to-value, 8.5% p.a., 20-year tenure. */
function estimateEMI(price: number): number {
  if (!price) return 0;
  const principal = price * 0.8;
  const monthlyRate = 0.085 / 12;
  const months = 20 * 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return Math.round(emi);
}

function formatEMI(price: number): string {
  const emi = estimateEMI(price);
  if (!emi) return "—";
  return `₹${emi.toLocaleString("en-IN")}/mo`;
}

export interface PropertyCardProps {
  property: UIProperty;
  index?: number;
  liked?: boolean;
  onLike?: () => void;
  compact?: boolean;
  className?: string;
}

export default function PropertyCard({
  property,
  index = 0,
  liked = false,
  onLike,
  compact = false,
  className = "",
}: PropertyCardProps) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError ? getPropertyImage(property.title) : null;
  const bhk = extractBHK(property.property_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        delay: Math.min(index * 0.06, 0.4),
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -3, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      className={`group flex flex-col overflow-hidden cursor-pointer ${className}`}
      style={{
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(100,116,180,0.12)",
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        transition: "box-shadow 0.3s ease, border-color 0.3s ease, transform 0.3s ease",
      }}
      id={`property-card-${property.id}`}
    >
      {/* ── IMAGE ── */}
      <div
        className={`relative overflow-hidden shrink-0 ${
          !imgSrc
            ? `bg-gradient-to-br ${FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]}`
            : "bg-[#F0F1F5]"
        }`}
        style={{ height: compact ? 140 : 208 }}
      >
        {imgSrc ? (
          <>
            <Image
              src={imgSrc}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              onError={() => setImgError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building2
              className="w-14 h-14 opacity-10"
              style={{ color: "#6366F1" }}
            />
          </div>
        )}

        {/* Featured badge — top-left */}
        {property.featured && (
          <div
            className="absolute top-3 left-3 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#4F46E5",
              backdropFilter: "blur(8px) saturate(150%)",
            }}
          >
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Like / shortlist — top-right */}
        {onLike && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onLike();
            }}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "rgba(255,255,255,0.90)",
              border: `1px solid ${liked ? "rgba(239,68,68,0.4)" : "rgba(100,116,180,0.15)"}`,
              backdropFilter: "blur(8px) saturate(150%)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
            id={`like-btn-${property.id}`}
            aria-label={liked ? "Remove from shortlist" : "Add to shortlist"}
          >
            <Heart
              className="w-3.5 h-3.5"
              style={{
                color: liked ? "#EF4444" : "var(--text-muted)",
                fill: liked ? "#EF4444" : "none",
              }}
            />
          </button>
        )}

        {/* BHK badge — bottom-left */}
        {bhk && (
          <div
            className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{
              background: "rgba(99,102,241,0.80)",
              border: "1px solid rgba(129,140,248,0.4)",
              color: "#FFF",
              backdropFilter: "blur(8px) saturate(150%)",
            }}
          >
            {bhk} BHK
          </div>
        )}
      </div>

      {/* ── CONTENT ── */}
      <div className={`flex flex-col flex-1 ${compact ? "p-3.5" : "p-5"}`}>
        {/* Title + verified badge */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3
            className={`font-display font-bold leading-snug line-clamp-1 ${compact ? "text-[13px]" : "text-[15px]"}`}
            style={{ color: "var(--text-primary)" }}
          >
            {property.title}
          </h3>
          <VerifiedBadge
            reraNumber={property.rera_number}
            variant="chip"
            iconOnly={compact}
          />
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: "#6366F1", opacity: 0.7 }}
          />
          <span
            className="text-xs truncate"
            style={{ color: "var(--text-secondary)" }}
          >
            {property.location}
          </span>
        </div>

        {/* Description — hidden in compact mode */}
        {!compact && property.description && (
          <p
            className="text-xs leading-relaxed line-clamp-2 mb-3"
            style={{ color: "var(--text-muted)" }}
          >
            {property.description}
          </p>
        )}

        {/* Amenity tags — hidden in compact mode */}
        {!compact && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {property.amenities.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{
                  background: "rgba(99,102,241,0.05)",
                  border: "1px solid rgba(99,102,241,0.12)",
                  color: "var(--text-secondary)",
                }}
              >
                {a}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-medium"
                style={{
                  background: "rgba(99,102,241,0.05)",
                  border: "1px solid rgba(99,102,241,0.12)",
                  color: "var(--text-secondary)",
                }}
              >
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div
          className="divider-glow mb-3"
          style={{ marginTop: compact ? 0 : undefined }}
        />

        {/* Price + EMI row */}
        <div className="flex items-end justify-between gap-3 mt-auto">
          <div className="min-w-0">
            <p
              className={`font-display font-black leading-none ${compact ? "text-base" : "text-xl"}`}
              style={{ color: "#4F46E5" }}
            >
              {formatPrice(property.price, property.currency)}
            </p>
            <p
              className="text-[11px] mt-1"
              style={{ color: "var(--text-muted)" }}
            >
              Est. EMI {formatEMI(property.price)}
              {property.minimum_price && !compact && (
                <span> · Floor {formatPrice(property.minimum_price)}</span>
              )}
            </p>
          </div>

          <Link
            href={`/property/${property.id}`}
            id={`view-detail-${property.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl shrink-0 transition-colors hover:bg-[rgba(99,102,241,0.08)]"
            style={{
              color: "#4F46E5",
              border: "1px solid rgba(99,102,241,0.20)",
              background: "rgba(99,102,241,0.04)",
            }}
          >
            {compact ? (
              <ArrowRight className="w-3.5 h-3.5" />
            ) : (
              <>
                View
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

/**
 * SkeletonCard — shimmer loading placeholder for property grid
 * Replaces "Loading…" text across property grids.
 * Glass-2 styling with animated gradient sweep.
 */

export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="glass-2 overflow-hidden"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      {/* Image placeholder */}
      <div
        className="skeleton-shimmer"
        style={{ height: compact ? 140 : 208 }}
      />

      {/* Content placeholder */}
      <div className={compact ? "p-3.5" : "p-5"}>
        {/* Title */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="skeleton-shimmer rounded-md"
            style={{ height: 16, width: "70%" }}
          />
          <div
            className="skeleton-shimmer rounded-md"
            style={{ height: 16, width: 56 }}
          />
        </div>

        {/* Location */}
        <div
          className="skeleton-shimmer rounded-md mb-4"
          style={{ height: 12, width: "45%" }}
        />

        {/* Description (hidden in compact) */}
        {!compact && (
          <div className="space-y-2 mb-4">
            <div
              className="skeleton-shimmer rounded-md"
              style={{ height: 12, width: "100%" }}
            />
            <div
              className="skeleton-shimmer rounded-md"
              style={{ height: 12, width: "80%" }}
            />
          </div>
        )}

        {/* Divider */}
        <div
          className="skeleton-shimmer rounded-full mb-3"
          style={{ height: 1, width: "100%" }}
        />

        {/* Price row */}
        <div className="flex items-center justify-between">
          <div>
            <div
              className="skeleton-shimmer rounded-md mb-1"
              style={{ height: 18, width: 100 }}
            />
            <div
              className="skeleton-shimmer rounded-md"
              style={{ height: 10, width: 80 }}
            />
          </div>
          <div
            className="skeleton-shimmer rounded-xl"
            style={{ height: 32, width: 60 }}
          />
        </div>
      </div>

      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(15,23,42,0.04) 25%,
            rgba(15,23,42,0.08) 50%,
            rgba(15,23,42,0.04) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-sweep 1.5s ease-in-out infinite;
        }

        @keyframes shimmer-sweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div
      className="glass-2 flex items-center gap-4 p-4"
      style={{ borderRadius: "var(--radius-lg)" }}
    >
      <div
        className="skeleton-shimmer rounded-lg shrink-0"
        style={{ width: 44, height: 44 }}
      />
      <div className="flex-1 min-w-0 space-y-2">
        <div
          className="skeleton-shimmer rounded-md"
          style={{ height: 14, width: "60%" }}
        />
        <div
          className="skeleton-shimmer rounded-md"
          style={{ height: 10, width: "40%" }}
        />
      </div>
      <div
        className="skeleton-shimmer rounded-lg shrink-0"
        style={{ width: 64, height: 28 }}
      />

      <style>{`
        .skeleton-shimmer {
          background: linear-gradient(
            90deg,
            rgba(15,23,42,0.04) 25%,
            rgba(15,23,42,0.08) 50%,
            rgba(15,23,42,0.04) 75%
          );
          background-size: 200% 100%;
          animation: shimmer-sweep 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

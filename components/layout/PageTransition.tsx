"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/lib/motion";

/* ─────────────────────────────────────────────
   PAGE TRANSITION WRAPPER — redesign-plan.md Section 8.3
   Wraps {children} in app/layout.tsx. Keyed on pathname so
   AnimatePresence treats each route as a distinct element and
   plays the pageTransition enter/exit from lib/motion.ts.
   Subtle by design (8px rise, ~350ms) per the Liquid Glass
   motion rules — a wrapper, not a page-of-its-own effect.
───────────────────────────────────────────── */
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

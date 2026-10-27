import { Variants, Transition } from "framer-motion";

/* ─────────────────────────────────────────────
   SHARED MOTION SYSTEM — redesign-plan.md Section 8.1
   Central home for Framer Motion variants + transition
   presets. Import what you need:

     import { fadeUp, glassPop, staggerContainer, springTransition, cardHoverProps, viewportOnce } from "@/lib/motion";
───────────────────────────────────────────── */

/** Standard spring — use anywhere motion needs a spring instead of a duration/ease tween. */
export const springTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
};

/** Entrance fade + 12px rise. This is the most duplicated animation in the
 *  app (`initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}` shows up 40+
 *  times) — replace those call sites with this variant. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Fade + rise + slight scale, for glass panels/modals that "pop" in —
 *  replaces ad hoc `initial={{opacity:0,scale:0.95,y:10}}` blocks. */
export const glassPop: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springTransition,
  },
};

/** Put this on the parent (`variants={staggerContainer} initial="hidden"
 *  whileInView="visible"`) and `variants={fadeUp}` on each child — replaces
 *  manual `transition={{ delay: i * 0.08 }}` on every mapped item. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

/** Card hover/press — matches the Liquid Glass motion rule (lift 2–4px +
 *  scale 1.01–1.02 + shadow deepen, spring not linear).
 *  Usage: <motion.div variants={fadeUp} {...cardHoverProps} className="glass-2 ..."> */
export const cardHoverProps = {
  whileHover: { y: -3, scale: 1.015 },
  whileTap: { scale: 0.99 },
};

/** Button hover/press — smaller lift since buttons are usually inline. */
export const buttonHoverProps = {
  whileHover: { y: -1, scale: 1.02 },
  whileTap: { scale: 0.97 },
};

/** Shared viewport config — every `whileInView` section already uses
 *  `{ once: true }`; this just names it so it's one import. */
export const viewportOnce = { once: true, margin: "-40px" };
/** Page-level enter/exit for the root transition wrapper (Section 8.3).
 *  Includes an `exit` state, unlike fadeUp/glassPop, since AnimatePresence
 *  needs one to animate the outgoing page before it unmounts. */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};
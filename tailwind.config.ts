import type { Config } from "tailwindcss";

/* ═══════════════════════════════════════════════════
   Liquid Glass token values — LIGHT THEME
   Kept in sync with the :root block in app/globals.css.
   Defined once here so champagne/ivory/obsidian (legacy,
   still referenced by pages pending migration) and
   gold/surface/sapphire (go-forward) share one set
   of hex values.
═══════════════════════════════════════════════════ */

const surfaces = {
  void: "#FFFFFF",
  deep: "#F4F5F8",
  surface: "#FFFFFF",
  elevated: "#FFFFFF",
};

const gold = {
  300: "#F3DFA0",
  400: "#C9A227",
  500: "#B8860C",
  600: "#96700A",
  700: "#6B5410",
};

const sapphire = {
  400: "#38BDF8",
  500: "#2563EB",
  600: "#1D4ED8",
};

const ivory = {
  50: "#FAFAF9",
  100: "#F5F5F4",
  200: "#E7E5E4",
  300: "#D6D3D1",
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Legacy semantic names ──
           Still used directly by crm, analytics, negotiation,
           deal-room, admin, site-visits, whatsapp, and property/[id].
           Aliased onto the gold/surface constants above. */
        ivory: {
          50: ivory[50],
          100: ivory[100],
          200: ivory[200],
          300: ivory[300],
        },
        champagne: {
          300: gold[300],
          400: gold[400],
          500: gold[500],
          600: gold[600],
          700: gold[700],
        },
        obsidian: {
          900: surfaces.void,
          800: surfaces.deep,
          700: surfaces.surface,
          600: surfaces.elevated,
        },

        /* ── Liquid Glass token system (go-forward) ── */
        void: surfaces.void,
        bg: {
          deep: surfaces.deep,
          surface: surfaces.surface,
          elevated: surfaces.elevated,
        },
        gold: {
          300: gold[300],
          400: gold[400],
          500: gold[500],
          600: gold[600],
          700: gold[700],
        },
        sapphire: {
          400: sapphire[400],
          500: sapphire[500],
          600: sapphire[600],
        },
        brand: {
          gold: gold[500],
          sapphire: sapphire[500],
        },
        ui: {
          success: "#16A34A",
          warning: "#D97706",
          danger: "#DC2626",
          text: "#10131A",
          muted: "#545B6B",
        },
      },
      fontFamily: {
  display: ["var(--font-geist)", "-apple-system", "sans-serif"],
  body: ["Inter", "-apple-system", "sans-serif"],
},
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
        // Liquid Glass radius scale
        "glass-sm": "12px",
        "glass-md": "16px",
        "glass-lg": "20px",
        "glass-xl": "28px",
      },
      boxShadow: {
        // Liquid Glass elevation shadow scale — light, soft, diffused
        "glass-1": "0 1px 2px rgba(15,23,42,0.04), 0 12px 32px rgba(15,23,42,0.07)",
        "glass-2": "0 20px 50px rgba(15,23,42,0.10), 0 0 0 1px rgba(15,23,42,0.04)",
        "glass-3": "0 30px 80px rgba(15,23,42,0.16), 0 0 0 1px rgba(15,23,42,0.05)",
        "gold-glow": "0 0 20px rgba(184,134,11,0.15)",
        "sapphire-glow": "0 0 20px rgba(37,99,235,0.15)",
      },
      backdropBlur: {
        xs: "2px",
        "glass-1": "20px",
        "glass-2": "32px",
        "glass-3": "40px",
      },
      animation: {
        "aurora":        "aurora 8s ease-in-out infinite alternate",
        "float":         "float 6s ease-in-out infinite",
        "float-slow":    "float-slow 8s ease-in-out infinite",
        "float-card-1":  "float-card-1 6s ease-in-out infinite",
        "float-card-2":  "float-card-2 7s ease-in-out infinite",
        "float-card-3":  "float-card-3 5.5s ease-in-out infinite",
        "shimmer":       "shimmer 2s linear infinite",
        "pulse-glow":    "pulse-glow-blue 3s ease-in-out infinite",
        "spin-slow":     "spin-slow 20s linear infinite",
        "pulse-ring":    "pulse-ring 2s ease-out infinite",
        "wave-bar":      "wave-bar 0.8s ease-in-out infinite",
        "blink-cursor":  "blink-cursor 0.8s step-end infinite",
        "slide-in-right":"slide-in-right 0.5s ease-out forwards",
        "aurora-shift":  "aurora-shift 10s ease-in-out infinite",
      },
      keyframes: {
        aurora: {
          "0%":   { backgroundPosition: "0% 50%" },
          "50%":  { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%":      { transform: "translateY(-18px) rotate(2deg)" },
        },
        "float-card-1": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%":      { transform: "translateY(-8px) translateX(3px)" },
          "66%":      { transform: "translateY(4px) translateX(-2px)" },
        },
        "float-card-2": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "33%":      { transform: "translateY(6px) translateX(-4px)" },
          "66%":      { transform: "translateY(-10px) translateX(2px)" },
        },
        "float-card-3": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow-blue": {
          "0%, 100%": { boxShadow: "0 0 16px rgba(37,99,235,0.18)" },
          "50%":      { boxShadow: "0 0 28px rgba(37,99,235,0.35), 0 0 56px rgba(37,99,235,0.12)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to:   { transform: "rotate(360deg)" },
        },
        "pulse-ring": {
          "0%":   { transform: "scale(0.8)", opacity: "1" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "wave-bar": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%":      { transform: "scaleY(1)" },
        },
        "blink-cursor": {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(30px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "aurora-shift": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1) translate(0, 0)" },
          "25%":      { opacity: "0.6", transform: "scale(1.05) translate(2%, 1%)" },
          "50%":      { opacity: "0.5", transform: "scale(0.98) translate(-1%, 2%)" },
          "75%":      { opacity: "0.7", transform: "scale(1.03) translate(1%, -1%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
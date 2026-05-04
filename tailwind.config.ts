import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0A0A0B",
          elevated: "#101012",
          card: "#141416",
          hover: "#1A1A1D",
        },
        line: {
          DEFAULT: "#27272A",
          subtle: "#1F1F22",
          strong: "#3F3F46",
        },
        ink: {
          DEFAULT: "#FAFAFA",
          muted: "#A1A1AA",
          dim: "#71717A",
          faint: "#52525B",
        },
        loss: {
          DEFAULT: "#EF4444",
          deep: "#B91C1C",
          subtle: "#7F1D1D",
          bg: "#2A0E10",
          glow: "rgba(239, 68, 68, 0.18)",
        },
        warm: {
          DEFAULT: "#F59E0B",
          subtle: "#92400E",
        },
        ok: {
          DEFAULT: "#10B981",
          subtle: "#065F46",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      fontFeatureSettings: {
        tabular: ['"tnum"', '"cv11"'],
      },
      borderRadius: {
        DEFAULT: "0.375rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.02) inset, 0 0 0 1px #27272A",
        modal: "0 24px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px #27272A",
        glow: "0 0 40px -8px rgba(239, 68, 68, 0.35)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-8px)" },
        },
        "pulse-loss": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "fade-out": "fade-out 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-loss": "pulse-loss 2.4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;

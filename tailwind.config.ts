import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Refined Soft Lime Palette
        lime: {
          50: colors.lime[50], // #f7fee7
          100: colors.lime[100], // #ecfccb
          200: colors.lime[200], // #d9f99d
          300: colors.lime[300], // #bef264
          400: colors.lime[400], // #a3e635 (soft lime)
          500: colors.lime[500], // #84cc16
          600: colors.lime[600], // #65a30d
          700: colors.lime[700], // #4d7c0f
          800: colors.lime[800], // #3f6212
          900: colors.lime[900], // #365314
          950: colors.lime[950],
          DEFAULT: "#84CC16",
          soft: "#A3E635",
          tint: "#ECFCCB",
          deep: "#4D7C0F",
        },
        primary: {
          DEFAULT: "#84CC16",
          hover: "#65A30D",
          active: "#4D7C0F",
          soft: "#A3E635",
          tint: "#F7FEE7",
          border: "#D9F99D",
        },
        // Clean editorial light surfaces
        surface: {
          canvas: "#F8FAFC",
          card: "#FFFFFF",
          cardHover: "#FAFCF8",
          border: "#E2E8F0",
          borderHover: "#CBD5E1",
          muted: "#F1F5F9",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "lime-soft": "0 4px 20px -2px rgba(132, 204, 22, 0.25)",
        "lime-glow": "0 0 25px -4px rgba(132, 204, 22, 0.35)",
        "lime-pill": "0 8px 20px -4px rgba(132, 204, 22, 0.2)",
        "card": "0 2px 12px -2px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 10px 25px -4px rgba(15, 23, 42, 0.1)",
      },
      animation: {
        pulseSlow: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", "&");
    }),
  ],
};

export default config;

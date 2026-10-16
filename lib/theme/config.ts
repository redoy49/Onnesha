/**
 * =====================================================================
 * ONNESHA CENTRALIZED THEME CONFIGURATION
 * =====================================================================
 * This is the SINGLE SOURCE OF TRUTH for all colors, glows, and theme
 * tokens used across the entire Onnesha platform.
 *
 * To change the primary brand color for the entire website:
 * Change `themeConfig.primary.DEFAULT` and its matching gradient/glow
 * values below, or select from one of the predefined presets.
 * Every button, link, badge, active filter pill, progress bar,
 * border glow, and card highlight across the app will update automatically.
 * =====================================================================
 */

export interface ColorPalette {
  DEFAULT: string;
  hover: string;
  active: string;
  gradientStart: string;
  gradientEnd: string;
  glow: string;
  glowLg: string;
  pill: string;
  borderSubtle: string;
  borderMedium: string;
  borderHover: string;
  bgSubtle: string;
  bgMedium: string;
}

export interface SurfacePalette {
  canvas: string;
  surface: string;
  card: string;
  cardHover: string;
  border: string;
  borderHover: string;
  muted: string;
  text: string;
  textMuted: string;
}

export interface ThemeConfig {
  name: string;
  primary: ColorPalette;
  dark: SurfacePalette;
  light: SurfacePalette;
}

export const themeConfig: ThemeConfig = {
  name: "Soft Lime (Default)",
  // PRIMARY ACCENT PALETTE (Soft Lime #84CC16 / #A3E635)
  primary: {
    DEFAULT: "#84CC16",
    hover: "#65A30D",
    active: "#4D7C0F",
    gradientStart: "#A3E635",
    gradientEnd: "#84CC16",
    glow: "rgba(132, 204, 22, 0.3)",
    glowLg: "rgba(132, 204, 22, 0.5)",
    pill: "rgba(132, 204, 22, 0.2)",
    borderSubtle: "rgba(132, 204, 22, 0.25)",
    borderMedium: "rgba(132, 204, 22, 0.4)",
    borderHover: "rgba(132, 204, 22, 0.6)",
    bgSubtle: "rgba(132, 204, 22, 0.08)",
    bgMedium: "rgba(132, 204, 22, 0.15)",
  },

  // DARK THEME SURFACES (Reserved fallback)
  dark: {
    canvas: "#0F172A",
    surface: "#1E293B",
    card: "#1E293B",
    cardHover: "#334155",
    border: "#334155",
    borderHover: "#475569",
    muted: "#64748B",
    text: "#F8FAFC",
    textMuted: "#94A3B8",
  },

  // LIGHT THEME SURFACES (Default)
  light: {
    canvas: "#F8FAFC",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    cardHover: "#FAFCF8",
    border: "#E2E8F0",
    borderHover: "#CBD5E1",
    muted: "#64748B",
    text: "#0F172A",
    textMuted: "#475569",
  },
};

/**
 * Optional Predefined Theme Palettes for rapid customization
 */
export const themePresets: Record<string, ThemeConfig> = {
  lime: themeConfig,
  cyan: {
    name: "Cyber Cyan",
    primary: {
      DEFAULT: "#00F0FF",
      hover: "#00D6E6",
      active: "#00B2BF",
      gradientStart: "#00F0FF",
      gradientEnd: "#0099FF",
      glow: "rgba(0, 240, 255, 0.4)",
      glowLg: "rgba(0, 240, 255, 0.6)",
      pill: "rgba(0, 240, 255, 0.3)",
      borderSubtle: "rgba(0, 240, 255, 0.15)",
      borderMedium: "rgba(0, 240, 255, 0.3)",
      borderHover: "rgba(0, 240, 255, 0.5)",
      bgSubtle: "rgba(0, 240, 255, 0.1)",
      bgMedium: "rgba(0, 240, 255, 0.18)",
    },
    dark: {
      canvas: "#050B11",
      surface: "#0A131C",
      card: "#0F1A26",
      cardHover: "#152435",
      border: "#182C3F",
      borderHover: "#23415D",
      muted: "#23415D",
      text: "#F0F9FF",
      textMuted: "#94A3B8",
    },
    light: themeConfig.light,
  },
  violet: {
    name: "Electric Violet",
    primary: {
      DEFAULT: "#A855F7",
      hover: "#9333EA",
      active: "#7E22CE",
      gradientStart: "#C084FC",
      gradientEnd: "#9333EA",
      glow: "rgba(168, 85, 247, 0.4)",
      glowLg: "rgba(168, 85, 247, 0.6)",
      pill: "rgba(168, 85, 247, 0.3)",
      borderSubtle: "rgba(168, 85, 247, 0.15)",
      borderMedium: "rgba(168, 85, 247, 0.3)",
      borderHover: "rgba(168, 85, 247, 0.5)",
      bgSubtle: "rgba(168, 85, 247, 0.1)",
      bgMedium: "rgba(168, 85, 247, 0.18)",
    },
    dark: {
      canvas: "#090610",
      surface: "#100C1C",
      card: "#181329",
      cardHover: "#211A38",
      border: "#292144",
      borderHover: "#3B2F62",
      muted: "#3B2F62",
      text: "#FAF5FF",
      textMuted: "#A1A1AA",
    },
    light: themeConfig.light,
  },
};

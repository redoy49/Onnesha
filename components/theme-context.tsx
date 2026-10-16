"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { themeConfig, themePresets, ThemeConfig } from "@/lib/theme/config";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  isPaletteModalOpen: boolean;
  openPaletteModal: () => void;
  closePaletteModal: () => void;
  isWriteModalOpen: boolean;
  openWriteModal: () => void;
  closeWriteModal: () => void;
  currentTheme: ThemeConfig;
  setThemePreset: (presetKey: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark] = useState(false);
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themeConfig);

  useEffect(() => {
    // Night theme removed: enforce pure light theme across the application
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }

    const savedPreset = localStorage.getItem("onnesha-preset");
    if (savedPreset && themePresets[savedPreset]) {
      applyPreset(themePresets[savedPreset]);
    }
  }, []);

  const toggleTheme = () => {
    // Night theme removed per user request: site is exclusively light theme
  };

  const applyPreset = (theme: ThemeConfig) => {
    setCurrentTheme(theme);
    const root = document.documentElement;
    // Dynamically apply primary tokens
    root.style.setProperty("--color-primary", theme.primary.DEFAULT);
    root.style.setProperty("--color-primary-hover", theme.primary.hover);
    root.style.setProperty("--color-primary-active", theme.primary.active);
    root.style.setProperty("--color-primary-gradient-start", theme.primary.gradientStart);
    root.style.setProperty("--color-primary-gradient-end", theme.primary.gradientEnd);
    root.style.setProperty("--shadow-primary-glow", theme.primary.glow);
    root.style.setProperty("--shadow-primary-glow-lg", theme.primary.glowLg);
    root.style.setProperty("--shadow-primary-pill", theme.primary.pill);
    root.style.setProperty("--color-primary-border-subtle", theme.primary.borderSubtle);
    root.style.setProperty("--color-primary-border-medium", theme.primary.borderMedium);
    root.style.setProperty("--color-primary-border-hover", theme.primary.borderHover);
    root.style.setProperty("--color-primary-bg-subtle", theme.primary.bgSubtle);
    root.style.setProperty("--color-primary-bg-medium", theme.primary.bgMedium);
  };

  const setThemePreset = (presetKey: string) => {
    if (themePresets[presetKey]) {
      applyPreset(themePresets[presetKey]);
      localStorage.setItem("onnesha-preset", presetKey);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleTheme,
        isPaletteModalOpen,
        openPaletteModal: () => setIsPaletteModalOpen(true),
        closePaletteModal: () => setIsPaletteModalOpen(false),
        isWriteModalOpen,
        openWriteModal: () => setIsWriteModalOpen(true),
        closeWriteModal: () => setIsWriteModalOpen(false),
        currentTheme,
        setThemePreset,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

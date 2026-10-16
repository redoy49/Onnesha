"use client";

import React from "react";
import { FaXmark, FaCheck } from "react-icons/fa6";
import { useTheme } from "./theme-context";
import { themePresets } from "@/lib/theme/config";

export function PaletteModal() {
  const { isPaletteModalOpen, closePaletteModal, currentTheme, setThemePreset } = useTheme();

  if (!isPaletteModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-slate-950 font-black shadow-sm">
              #
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">
                Centralized Color System
              </h2>
              <p className="text-xs font-mono text-lime-800 font-bold">
                Current Accent: {currentTheme.primary.DEFAULT}
              </p>
            </div>
          </div>
          <button
            onClick={closePaletteModal}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
            type="button"
          >
            <FaXmark className="text-sm" />
          </button>
        </div>

        {/* Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            className="p-3 rounded-2xl text-slate-950 space-y-1 shadow-sm border border-slate-200"
            style={{ backgroundColor: currentTheme.primary.DEFAULT }}
          >
            <span className="block text-[10px] font-mono font-bold uppercase opacity-80">
              Primary Accent
            </span>
            <span className="block text-sm font-black">{currentTheme.primary.DEFAULT}</span>
          </div>

          <div
            className="p-3 rounded-2xl text-slate-800 space-y-1 border border-slate-200 bg-slate-50"
          >
            <span className="block text-[10px] font-mono font-bold uppercase opacity-80">
              Canvas Surface
            </span>
            <span className="block text-sm font-black">#F8FAFC</span>
          </div>

          <div
            className="p-3 rounded-2xl text-slate-800 space-y-1 border border-slate-200 bg-white shadow-sm"
          >
            <span className="block text-[10px] font-mono font-bold uppercase opacity-80">
              Surface Card
            </span>
            <span className="block text-sm font-black">#FFFFFF</span>
          </div>

          <div
            className="p-3 rounded-2xl text-slate-950 space-y-1 border border-slate-200"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primary.gradientStart} 0%, ${currentTheme.primary.gradientEnd} 100%)`,
            }}
          >
            <span className="block text-[10px] font-mono font-bold uppercase opacity-80">
              Soft Blend
            </span>
            <span className="block text-xs font-black">Lime Palette</span>
          </div>
        </div>

        {/* Live Preset Switcher */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <h4 className="text-xs font-mono text-slate-600 uppercase">
            Test Centralized Palette Presets (Updates Entire App):
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(themePresets).map(([key, preset]) => {
              const isSelected = currentTheme.primary.DEFAULT === preset.primary.DEFAULT;
              return (
                <button
                  key={key}
                  onClick={() => setThemePreset(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition ${
                    isSelected
                      ? "bg-lime-400 text-slate-950 border-lime-500 shadow-sm font-black"
                      : "bg-slate-100 text-slate-700 border-slate-200 hover:border-lime-400"
                  }`}
                  type="button"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: preset.primary.DEFAULT }}
                  />
                  <span>{preset.name}</span>
                  {isSelected && <FaCheck className="text-[10px]" />}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            💡 <strong>Developer Note:</strong> Shared tokens are centralized in{" "}
            <code className="text-lime-800 font-mono font-bold">lib/theme/config.ts</code> and{" "}
            <code className="text-lime-800 font-mono font-bold">tailwind.config.ts</code>.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={closePaletteModal}
            className="px-6 py-2 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-extrabold shadow-sm transition"
            type="button"
          >
            Close Specs
          </button>
        </div>
      </div>
    </div>
  );
}

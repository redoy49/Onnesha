"use client";

import React from "react";
import { FaBookmark, FaListUl, FaBorderAll } from "react-icons/fa6";
import { CategoryFilter, LayoutMode } from "@/types/article";

interface CategoryPillsProps {
  currentCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  layoutMode: LayoutMode;
  onToggleLayout: (mode: LayoutMode) => void;
}

const CATEGORIES: { label: string; value: CategoryFilter; icon?: boolean }[] = [
  { label: "All Stories", value: "All" },
  { label: "AI & Prompts", value: "AI & Prompts" },
  { label: "Coding & Tech", value: "Coding & Tech" },
  { label: "UX Design", value: "UX Design" },
  { label: "Web Development", value: "Web Development" },
  { label: "Saved", value: "Saved", icon: true },
];

export function CategoryPills({
  currentCategory,
  onSelectCategory,
  layoutMode,
  onToggleLayout,
}: CategoryPillsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
      {/* Category Scroll Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none whitespace-nowrap">
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => onSelectCategory(cat.value)}
              className={`category-btn px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-lime-400 text-slate-950 font-extrabold shadow-sm border border-lime-500"
                  : "bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:border-lime-400 hover:bg-lime-50/60 font-semibold shadow-sm"
              }`}
              type="button"
            >
              {cat.icon && <FaBookmark className={isActive ? "text-slate-950" : "text-lime-700"} />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Layout Toggle */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="text-xs text-slate-500 font-mono">View:</span>
        <button
          onClick={() => onToggleLayout("list")}
          className={`p-2 rounded-full transition-all ${
            layoutMode === "list"
              ? "bg-lime-400 text-slate-950 shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-lime-400 shadow-sm"
          }`}
          title="List View"
          type="button"
        >
          <FaListUl className="text-xs" />
        </button>
        <button
          onClick={() => onToggleLayout("grid")}
          className={`p-2 rounded-full transition-all ${
            layoutMode === "grid"
              ? "bg-lime-400 text-slate-950 shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-lime-400 shadow-sm"
          }`}
          title="Grid View"
          type="button"
        >
          <FaBorderAll className="text-xs" />
        </button>
      </div>
    </div>
  );
}

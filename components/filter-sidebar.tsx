"use client";

import React from "react";
import { FaSliders, FaDribbble, FaXTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { useToast } from "./toast";

interface FilterSidebarProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const AVAILABLE_TAGS = [
  "UX Design",
  "Branding",
  "Web Development",
  "Design System",
  "Marketing",
];

export function FilterSidebar({ selectedTags, onToggleTag }: FilterSidebarProps) {
  const { showToast } = useToast();

  const handleSubscribe = () => {
    showToast("Subscribed to Weekly Onnesha Insights!");
  };

  return (
    <aside className="lg:col-span-3 space-y-8 text-left">
      {/* Quick Filters Widget */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <FaSliders className="text-xs text-lime-700" /> Quick Filters
        </h3>

        <div className="space-y-3 text-xs" id="quickFilterList">
          {AVAILABLE_TAGS.map((tag) => {
            const isChecked = selectedTags.includes(tag);
            return (
              <label
                key={tag}
                className="flex items-center gap-3 text-slate-700 cursor-pointer hover:text-lime-700 transition-colors"
              >
                <input
                  type="checkbox"
                  className="custom-checkbox"
                  checked={isChecked}
                  onChange={() => onToggleTag(tag)}
                />
                <span className="font-medium">{tag}</span>
              </label>
            );
          })}
        </div>

        {/* Follow Us Section */}
        <div className="space-y-3 pt-3 border-t border-slate-200">
          <h4 className="font-bold text-xs uppercase text-slate-500">
            Follow us on
          </h4>
          <div className="flex items-center gap-2.5">
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition-all shadow-sm"
              title="Dribbble"
            >
              <FaDribbble className="text-sm" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition-all shadow-sm"
              title="X Social Network"
            >
              <FaXTwitter className="text-sm" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition-all shadow-sm"
              title="LinkedIn"
            >
              <FaLinkedinIn className="text-sm" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition-all shadow-sm"
              title="Instagram"
            >
              <FaInstagram className="text-sm" />
            </a>
          </div>
        </div>
      </div>

      {/* Gradient Spotlight Card */}
      <div className="rounded-3xl p-6 bg-lime-50/80 border border-lime-300 space-y-3 shadow-sm">
        <span className="px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
          DISPATCH DIGEST
        </span>
        <h4 className="font-bold text-base text-slate-900">
          Get Weekly Onnesha Insights
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Pure AI, web development, and code dispatches straight to your inbox.
        </p>
        <button
          onClick={handleSubscribe}
          className="w-full py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-extrabold text-xs transition-all shadow-sm"
          type="button"
        >
          Subscribe Free
        </button>
      </div>
    </aside>
  );
}

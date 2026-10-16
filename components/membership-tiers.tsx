"use client";

import React from "react";
import { useAuth } from "./auth-context";
import { useToast } from "./toast";
import { useRouter } from "next/navigation";

export function MembershipTiers() {
  const { isAdmin, openAdminModal } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleJoinReader = () => {
    showToast("Welcome aboard! You have full access to read all dispatches.");
  };

  const handleCreatorClick = () => {
    if (isAdmin) {
      router.push("/dashboard");
    } else {
      openAdminModal();
    }
  };

  return (
    <section
      id="membershipSection"
      className="py-14 my-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full border-t border-slate-200 text-left"
    >
      <div className="text-center space-y-3 mb-10">
        <h2 className="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight">
          Become an Onnesha member <br className="hidden sm:inline" />any way you prefer
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Join our exclusive circle of engineers, UI architects, and brand strategists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tier 1: Reader Tier */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden group hover:border-lime-400 hover:shadow-md transition-all shadow-sm">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-lime-100/60 rounded-full blur-2xl pointer-events-none group-hover:bg-lime-200/60 transition-all" />

          <span className="px-3.5 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[11px] font-mono font-bold uppercase shadow-sm">
            READER TIER (FREE)
          </span>

          <h3 className="font-extrabold text-2xl text-slate-900">
            Award winning guides and articles to explore at your own pace
          </h3>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Access expert analysis lessons, guides, and tech breakdowns.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Bookmark and explore technical software engineering dispatches.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Full distraction-free reading experience.
            </li>
          </ul>

          <button
            onClick={handleJoinReader}
            className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs uppercase tracking-wider font-extrabold shadow-sm w-full sm:w-auto transition-colors"
            type="button"
          >
            Explore as Reader
          </button>

          <div className="pt-4 aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800"
              className="w-full h-full object-cover"
              alt="Reader preview"
            />
          </div>
        </div>

        {/* Tier 2: Admin Creator Tier */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 relative overflow-hidden group hover:border-lime-400 hover:shadow-md transition-all shadow-sm">
          <div className="absolute -right-12 -top-12 w-40 h-40 bg-lime-100/60 rounded-full blur-2xl pointer-events-none group-hover:bg-lime-200/60 transition-all" />

          <span className="px-3.5 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[11px] font-mono font-bold uppercase shadow-sm">
            ADMIN CREATOR TIER
          </span>

          <h3 className="font-extrabold text-2xl text-slate-900">
            Generate and publish with ChatGPT, Claude, Gemini, Grok, Kimi, and DeepSeek
          </h3>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              AI Studio with 6 specialized LLM models for full article generation.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Live publishing dashboard, article management, and feature toggles.
            </li>
            <li className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500" />
              Automated SEO metadata, tag generation, and Unsplash curation.
            </li>
          </ul>

          <button
            onClick={handleCreatorClick}
            className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm w-full sm:w-auto transition-colors"
            type="button"
          >
            {isAdmin ? "Open AI Studio Dashboard" : "Admin Portal Sign In"}
          </button>

          <div className="pt-4 aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800"
              className="w-full h-full object-cover"
              alt="Creator preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

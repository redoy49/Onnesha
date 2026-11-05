"use client";

import React from "react";
import { FaCircleInfo, FaArrowUpRightFromSquare, FaGoogle } from "react-icons/fa6";

interface GoogleAdBannerProps {
  slotId?: string;
  format?: "vertical" | "rectangle";
  className?: string;
}

export function GoogleAdBanner({
  slotId = "demo-slot-300x600",
  format = "vertical",
  className = "",
}: GoogleAdBannerProps) {
  return (
    <aside className={`space-y-4 ${className}`}>
      {/* Google Ads Container Wrapper */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4 sticky top-20 transition-all hover:border-slate-300">
        {/* Google Ads Badge & Attribution Header */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
            <span>Ad · Google</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer" title="AdChoices Information">
            <span>AdChoices</span>
            <FaCircleInfo className="text-[10px]" />
          </div>
        </div>

        {/* High-Impact Visual Display Creative Card (Trial Demo) */}
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 space-y-4 shadow-inner">
          {/* Subtle Ambient Radial Glow inside Banner */}
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-lime-400/20 blur-2xl pointer-events-none" />

          {/* Top Brand Pill & Size Indicator */}
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 font-bold tracking-wider uppercase">
              Sponsored
            </span>
            <span className="text-slate-400">300 × 600</span>
          </div>

          {/* Visual Creative Graphic / Tech Badge */}
          <div className="space-y-2 pt-2">
            <div className="w-10 h-10 rounded-xl bg-lime-400/20 border border-lime-400/30 flex items-center justify-center text-lime-400">
              <FaGoogle className="text-lg" />
            </div>
            <h4 className="font-extrabold text-base leading-snug tracking-tight text-white font-serif">
              Enterprise Cloud &amp; AI Data Pipelines
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Accelerate distributed agent workflows with sub-second latency and automated fact verification.
            </p>
          </div>

          {/* Feature Bullets */}
          <div className="space-y-1.5 pt-2 border-t border-slate-700/60 text-[11px] font-mono text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-lime-400 font-bold">✓</span>
              <span>99.99% Global Uptime SLA</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lime-400 font-bold">✓</span>
              <span>1-Click Vercel &amp; Next.js Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lime-400 font-bold">✓</span>
              <span>Zero-Config Distributed Cache</span>
            </div>
          </div>

          {/* Call-To-Action Button */}
          <div className="pt-2">
            <a
              href="#sponsored"
              onClick={(e) => e.preventDefault()}
              className="w-full py-2.5 px-4 rounded-xl lime-cta-btn text-xs font-bold font-mono tracking-wider shadow-sm flex items-center justify-center gap-2 transition hover:brightness-105"
            >
              <span>Explore Free Trial</span>
              <FaArrowUpRightFromSquare className="text-[10px]" />
            </a>
          </div>

          {/* Micro Footer Notice */}
          <p className="text-[10px] text-center text-slate-400 font-mono">
            Trial Demo Ad • Slot: #{slotId}
          </p>
        </div>

        {/* Secondary Compact Notice Card */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-left space-y-1">
          <div className="text-[11px] font-bold text-slate-800">
            Advertise with Onnesha
          </div>
          <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
            Reach 120k+ software engineers, AI researchers, and technical architects.
          </p>
        </div>
      </div>
    </aside>
  );
}

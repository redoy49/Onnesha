import { Metadata } from "next";
import { Header } from "@/components/header";
import { defaultAuthor } from "@/lib/data/articles";
import { FaDribbble, FaXTwitter, FaLinkedinIn, FaBolt } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "About Onnesha & Author Editorial Profile",
  description: "Learn about the mission, engineering philosophy, and design system behind Onnesha.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 w-full space-y-12 text-left">
        {/* Author Bio Header Card */}
        <div className="bg-obsidian-surface/70 border border-lime/30 rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden light:bg-white light:border-slate-200">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={defaultAuthor.avatar}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-lime shadow-lime-glow shrink-0"
              alt={defaultAuthor.name}
            />
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3.5 py-1 rounded-full bg-lime/10 text-lime border border-lime/30 text-xs font-mono font-bold uppercase">
                AUTHOR & RESEARCHER
              </span>
              <h1 className="font-extrabold text-3xl sm:text-4xl text-white light:text-slate-900 tracking-tight">
                {defaultAuthor.name}
              </h1>
              <p className="text-sm font-mono text-lime font-bold">{defaultAuthor.role}</p>
            </div>
          </div>

          <p className="text-gray-300 light:text-slate-700 text-base sm:text-lg leading-relaxed pt-2 border-t border-obsidian-border light:border-slate-100">
            {defaultAuthor.bio}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-obsidian-card border border-obsidian-border text-xs text-gray-300 hover:text-lime hover:border-lime transition flex items-center gap-2 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
            >
              <FaXTwitter /> <span>Twitter</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-obsidian-card border border-obsidian-border text-xs text-gray-300 hover:text-lime hover:border-lime transition flex items-center gap-2 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
            >
              <FaLinkedinIn /> <span>LinkedIn</span>
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-obsidian-card border border-obsidian-border text-xs text-gray-300 hover:text-lime hover:border-lime transition flex items-center gap-2 light:bg-slate-100 light:border-slate-300 light:text-slate-700"
            >
              <FaDribbble /> <span>Dribbble</span>
            </a>
          </div>
        </div>

        {/* Editorial Mission */}
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime/10 border border-lime/30 text-lime text-xs font-bold uppercase tracking-wider">
            <FaBolt className="text-lime text-xs" />
            THE ONNESHA MANIFESTO
          </div>

          <h2 className="hero-title font-extrabold text-2xl sm:text-3xl text-white light:text-slate-900">
            Bridging AI Augmentation, High-Contrast Design, and Systems Architecture
          </h2>

          <div className="prose prose-invert max-w-none text-gray-300 light:text-slate-700 text-base leading-relaxed space-y-4">
            <p>
              Onnesha was born out of a desire to create a digital editorial experience that marries
              radical aesthetics with uncompromising web engineering performance.
            </p>
            <p>
              By embracing deep obsidian surfaces paired with electric lime focal accents (#D1FE17),
              readers experience optimal optic contrast while engaging with technical deep dives,
              prompt engineering playbooks, and systems architecture blueprints.
            </p>
          </div>
        </section>

        {/* Tech Stack Specs */}
        <section className="bg-obsidian-surface/60 border border-obsidian-border rounded-3xl p-8 space-y-6 light:bg-white light:border-slate-200">
          <h3 className="font-extrabold text-xl text-white light:text-slate-900">
            Platform Architecture & Multi-Model AI Engine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border space-y-1 light:bg-slate-50 light:border-slate-200">
              <span className="font-mono text-lime font-bold">Framework</span>
              <p className="text-gray-200 light:text-slate-800 font-semibold">Next.js 15 (App Router) + React 19</p>
            </div>
            <div className="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border space-y-1 light:bg-slate-50 light:border-slate-200">
              <span className="font-mono text-lime font-bold">Styling & Design Tokens</span>
              <p className="text-gray-200 light:text-slate-800 font-semibold">Tailwind CSS + Lime Palette & Obsidian</p>
            </div>
            <div className="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border space-y-1 light:bg-slate-50 light:border-slate-200">
              <span className="font-mono text-lime font-bold">Typography</span>
              <p className="text-gray-200 light:text-slate-800 font-semibold">Outfit (Google Fonts via next/font)</p>
            </div>
            <div className="p-4 rounded-2xl bg-obsidian-card border border-obsidian-border space-y-1 light:bg-slate-50 light:border-slate-200">
              <span className="font-mono text-lime font-bold">Role Access & Security</span>
              <p className="text-gray-200 light:text-slate-800 font-semibold">Admin-Gated AI Publishing / Read-Only Readers</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

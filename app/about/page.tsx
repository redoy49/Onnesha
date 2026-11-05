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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16 w-full space-y-10 text-left">
        {/* Author Bio Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 relative overflow-hidden shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <img
              src={defaultAuthor.avatar}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-lime-400 shadow-sm shrink-0"
              alt={defaultAuthor.name}
            />
            <div className="space-y-2 text-center sm:text-left">
              <span className="px-3.5 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-xs font-mono font-bold uppercase shadow-sm">
                AUTHOR & RESEARCHER
              </span>
              <h1 className="font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                {defaultAuthor.name}
              </h1>
              <p className="text-sm font-mono text-lime-800 font-bold">{defaultAuthor.role}</p>
            </div>
          </div>

          <p className="text-slate-700 text-base sm:text-lg leading-relaxed pt-4 border-t border-slate-100">
            {defaultAuthor.bio}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-lime-400 hover:bg-lime-50/50 transition flex items-center gap-2 shadow-sm"
            >
              <FaXTwitter /> <span>Twitter</span>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-lime-400 hover:bg-lime-50/50 transition flex items-center gap-2 shadow-sm"
            >
              <FaLinkedinIn /> <span>LinkedIn</span>
            </a>
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-900 hover:border-lime-400 hover:bg-lime-50/50 transition flex items-center gap-2 shadow-sm"
            >
              <FaDribbble /> <span>Dribbble</span>
            </a>
          </div>
        </div>

        {/* Editorial Mission */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <FaBolt className="text-lime-700 text-xs" />
            THE ONNESHA MANIFESTO
          </div>

          <h2 className="font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight">
            Bridging AI Augmentation, Modern 60-30-10 Design, and Systems Architecture
          </h2>

          <div className="prose max-w-none text-slate-700 text-base leading-relaxed space-y-4">
            <p>
              Onnesha was born out of a desire to create a digital editorial experience that marries
              refined aesthetics with uncompromising web engineering performance.
            </p>
            <p>
              By embracing the 60-30-10 design system with crisp neutral canvas, frosted cards, and signature electric lime focal accents (#D1FE17),
              readers experience optimal optic contrast while engaging with technical deep dives,
              autonomous AI research, and production systems architecture blueprints.
            </p>
          </div>
        </section>

        {/* Tech Stack Specs */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
          <h3 className="font-bold text-xl text-slate-900 tracking-tight">
            Platform Architecture & Multi-Model AI Engine
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-lime-800 font-bold">Framework</span>
              <p className="text-slate-800 font-semibold">Next.js 15 (App Router) + React 19</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-lime-800 font-bold">Styling & Design Tokens</span>
              <p className="text-slate-800 font-semibold">Tailwind CSS + 60-30-10 Electric Lime</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-lime-800 font-bold">Typography</span>
              <p className="text-slate-800 font-semibold">SolaimanLipi (Self-Hosted Local Font)</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-mono text-lime-800 font-bold">Role Access & Security</span>
              <p className="text-slate-800 font-semibold">Admin-Gated AI Publishing / Read-Only Readers</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

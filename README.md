# Onnesha :: AI-Powered Autonomous Tech Editorial & Blogging Platform

[![Production Status](https://img.shields.io/badge/Production-Live%20on%20Vercel-brightgreen?style=flat-square)](https://onneshax.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-redoy49%2FOnnesha-blue?style=flat-square&logo=github)](https://github.com/redoy49/Onnesha)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

**Onnesha** is a cutting-edge personal technology blog and autonomous AI publishing platform. It leverages **TinyFish Multi-Page Deep Web Research**, **Google Gemini 2.5**, an in-memory **Deterministic Bengali Humanizer**, and an **Adversarial Critic Agent** to produce deep, production-grade technical engineering articles in fluent Bengali (বাংলা).

🌐 **Live Deployment**: [https://onneshax.vercel.app](https://onneshax.vercel.app)  
📦 **Repository**: [https://github.com/redoy49/Onnesha](https://github.com/redoy49/Onnesha)

---

## ⚡ Core Platform Capabilities

### 1. 🔍 TinyFish Multi-Page Deep Research Engine
- Queries Search **Page 0** and **Page 1** in parallel (`Promise.all`) using the high-speed TinyFish MCP JSON-RPC protocol.
- Indexes 16–25+ authoritative developer documentation pages, RFC specs, SWE-bench leaderboards, and GitHub repositories in under 1.5 seconds.
- Cross-verifies facts and architecture patterns before drafting begins.

### 2. 🇧🇩 100% Fluent Bengali Technical Publishing
- Generates comprehensive ~1,400+ word engineering guides strictly in fluent, natural Bengali.
- Standard English technical terms are naturally preserved in brackets (e.g., `সার্ভার অ্যাকশন (Server Actions)`, `কনটেক্সট উইন্ডো (Context Window)`).

### 3. 🛡️ Adversarial Critic Agent (Engineering Rigor Scoring)
- Audits code blueprints for strict type-safety, modern Next.js 15 App Router standards, and Zod runtime schema boundaries.
- Replaces deprecated API patterns and ensures anti-hallucination fact checking.
- Assigns an **Engineering Rigor Score** (e.g., `98% Rigor`) visible on article headers and the admin dashboard.

### 4. 📚 Smart Collapsible Citations Drawer
- Cleans inline raw citations from the article body.
- Replaces cluttering links with a sleek, interactive drawer:  
  `📚 ১৬টি তথ্যসূত্র দেখুন (View Sources) [▼]`
- Retains full Google Search indexing (E-E-A-T score) while delivering a 100% distraction-free reading experience.

### 5. 📋 1-Click Viral Social Post Package
- Automatically curates ready-to-publish social distribution packages:
  - **LinkedIn Post**: Hook, technical bullets, benchmark takeaway, and direct link.
  - **5-Tweet X (Twitter) Thread**: Hook -> Problem space -> Code blueprint -> Benchmarks -> CTA.
- 1-click copy action in both reader view and the dashboard.

### 6. ⏰ GitHub Actions Automated Daily Scheduler
- Daily automated publishing runs via [`.github/workflows/daily-blog.yml`](./.github/workflows/daily-blog.yml) triggering `/api/cron/publish` securely with bearer authorization.

---

## 🎨 Design System & 60-30-10 Color Architecture

- **60% Primary Tone**: Clean, bright content canvas (`bg-slate-50` / `#F8FAFC`).
- **30% Secondary Neutral**: Rich typography & card borders (`text-slate-800` / `#1E293B` and slate dividers).
- **10% Accent High-Voltage Pop**: Electric Lime signature buttons and active elements (`rgb(209, 254, 23)` / `#D1FE17`).
- **Centralized Palette Config**: [`lib/theme/config.ts`](./lib/theme/config.ts).

---

## 🚀 Running Locally

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment variables
cp .env.example .env.local

# 3. Start local development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Quality & Verification Checks
```bash
# Typecheck
pnpm typecheck

# Production build
pnpm build
```

---

## 🔐 Environment Configuration

Create a `.env.local` file with the following variables:

```env
# 1. Google Gemini API (Required for live AI generation)
GEMINI_API_KEY=your_gemini_api_key

# 2. TinyFish API (Required for multi-page web research)
TINYFISH_API_KEY=your_tinyfish_api_key

# 3. Admin & Cron Security Secret
NEXT_PUBLIC_ADMIN_SECRET=onnesha@admin2026
CRON_SECRET=onnesha@admin2026

# 4. Site URL
NEXT_PUBLIC_SITE_URL=https://onneshax.vercel.app
```

---

## 📁 Project Architecture

```
Onnesha/
├── .github/workflows/
│   └── daily-blog.yml          # GitHub Actions daily automated cron publisher
├── app/
│   ├── layout.tsx              # Root layout with single global Footer & Header
│   ├── page.tsx                # Homepage (Hero, Category Filters, Feed)
│   ├── blog/[slug]/
│   │   └── page.tsx            # Single article reader page (SEO optimized)
│   ├── dashboard/
│   │   └── page.tsx            # 2-Tab Admin Dashboard (Manage Drafts & AI Publisher)
│   ├── api/
│   │   ├── articles/route.ts   # Articles store API endpoint
│   │   └── cron/publish/       # Automated publishing pipeline API endpoint
├── components/
│   ├── article-reader.tsx      # Reader with Smart Collapsible Citations & Social Copy
│   ├── header.tsx              # Navigation header capsule
│   ├── footer.tsx              # Editorial footer with brand links
│   └── toast.tsx               # Reactive toast notifications
├── lib/
│   ├── ai/
│   │   ├── researcher.ts       # TinyFish parallel multi-page search engine
│   │   ├── automation-agent.ts # Main autonomous publishing pipeline & quality gate
│   │   ├── critic-agent.ts     # Adversarial Critic & Fact-Verification Agent
│   │   ├── humanizer.ts        # Fast in-memory deterministic Bengali humanizer
│   │   └── social-curator.ts   # 1-Click LinkedIn & X thread synthesizer
│   └── db/
│       └── articles-store.ts   # Neon Cloud Postgres & JSON persistent store
└── data/
    ├── automation-config.json  # Autonomous scheduler configuration
    ├── automation-logs.json    # Execution telemetry logs
    └── published-articles.json # Published articles store
```

---

## 📄 License

MIT © [Redoy Al Hasan](https://github.com/redoy49)

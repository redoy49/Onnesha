# Onnesha :: AI-Powered Personal Editorial & Blogging Platform

A production-ready personal blogging platform built with **Next.js 15 (App Router)**, **TypeScript**, and **Tailwind CSS**, converted from the original single-file publication while preserving 100% of its visual identity, typography, layout, and obsidian + electric lime aesthetic.

---

## 🎨 Centralized Color Palette & Theme Management

**Requirement #4 Fulfillment:** You can change the entire website's color scheme from one centralized location without manually editing individual components.

- **Primary Source of Truth**: [`lib/theme/config.ts`](./lib/theme/config.ts)
- **CSS Variables**: [`app/globals.css`](./app/globals.css)
- **Tailwind Integration**: [`tailwind.config.ts`](./tailwind.config.ts)

To change the primary accent color across the entire website:
1. Open [`lib/theme/config.ts`](./lib/theme/config.ts).
2. Update `themeConfig.primary.DEFAULT` (e.g., from `#D1FE17` to `#00F0FF` for Cyber Cyan, or `#A855F7` for Electric Violet).
3. Update the corresponding glow and gradient values.
4. **Result**: Every button, link, active filter pill, reading progress bar, border glow, text selection, and card highlight updates automatically across the entire site.
5. You can also test and preview preset palettes live in the browser by clicking the `#D1FE17` button in the header capsule!

---

## 🚀 Running & Building Locally

This project uses `pnpm` as its opinionated package manager.

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Type Checking
```bash
pnpm typecheck
```

### 4. Build for Production
```bash
pnpm build
```

### 5. Start Production Server
```bash
pnpm start
```

---

## 🤖 AI-Powered Writing Suite

Onnesha comes with an integrated **AI Editorial Assistant** accessible in both the quick **Write Modal** and the dedicated **`/write` Studio**:

- 💡 **Suggest Titles**: Generates 4 high-converting, modern headlines based on topic or draft.
- 📝 **Auto Summary**: Extracts a punchy teaser excerpt from your story content.
- 📑 **Draft Outline**: Seeds a structured article outline with section headers.
- ✨ **Polish Draft**: Refines tone, clarity, and authoritative phrasing.
- 🏷️ **SEO & Tags**: Generates recommended tags and meta descriptions.

### Modular AI Providers
1. **Zero Setup (Smart Offline Generator)**: Works immediately out-of-the-box without requiring any API keys.
2. **Google Gemini**: Set `GEMINI_API_KEY=your_key` in `.env.local` to enable real-time Gemini 1.5 Flash generation.
3. **OpenAI**: Alternatively, set `OPENAI_API_KEY=your_key` in `.env.local`.
4. **Security**: All AI processing runs server-side in [`app/api/ai/route.ts`](./app/api/ai/route.ts) with Zod validation. API keys are never exposed client-side.

---

## 📁 Project Architecture

```
Onnesha/
├── app/
│   ├── layout.tsx              # Root layout with Outfit font, metadata, Header, Footer
│   ├── page.tsx                # Homepage (Hero, Quick Filters, Posts Feed, Membership)
│   ├── blog/
│   │   └── [slug]/
│   │       └── page.tsx        # Dynamic article reader page with full SEO metadata
│   ├── about/
│   │   └── page.tsx            # Author bio, personal journey, tech stack, contact
│   ├── write/
│   │   └── page.tsx            # Dedicated AI-powered article publishing studio
│   ├── api/
│   │   └── ai/
│   │       └── route.ts        # Secure server-side AI endpoint (Zod validated)
│   ├── globals.css             # Theme CSS variables, ambient mesh gradients, custom scrollbars
│   ├── loading.tsx             # Skeleton loader fallback
│   ├── error.tsx               # Segment-level error boundary
│   ├── not-found.tsx           # Custom 404 page
│   ├── sitemap.ts              # Dynamic sitemap generation
│   └── robots.ts               # Robots file
├── components/
│   ├── header.tsx              # Sticky glass pill navigation capsule
│   ├── hero-banner.tsx         # Featured dispatch banner with author snippet
│   ├── filter-sidebar.tsx      # Quick filters checkboxes, social links, Dispatch Digest card
│   ├── category-pills.tsx      # Category selector buttons & list/grid view toggle
│   ├── article-card.tsx        # Reusable card component (supports list & grid layouts)
│   ├── article-reader.tsx      # Full-bleed reader with progress bar, claps, likes, comments
│   ├── membership-tiers.tsx    # Reader Tier and Creator Tier callout cards
│   ├── write-modal.tsx         # Publish Story modal with embedded AI tools
│   ├── palette-modal.tsx       # Live color palette inspector modal
│   ├── ai-assistant.tsx        # AI writing assistant component (title, excerpt, tone, SEO)
│   ├── toast.tsx               # Reactive toast notifications
│   ├── theme-context.tsx       # Dark/Light mode and theme preset state
│   └── footer.tsx              # Editorial footer with brand links
├── lib/
│   ├── theme/
│   │   └── config.ts           # Centralized color palette configuration
│   ├── data/
│   │   └── articles.ts         # Articles database, authors, categories, tags
│   ├── ai/
│   │   ├── types.ts            # Zod validation schemas for AI actions
│   │   ├── provider.ts         # AI provider interface (Mock/Offline + Gemini/OpenAI)
│   │   └── service.ts          # AI service handler
│   ├── db/
│   │   └── schema.ts           # Drizzle ORM schema definition
│   └── utils.ts                # cn utility, slugify, date and read-time helpers
├── types/
│   ├── article.ts              # Article, Author, Comment, Category interfaces
│   └── theme.ts                # Theme tokens types
├── tailwind.config.ts          # Tailwind theme extended with CSS variable tokens
├── tsconfig.json               # TypeScript strict configuration
└── next.config.ts              # Next.js config with remote image patterns (Unsplash)
```

---

## 🔑 External Integrations & Setup Requirements

1. **AI Generation (Optional)**:
   - To connect live AI models, create a `.env.local` file and add your `GEMINI_API_KEY` or `OPENAI_API_KEY`.
   - Without an API key, the built-in Smart Offline Assistant provides realistic editorial suggestions immediately.
2. **Database Persistence (Optional)**:
   - Articles, bookmarks, likes, claps, and comments are persisted client-side in `localStorage`.
   - For multi-user database persistence, [`lib/db/schema.ts`](./lib/db/schema.ts) provides a complete Drizzle ORM schema ready for PostgreSQL (e.g. Neon, Supabase).
3. **Deployment**:
   - Ready for one-click deployment on **Vercel**.

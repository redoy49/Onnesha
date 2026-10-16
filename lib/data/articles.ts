import { Article, Author } from "@/types/article";

export const defaultAuthor: Author = {
  name: "Elena Rostova",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
  role: "Lead Systems Architect & AI Researcher",
  bio: "Writing about AI-augmented design systems, modern front-end performance, and high-contrast digital interfaces."
};

export const initialArticles: Article[] = [
  {
    id: 1,
    slug: "how-to-stay-cool-while-waiting-for-your-ac-repair",
    title: "How to Stay Cool While Waiting for Your AC Repair",
    category: "UX Design",
    readTime: "6 MIN READ",
    author: "Elena Rostova",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    date: "12 September 2026",
    coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
    excerpt: "A limited Techtime pop up guide on surviving summer heat waves while waiting for HVAC maintenance.",
    body: `
      <div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        When temperatures surge, waiting for HVAC repair technicians can feel like an eternity. Here is our emergency survival guide designed for home comfort and thermal efficiency.
      </div>
      
      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Cross Ventilation and Radiant Heat Blocking</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        Keep all blinds closed on south-facing windows during peak solar hours from 10:00 AM to 4:00 PM. Utilize ceiling fans running counter-clockwise to generate a gentle wind chill effect across living spaces.
      </p>
      
      <blockquote class="border-l-4 border-lime-500 pl-6 italic text-slate-800 my-8 py-4 bg-lime-50/70 rounded-r-2xl font-medium">
        "Optimizing airflow and reducing solar gain can reduce ambient temperature perception significantly."
      </blockquote>
      
      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Hydration and Cooling Pulse Points</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        Apply cool damp cloths to arterial pulse points on wrists, neck, and ankles. Hydrate regularly with electrolyte-enriched fluids to maintain core thermal equilibrium.
      </p>
      
      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Creating a Micro-Climate Refuge</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        Isolate a single room with the best insulation. Seal door gaps with damp towels and use portable fans to circulate cool air from ground-level tiles upward.
      </p>
    `,
    tags: ["UX Design", "Home & Living", "HVAC Maintenance", "Summer Tips"],
    likes: 324,
    claps: 128,
    bookmarked: false,
    featured: true,
    comments: []
  },
  {
    id: 2,
    slug: "prompt-engineering-playbook-production-ready-llm-prompts",
    title: "Prompt Engineering Playbook: Crafting Production Ready LLM Prompts",
    category: "AI & Prompts",
    readTime: "7 MIN READ",
    author: "Dr. Aris Vance",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
    date: "10 September 2026",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1200",
    excerpt: "Learn structural prompt templates, few shot conditioning, and guardrails to optimize LLM outputs for modern software.",
    body: `
      <div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        Systematic prompt engineering is the foundation of dependable AI software. Below are battle-tested strategies and code snippet examples for reliable LLM output parsing.
      </div>
      
      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">1. The System Prompt Architecture</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        To ensure clean JSON responses without markdown syntax wrapping, utilize structured schema constraints in your system prompt:
      </p>
      
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 font-mono text-xs text-lime-300 space-y-2 overflow-x-auto shadow-md">
        <div class="text-slate-400 font-bold">// SYSTEM PROMPT TEMPLATE</div>
        <pre class="text-slate-100"><code>You are Onnesha AI Assistant. Always respond ONLY in valid JSON matching this schema:
{
  "status": "success",
  "summary": string,
  "actionable_steps": string[]
}
Do not include markdown code wrapping or extra narrative.</code></pre>
      </div>

      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Async Structured Generation Implementation</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        Enforce structural guardrails using standard schema enforcement libraries alongside your completion pipeline.
      </p>
    `,
    tags: ["AI & Prompts", "LLM", "Python", "GPT", "Prompt Engineering"],
    likes: 512,
    claps: 340,
    bookmarked: true,
    comments: []
  },
  {
    id: 3,
    slug: "mastering-modern-typescript-clean-code-advanced-generics",
    title: "Mastering Modern TypeScript: Clean Code & Advanced Generics",
    category: "Coding & Tech",
    readTime: "8 MIN READ",
    author: "Lucas Croft",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    date: "8 September 2026",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
    excerpt: "Explore TypeScript utility types, type narrowing, and resilient API data fetching patterns for production web applications.",
    body: `
      <div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        TypeScript type safety guarantees runtime safety and developer velocity. Here is how to write clean generic handlers for API responses.
      </div>
      <h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">Generic Async Wrapper</h3>
      <p class="text-slate-700 text-base sm:text-lg leading-relaxed mb-4">
        Always return predictable payload objects wrapping data and error parameters for clean frontend error handling.
      </p>
    `,
    tags: ["Coding & Tech", "TypeScript", "Web Dev", "Software Architecture"],
    likes: 289,
    claps: 95,
    bookmarked: false,
    comments: []
  },
  {
    id: 4,
    slug: "staying-cool-during-blackouts-lifesaving-protocol",
    title: "Staying Cool During Blackouts: The Lifesaving Protocol",
    category: "Web Development",
    readTime: "4 MIN READ",
    author: "Devon Vance",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200",
    date: "5 September 2026",
    coverImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800",
    excerpt: "Essential steps to maintain safe indoor conditions during severe grid blackouts and power failures.",
    body: `
      <div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        Grid reliability issues require active home management strategies during hot seasonal peaks. Establish battery powered airflow units early and isolate shaded interior spaces.
      </div>
    `,
    tags: ["Web Development", "Safety", "Infrastructure"],
    likes: 142,
    claps: 42,
    bookmarked: false,
    comments: []
  },
  {
    id: 5,
    slug: "esther-howard-designing-high-contrast-neon-dashboards",
    title: "Esther Howard on Designing High Contrast Neon Dashboards",
    category: "UX Design",
    readTime: "7 MIN READ",
    author: "Esther Howard",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200",
    date: "2 September 2026",
    coverImage: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800",
    excerpt: "Mastering electric lime (#D1FE17) typography contrast ratios on deep obsidian surfaces.",
    body: `
      <div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
        High contrast digital UI requires balance between bright neon focal points and deep obsidian surfaces. Use subtle glows and soft glassmorphism borders to reduce optic fatigue.
      </div>
    `,
    tags: ["UX Design", "Design System", "Color Theory", "Accessibility"],
    likes: 415,
    claps: 210,
    bookmarked: false,
    comments: []
  }
];

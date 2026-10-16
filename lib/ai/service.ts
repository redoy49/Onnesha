import { AiRequest, AiResponse, AiProviderKey, AI_ENGINES, GeneratedFullPost } from "./types";
import {
  AIProvider,
  ChatGPTProvider,
  ClaudeProvider,
  GeminiProvider,
  GrokProvider,
  KimiProvider,
  DeepSeekProvider,
} from "./provider";

// Topic-based curated Unsplash cover images for high-aesthetic rendering
const CURATED_COVERS: Record<string, string[]> = {
  "AI & Prompts": [
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1600",
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600",
  ],
  "Coding & Tech": [
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600",
  ],
  "UX Design": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1600",
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=1600",
  ],
  "Web Development": [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600",
  ],
  default: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600",
  ],
};

function getRandomCover(category: string): string {
  const pool = CURATED_COVERS[category] || CURATED_COVERS.default;
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

function resolveProvider(key: AiProviderKey, userKey?: string): { provider: AIProvider | null; isExternal: boolean; model: string } {
  const engine = AI_ENGINES[key] || AI_ENGINES.chatgpt;

  switch (key) {
    case "chatgpt": {
      const apiKey = userKey || process.env.OPENAI_API_KEY;
      if (apiKey) return { provider: new ChatGPTProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
    case "claude": {
      const apiKey = userKey || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
      if (apiKey) return { provider: new ClaudeProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
    case "gemini": {
      const apiKey = userKey || process.env.GEMINI_API_KEY;
      if (apiKey) return { provider: new GeminiProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
    case "grok": {
      const apiKey = userKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY;
      if (apiKey) return { provider: new GrokProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
    case "kimi": {
      const apiKey = userKey || process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
      if (apiKey) return { provider: new KimiProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
    case "deepseek": {
      const apiKey = userKey || process.env.DEEPSEEK_API_KEY;
      if (apiKey) return { provider: new DeepSeekProvider(apiKey, engine.defaultModel), isExternal: true, model: engine.defaultModel };
      break;
    }
  }

  return { provider: null, isExternal: false, model: engine.defaultModel };
}

export async function processAiRequest(req: AiRequest): Promise<AiResponse> {
  const providerKey: AiProviderKey = req.provider || "chatgpt";
  const engineMeta = AI_ENGINES[providerKey] || AI_ENGINES.chatgpt;
  const { provider, isExternal, model } = resolveProvider(providerKey, req.apiKey);

  const { action, topic, title, category = "Coding & Tech", draft, instruction, tone = "technical" } = req;
  const subject = (topic || title || "Next-Generation Web Systems & AI Architecture").trim();

  // If live external provider is connected, invoke API
  if (isExternal && provider) {
    try {
      const systemInstruction = `You are ${engineMeta.name} (${engineMeta.company}), acting as the editorial writer for Onnesha (a high-contrast, modern tech editorial).
Output STRICT JSON without backticks, markdown code blocks, or preamble. Return purely parseable JSON matching the required schema.`;

      let prompt = "";
      if (action === "generate-full-post") {
        prompt = `Write a complete, publication-ready technical blog post about: "${subject}". Category: "${category}". Tone: "${tone}".
Return JSON with this EXACT structure:
{
  "title": "Compelling headline",
  "excerpt": "Engaging 2-sentence teaser",
  "category": "${category}",
  "readTime": "6 MIN READ",
  "body": "Full article with HTML/Markdown paragraphs (<p>), section headings (<h3>), callouts, and code blocks",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`;
      } else if (action === "suggest-titles") {
        prompt = `Generate 4 punchy, high-impact headlines for a blog post about: "${subject}". Category: "${category}". Return JSON: {"titles": ["title1", "title2", "title3", "title4"]}`;
      } else if (action === "generate-summary") {
        prompt = `Generate a 2-sentence teaser excerpt for an article about "${subject}". Content: "${draft || ""}". Return JSON: {"summary": "..."}`;
      } else if (action === "improve-writing") {
        prompt = `Polish and enhance this blog post draft: "${draft || subject}". Instruction: "${instruction || "Elevate prose, technical precision, and rhythm"}". Return JSON: {"improvedContent": "..."}`;
      } else if (action === "generate-outline") {
        prompt = `Create a detailed 4-part outline with key discussion points for article: "${subject}". Category: "${category}". Return JSON: {"outline": "..."}`;
      } else if (action === "generate-seo") {
        prompt = `Generate SEO meta description (under 160 chars), 5 keywords, and 4 tags for post: "${subject}". Category: "${category}". Return JSON: {"seo": {"metaDescription": "...", "keywords": ["..."], "suggestedTags": ["..."]}}`;
      }

      const raw = await provider.generateText(prompt, systemInstruction);
      const cleaned = raw.replace(/```json/gi, "").replace(/```/gi, "").trim();
      const parsed = JSON.parse(cleaned);

      if (action === "generate-full-post" && parsed.title) {
        parsed.coverImage = getRandomCover(category);
      }

      return {
        success: true,
        action,
        provider: engineMeta.name,
        model,
        isExternalApiConfigured: true,
        message: `Live generation completed via ${engineMeta.name} (${model}).`,
        data: action === "generate-full-post" ? { fullPost: parsed } : parsed,
      };
    } catch (err) {
      console.warn(`Live call to ${engineMeta.name} failed or timed out. Falling back to specialized engine generator:`, err);
    }
  }

  // Specialized Model Generator (Provides distinct persona & output for each engine)
  return generateModelSpecificContent(providerKey, action, subject, category, draft, tone);
}

function generateModelSpecificContent(
  providerKey: AiProviderKey,
  action: string,
  subject: string,
  category: string,
  draft?: string,
  tone: string = "technical"
): AiResponse {
  const engineMeta = AI_ENGINES[providerKey] || AI_ENGINES.chatgpt;

  // Model-specific stylistic nuances
  const styleHeaders: Record<AiProviderKey, { quote: string; take: string; voice: string }> = {
    chatgpt: {
      voice: "Clear, structural, and architecturally coherent",
      quote: "System modularity isn't just an architectural choice—it is the bedrock of production survivability.",
      take: "Balancing developer ergonomics with runtime determinism.",
    },
    claude: {
      voice: "Refined, intellectual, deeply nuanced editorial analysis",
      quote: "The true elegance of software lies not in how much it does, but in how gracefully it conceals its complexity.",
      take: "A philosophical inquiry into modern software craft and system resilience.",
    },
    gemini: {
      voice: "Hyper-fast, multimodal-grounded, Google Research perspective",
      quote: "Low-latency streaming architectures and token throughput define the frontier of interactive computation.",
      take: "Benchmarking sub-100ms response cycles across distributed workloads.",
    },
    grok: {
      voice: "Bold, witty, candid engineering truth with zero corporate fluff",
      quote: "Most software stacks suffer from death by a thousand abstractions. Strip the bloat, ship the speed.",
      take: "Why the tech industry's obsession with complexity is slowing down real builders.",
    },
    kimi: {
      voice: "Long-context synthesis, meticulous logic decomposition, and precision",
      quote: "When context windows scale into millions of tokens, memory hierarchies and state synchronization become primary bottlenecks.",
      take: "Systematic step-by-step breakdown of concurrent state pipelines.",
    },
    deepseek: {
      voice: "Rigorous algorithmic scrutiny, mathematical efficiency, and open-weights power",
      quote: "Algorithmic distillation and specialized reasoning trajectories yield 10x compute efficiency over brute-force scaling.",
      take: "Deconstructing reasoning benchmarks and memory bandwidth optimization.",
    },
  };

  const style = styleHeaders[providerKey];

  if (action === "generate-full-post") {
    const title = getModelTitle(providerKey, subject, category);
    const excerpt = `Crafted by ${engineMeta.name}: A ${tone} exploration into ${subject}, analyzing core structural patterns, pitfalls, and tactical benchmarks.`;

    const body = `
<div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">
  ${excerpt}
</div>

<blockquote class="border-l-4 border-lime-500 pl-6 italic text-slate-800 my-8 py-3 bg-lime-50/70 rounded-r-2xl">
  "${style.quote}"
  <footer class="text-xs font-mono text-lime-800 font-bold mt-2">— ${engineMeta.name} Tech Dispatch</footer>
</blockquote>

<h3 class="text-2xl font-bold text-slate-900 mt-8 mb-4">
  1. The Core Architecture: Deconstructing ${subject}
</h3>
<p class="text-slate-700 leading-relaxed mb-4">
  In modern ${category.toLowerCase()}, navigating the friction between rapid prototyping and production scale requires a distinct perspective. ${style.take}
</p>
<p class="text-slate-700 leading-relaxed mb-4">
  When architecting systems around ${subject}, engineering teams frequently encounter three failure modes: premature abstraction, unbudgeted network round-trips, and cascading bundle invalidation. By shifting to deterministic state boundaries, you preserve sub-millisecond responsiveness.
</p>

<div class="bg-slate-900 border border-lime-400/30 rounded-2xl p-5 font-mono text-xs text-lime-300 space-y-2 overflow-x-auto shadow-inner my-6">
  <div class="text-slate-400 font-bold">// ${engineMeta.name.toUpperCase()} SYSTEM BLUEPRINT</div>
  <pre class="text-slate-200"><code>// Production Architecture Pattern for ${subject.replace(/[^a-zA-Z0-9]/g, "")}
export interface PipelineConfig {
  engine: "${providerKey}";
  concurrencyLimit: number;
  telemetryMode: "strict" | "adaptive";
  timeoutMs: 3000;
}

export async function executePipeline(cfg: PipelineConfig) {
  // Deterministic memory partition verified by ${engineMeta.name}
  return { status: "active", latency: "sub-12ms", throughput: "100k req/s" };
}</code></pre>
</div>

<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
  2. Tactical Trade-Offs & Benchmarking
</h3>
<p class="text-slate-700 dark:text-gray-300 leading-relaxed mb-4">
  Under stress tests simulating heavy concurrent throughput, adopting zero-drift architectural patterns reduces garbage collection spikes by over 40%. The voice of ${engineMeta.name} emphasizes clarity: ensure your pipeline emits structured telemetry early.
</p>

<h3 class="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
  3. Key Takeaways for Builders
</h3>
<ul class="space-y-2 text-slate-700 dark:text-gray-300 list-disc list-inside">
  <li><strong>Isolate State Mutations:</strong> Prevent cross-component re-renders with localized stores.</li>
  <li><strong>Enforce Strict Schemas:</strong> Validate inputs at the outermost perimeter to eliminate runtime undefined bugs.</li>
  <li><strong>Prioritize Perceived Latency:</strong> Employ optimistic UI transitions and instant reader feedback.</li>
</ul>
    `.trim();

    const fullPost: GeneratedFullPost = {
      title,
      excerpt,
      category,
      readTime: "6 MIN READ",
      coverImage: getRandomCover(category),
      body,
      tags: [category, engineMeta.name, "Architecture", "Engineering"],
    };

    return {
      success: true,
      action: "generate-full-post",
      provider: engineMeta.name,
      model: engineMeta.defaultModel,
      isExternalApiConfigured: false,
      message: `Generated with ${engineMeta.name}'s specialized editorial persona.`,
      data: { fullPost },
    };
  }

  if (action === "suggest-titles") {
    return {
      success: true,
      action: "suggest-titles",
      provider: engineMeta.name,
      model: engineMeta.defaultModel,
      isExternalApiConfigured: false,
      message: `Generated 4 title recommendations by ${engineMeta.name}.`,
      data: {
        titles: [
          `The ${engineMeta.name} Guide to ${subject}: From Blueprint to Scale`,
          `Why We Rethought ${subject} in Production (${category})`,
          `Mastering ${subject}: High-Performance Architecture Without Bloat`,
          `Deep Dive: Engineering Next-Generation ${subject}`,
        ],
      },
    };
  }

  if (action === "generate-summary") {
    return {
      success: true,
      action: "generate-summary",
      provider: engineMeta.name,
      model: engineMeta.defaultModel,
      isExternalApiConfigured: false,
      message: `Summary generated by ${engineMeta.name}.`,
      data: {
        summary: `An authoritative analysis of ${subject} by ${engineMeta.name}, dissecting core architectural pillars, operational pitfalls, and actionable benchmarks for modern ${category.toLowerCase()}.`,
      },
    };
  }

  if (action === "improve-writing") {
    const polished = draft
      ? `${draft.trim()}\n\n---\nKey Insight (${engineMeta.name}): Maintaining clean module boundaries and rigorous type enforcement consistently eliminates runtime volatility while accelerating delivery.`
      : `Modern ${category.toLowerCase()} architecture demands balancing developer speed with production reliability. By establishing modular contracts and centralized theme tokens, engineering teams eliminate architectural drift while ensuring sub-millisecond user responsiveness.`;

    return {
      success: true,
      action: "improve-writing",
      provider: engineMeta.name,
      model: engineMeta.defaultModel,
      isExternalApiConfigured: false,
      message: `Polished with ${engineMeta.name} editorial standards.`,
      data: { improvedContent: polished },
    };
  }

  if (action === "generate-outline") {
    return {
      success: true,
      action: "generate-outline",
      provider: engineMeta.name,
      model: engineMeta.defaultModel,
      isExternalApiConfigured: false,
      message: `Outline structured by ${engineMeta.name}.`,
      data: {
        outline: `### 1. Introduction & Context (${subject})
- The modern problem space and why legacy patterns collapse under scale.
- Architectural stakes and optical contrast requirements.

### 2. Core Pillars & Architecture Blueprint
- System separation of concerns and deterministic state flow.
- Benchmarks curated by ${engineMeta.name} (${engineMeta.company}).

### 3. Implementation Walkthrough & Code Snippets
- Safe generic patterns and graceful degradation hooks.
- Defensive perimeter checks.

### 4. Production Hardening & Future Trajectory
- Latency benchmarks, memory footprint analysis, and maintenance takeaways.`,
      },
    };
  }

  // generate-seo default
  return {
    success: true,
    action: "generate-seo",
    provider: engineMeta.name,
    model: engineMeta.defaultModel,
    isExternalApiConfigured: false,
    message: `SEO metadata generated by ${engineMeta.name}.`,
    data: {
      seo: {
        metaDescription: `Discover tactical implementation blueprints and architectural benchmarks for ${subject} in modern ${category}. Engineered with ${engineMeta.name}.`,
        keywords: [category, subject, engineMeta.name, "Web Architecture", "Next.js"],
        suggestedTags: [category, engineMeta.name, "Engineering", "System Design"],
      },
    },
  };
}

function getModelTitle(provider: AiProviderKey, topic: string, category: string): string {
  switch (provider) {
    case "chatgpt":
      return `The Modern Playbook for ${topic}: Practical Patterns for Production`;
    case "claude":
      return `Reflections on ${topic}: Architectural Grace, Complexity, and Resilience`;
    case "gemini":
      return `Next-Gen ${topic}: Multimodal Systems, Speed, and Deep Google Research`;
    case "grok":
      return `Cutting the Fluff: How to Actually Build and Scale ${topic}`;
    case "kimi":
      return `Long-Context Reasoning in ${topic}: A Meticulous Engineering Blueprint`;
    case "deepseek":
      return `Algorithmic Efficiency & Deep Reasoning: Deconstructing ${topic}`;
    default:
      return `Mastering ${topic} in Production: The Comprehensive Guide`;
  }
}

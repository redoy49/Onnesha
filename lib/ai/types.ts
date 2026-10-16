import { z } from "zod";

export const AiProviderKeySchema = z.enum([
  "chatgpt",
  "claude",
  "gemini",
  "grok",
  "kimi",
  "deepseek",
]);

export type AiProviderKey = z.infer<typeof AiProviderKeySchema>;

export const AiActionSchema = z.enum([
  "generate-full-post",
  "suggest-titles",
  "generate-summary",
  "improve-writing",
  "generate-seo",
  "generate-outline",
]);

export type AiAction = z.infer<typeof AiActionSchema>;

export const AiRequestSchema = z.object({
  action: AiActionSchema,
  provider: AiProviderKeySchema.optional().default("chatgpt"),
  topic: z.string().optional(),
  title: z.string().optional(),
  category: z.string().optional(),
  draft: z.string().optional(),
  instruction: z.string().optional(),
  tone: z.string().optional(),
  apiKey: z.string().optional(),
});

export type AiRequest = z.infer<typeof AiRequestSchema>;

export interface GeneratedFullPost {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  coverImage: string;
  body: string;
  tags: string[];
}

export interface AiResponse {
  success: boolean;
  action: AiAction;
  provider: string;
  model: string;
  isExternalApiConfigured: boolean;
  message?: string;
  data: {
    titles?: string[];
    summary?: string;
    improvedContent?: string;
    seo?: {
      metaDescription: string;
      keywords: string[];
      suggestedTags: string[];
    };
    outline?: string;
    fullPost?: GeneratedFullPost;
  };
}

export interface AiEngineMeta {
  key: AiProviderKey;
  name: string;
  company: string;
  defaultModel: string;
  description: string;
  badgeColor: string;
  accent: string;
  envKey: string;
}

export const AI_ENGINES: Record<AiProviderKey, AiEngineMeta> = {
  chatgpt: {
    key: "chatgpt",
    name: "ChatGPT",
    company: "OpenAI",
    defaultModel: "gpt-4o",
    description: "Industry-standard structured prose, narrative coherence, and clean technical clarity.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    accent: "#10A37F",
    envKey: "OPENAI_API_KEY",
  },
  claude: {
    key: "claude",
    name: "Claude",
    company: "Anthropic",
    defaultModel: "claude-3-5-sonnet",
    description: "Deep intellectual nuance, refined editorial cadence, and eloquent prose architecture.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    accent: "#D97706",
    envKey: "ANTHROPIC_API_KEY",
  },
  gemini: {
    key: "gemini",
    name: "Gemini",
    company: "Google",
    defaultModel: "gemini-1.5-flash",
    description: "High-speed multimodal reasoning, cutting-edge code synthesis, and deep research context.",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    accent: "#3B82F6",
    envKey: "GEMINI_API_KEY",
  },
  grok: {
    key: "grok",
    name: "Grok",
    company: "xAI",
    defaultModel: "grok-2-1212",
    description: "Bold, punchy, unfiltered modern tech perspective with direct engineering insights.",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    accent: "#8B5CF6",
    envKey: "GROK_API_KEY",
  },
  kimi: {
    key: "kimi",
    name: "Kimi",
    company: "Moonshot AI",
    defaultModel: "moonshot-v1-8k",
    description: "Exceptional long-context reasoning, meticulous logic structuring, and comprehensive technical depth.",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    accent: "#06B6D4",
    envKey: "KIMI_API_KEY",
  },
  deepseek: {
    key: "deepseek",
    name: "DeepSeek",
    company: "DeepSeek AI",
    defaultModel: "deepseek-chat",
    description: "Elite algorithmic reasoning, mathematical precision, code architecture, and open weights prowess.",
    badgeColor: "bg-lime-100 text-lime-900 border-lime-300",
    accent: "#84CC16",
    envKey: "DEEPSEEK_API_KEY",
  },
};

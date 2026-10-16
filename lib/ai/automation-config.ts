import fs from "fs";
import path from "path";
import { AiProviderKey } from "./types";

export interface AutomationConfig {
  enabled: boolean;
  scheduleTime: string; // e.g. "09:00"
  timezone: string; // e.g. "UTC"
  language: "bn" | "en"; // "bn" = বাংলা (Bangla), "en" = English
  niche: string;
  targetKeywords: string[];
  preferredEngine: AiProviderKey;
  researchProvider: "gemini-grounding" | "tavily" | "smart-offline";
  targetWordCount: number; // default 1200
  autoPublish: boolean; // true = publish live, false = save as draft
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  topic: string;
  slug?: string;
  status: "published" | "draft" | "failed";
  engine: string;
  wordCount: number;
  sourcesCount: number;
  sources: { title: string; url: string }[];
  executionTimeMs: number;
  error?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "automation-config.json");
const LOGS_FILE = path.join(DATA_DIR, "automation-logs.json");

const DEFAULT_CONFIG: AutomationConfig = {
  enabled: true,
  scheduleTime: "06:00",
  timezone: "Asia/Dhaka",
  language: "bn",
  niche: "Next-Gen Web Architecture, AI Engineering, Fullstack Performance, High-Contrast UI",
  targetKeywords: [
    "Next.js 15",
    "সার্ভার অ্যাকশন (Server Actions)",
    "AI Agent Workflows",
    "ওয়েব পারফরম্যান্স (Web Performance)",
    "TypeScript",
    "ডিস্ট্রিবিউটেড সিস্টেম (Distributed Systems)",
  ],
  preferredEngine: "gemini",
  researchProvider: "gemini-grounding",
  targetWordCount: 1200,
  autoPublish: true,
};

// In-memory fallbacks
let memoryConfig: AutomationConfig = { ...DEFAULT_CONFIG };
let memoryLogs: AutomationLog[] = [];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create data directory for automation:", err);
  }
}

export async function getAutomationConfig(): Promise<AutomationConfig> {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed = JSON.parse(content);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (err) {
    console.warn("Error reading automation-config.json:", err);
  }
  return memoryConfig;
}

export async function updateAutomationConfig(
  partial: Partial<AutomationConfig>
): Promise<AutomationConfig> {
  const current = await getAutomationConfig();
  const updated: AutomationConfig = { ...current, ...partial };
  memoryConfig = updated;

  try {
    ensureDataDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.warn("Error writing automation-config.json:", err);
  }

  return updated;
}

export async function getAutomationLogs(limit = 20): Promise<AutomationLog[]> {
  try {
    ensureDataDir();
    if (fs.existsSync(LOGS_FILE)) {
      const content = fs.readFileSync(LOGS_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, limit);
      }
    }
  } catch (err) {
    console.warn("Error reading automation-logs.json:", err);
  }
  return memoryLogs.slice(0, limit);
}

export async function appendAutomationLog(log: AutomationLog): Promise<void> {
  const currentLogs = await getAutomationLogs(100);
  currentLogs.unshift(log);
  memoryLogs = currentLogs;

  try {
    ensureDataDir();
    fs.writeFileSync(LOGS_FILE, JSON.stringify(currentLogs, null, 2), "utf-8");
  } catch (err) {
    console.warn("Error writing automation-logs.json:", err);
  }
}

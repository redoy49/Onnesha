"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaWandMagicSparkles,
  FaBolt,
  FaArrowLeft,
  FaPaperPlane,
  FaLock,
  FaSpinner,
  FaStar,
  FaRegStar,
  FaTrash,
  FaEye,
  FaArrowRotateRight,
  FaRobot,
  FaTags,
  FaLightbulb,
  FaListCheck,
  FaAlignLeft,
  FaKey,
  FaCheck,
  FaShieldHalved,
  FaRightFromBracket,
  FaClock,
  FaGlobe,
  FaGear,
  FaPlay,
  FaPause,
  FaCircleCheck,
  FaCircleExclamation,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { Header } from "@/components/header";
import { AI_ENGINES, AiProviderKey, AiResponse } from "@/lib/ai/types";
import { AutomationConfig, AutomationLog } from "@/lib/ai/automation-config";
import { Article } from "@/types/article";
import { initialArticles } from "@/lib/data/articles";
import { slugify, getFormattedToday, calculateReadingTime } from "@/lib/utils";
import { NextPostCountdown } from "@/components/next-post-countdown";

type ActiveTab = "studio" | "articles" | "engines" | "automation";

const SAMPLE_TOPICS = [
  "Next.js 15 Partial Prerendering & React 19",
  "Zero-Bundle High-Contrast Design Systems",
  "DeepSeek R1 Reasoning Benchmarks vs GPT-4o",
  "WebAssembly & GPU Compute on Modern Browsers",
  "Building Autonomous Multi-Agent Workflows",
  "Optic Fatigue and Electric Lime Color Science",
];

const CURATED_SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600",
  "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1600",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600",
  "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1600",
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, role, loginAsAdmin, logout, adminToken } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("studio");
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [articleFilter, setArticleFilter] = useState<"all" | "published" | "draft">("all");
  const [isPublishingDraftId, setIsPublishingDraftId] = useState<number | string | null>(null);

  // Automation Agent States
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [automationRunStatus, setAutomationRunStatus] = useState("");
  const [automationProgressStep, setAutomationProgressStep] = useState<number>(0); // 0=idle, 1=research, 2=analysis, 3=writing, 4=quality, 5=ready
  const [automationElapsedSec, setAutomationElapsedSec] = useState<number>(0);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [customTestTopic, setCustomTestTopic] = useState("How to Create Motion Graphics Videos Using Claude Code");
  const [testAsDraft, setTestAsDraft] = useState(true);

  // AI Generator Form States
  const [selectedEngine, setSelectedEngine] = useState<AiProviderKey>("chatgpt");
  const [promptTopic, setPromptTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("AI & Prompts");
  const [selectedTone, setSelectedTone] = useState("Technical & In-depth");
  const [customApiKey, setCustomApiKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiEngineStatusMsg, setAiEngineStatusMsg] = useState("");

  // Blog Post Editor States
  const [postTitle, setPostTitle] = useState("");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postCoverImage, setPostCoverImage] = useState(CURATED_SAMPLE_IMAGES[0]);
  const [postBody, setPostBody] = useState("");
  const [postReadTime, setPostReadTime] = useState("6 MIN READ");
  const [postTags, setPostTags] = useState("AI & Prompts, Architecture, Next.js");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  // Admin login password field if not authenticated
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Load articles from server /api/articles with localStorage fallback
  const loadArticles = async () => {
    try {
      const res = await fetch("/api/articles");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.articles)) {
          setArticles(data.articles);
          localStorage.setItem("onnesha-articles", JSON.stringify(data.articles));
          return;
        }
      }
    } catch (err) {
      console.warn("Could not fetch /api/articles:", err);
    }

    const saved = localStorage.getItem("onnesha-articles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        }
      } catch (e) {
        console.error("Failed to load articles:", e);
      }
    }
  };

  // Load automation configuration and activity logs
  const loadAutomationData = async () => {
    try {
      const res = await fetch("/api/cron/config");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAutomationConfig(data.config);
          setAutomationLogs(data.logs || []);
        }
      }
    } catch (err) {
      console.warn("Could not load automation data:", err);
    }
  };

  useEffect(() => {
    loadArticles();
    loadAutomationData();
  }, []);

  // Track elapsed seconds while automation pipeline is executing
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunningAutomation) {
      setAutomationElapsedSec(0);
      interval = setInterval(() => {
        setAutomationElapsedSec((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunningAutomation]);

  const saveArticles = (updated: Article[]) => {
    setArticles(updated);
    localStorage.setItem("onnesha-articles", JSON.stringify(updated));
  };

  // Run Automation Pipeline on demand from Dashboard (with customTopic & forceDraft options)
  const handleRunAutomationNow = async (options?: { customTopic?: string; forceDraft?: boolean }) => {
    setIsRunningAutomation(true);
    setAutomationProgressStep(1);
    setAutomationRunStatus("Step 1/5: Researching live technical sources & verifying claims...");

    const t2 = setTimeout(() => {
      setAutomationProgressStep(2);
      setAutomationRunStatus("Step 2/5: Analyzing source facts & synthesizing structured outline...");
    }, 4000);

    const t3 = setTimeout(() => {
      setAutomationProgressStep(3);
      setAutomationRunStatus("Step 3/5: Writing comprehensive ~1,200-word Bangla deep-dive with code & tables...");
    }, 8000);

    const t4 = setTimeout(() => {
      setAutomationProgressStep(4);
      setAutomationRunStatus("Step 4/5: Running quality verification, anti-hallucination & SEO audit...");
    }, 14000);

    try {
      const res = await fetch("/api/cron/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({
          customTopic: options?.customTopic?.trim() || undefined,
          forceDraft: options?.forceDraft ?? false,
        }),
      });

      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);

      if (res.status === 429) {
        setAutomationProgressStep(0);
        showToast("⚠️ Pipeline is already executing! Please wait for it to complete.");
        setAutomationRunStatus("⚠️ Pipeline is currently executing in background.");
        return;
      }

      const data = await res.json();
      if (data.success && data.article) {
        setAutomationProgressStep(5);
        const isDraft = data.article.status === "draft";
        showToast(
          isDraft
            ? `📝 Draft Created: "${data.article.title}" (~${data.wordCount} words). Review in Manage Posts!`
            : `🎉 Published Live: "${data.article.title}" (~${data.wordCount} words)`
        );
        setAutomationRunStatus(
          isDraft
            ? `✅ Step 5/5: Saved as Draft! Review in "Manage Posts" tab to publish live.`
            : `✅ Step 5/5: Live on Public Feed! (${data.sourcesCount} citations)`
        );
        await loadArticles();
        await loadAutomationData();
      } else {
        setAutomationProgressStep(0);
        showToast(data.error || "Completed with draft/warning status.");
        setAutomationRunStatus(`Status: ${data.status || data.error || "Check logs"}`);
        await loadAutomationData();
      }
    } catch (err) {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      setAutomationProgressStep(0);
      console.error(err);
      showToast("Failed to run automation pipeline");
      setAutomationRunStatus("Failed to execute pipeline.");
    } finally {
      setIsRunningAutomation(false);
    }
  };

  // Toggle Automation Scheduler (Active / Paused)
  const handleToggleScheduler = async () => {
    if (!automationConfig) return;
    const nextState = !automationConfig.enabled;
    const updated = { ...automationConfig, enabled: nextState };
    setAutomationConfig(updated);
    try {
      const res = await fetch("/api/cron/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setAutomationConfig(data.config);
        showToast(nextState ? "▶️ Daily automation scheduler enabled!" : "⏸️ Automation scheduler paused.");
      } else {
        showToast(data.error || "Failed to update scheduler state.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error toggling scheduler.");
    }
  };

  // Promote a draft article to live published
  const handlePublishDraft = async (id: number | string) => {
    setIsPublishingDraftId(id);
    try {
      const res = await fetch("/api/articles/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success && data.article) {
        showToast(`🎉 "${data.article.title}" is now published live!`);
        await loadArticles();
        await loadAutomationData();
      } else {
        showToast(data.error || "Failed to publish draft");
      }
    } catch (err) {
      console.error(err);
      showToast("Network error publishing draft.");
    } finally {
      setIsPublishingDraftId(null);
    }
  };

  // Save updated automation configuration
  const handleSaveAutomationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!automationConfig) return;
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/cron/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {}),
        },
        body: JSON.stringify(automationConfig),
      });
      const data = await res.json();
      if (data.success) {
        setAutomationConfig(data.config);
        showToast("✅ Automation settings saved successfully!");
      } else {
        showToast("Failed to save automation settings.");
      }
    } catch (err) {
      console.error(err);
      showToast("Error updating automation settings.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleAdminAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const ok = loginAsAdmin(authPasswordInput);
    if (!ok) {
      setAuthError("Invalid admin secret key. Access denied.");
    }
  };

  // Run AI Generation with chosen model
  const handleGenerateFullPost = async () => {
    if (!promptTopic.trim()) {
      showToast("Please enter a topic or select one of the suggested topics.");
      return;
    }

    setIsGenerating(true);
    setAiEngineStatusMsg(`Synthesizing blog with ${AI_ENGINES[selectedEngine].name}...`);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-full-post",
          provider: selectedEngine,
          topic: promptTopic.trim(),
          category: selectedCategory,
          tone: selectedTone,
          apiKey: customApiKey.trim() || undefined,
        }),
      });

      const data: AiResponse = await res.json();
      if (!data.success || !data.data?.fullPost) {
        showToast(data.message || "Failed to generate blog post.");
        return;
      }

      const generated = data.data.fullPost;
      setPostTitle(generated.title);
      setPostExcerpt(generated.excerpt);
      setSelectedCategory(generated.category);
      setPostReadTime(generated.readTime);
      setPostCoverImage(generated.coverImage);
      setPostBody(generated.body);
      setPostTags(generated.tags.join(", "));

      setAiEngineStatusMsg(`✓ Successfully drafted via ${data.provider} (${data.model})`);
      showToast(`Draft generated using ${data.provider}! Ready to preview & publish.`);
    } catch (err) {
      console.error(err);
      showToast("AI generation failed. Check network or try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Auxiliary AI Tools
  const handleRunAiHelper = async (action: "suggest-titles" | "generate-outline" | "improve-writing" | "generate-seo") => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          provider: selectedEngine,
          topic: promptTopic.trim() || postTitle,
          category: selectedCategory,
          draft: postBody,
          apiKey: customApiKey.trim() || undefined,
        }),
      });

      const data: AiResponse = await res.json();
      if (!data.success) {
        showToast(data.message || "Action failed");
        return;
      }

      if (action === "suggest-titles" && data.data?.titles) {
        setPostTitle(data.data.titles[0]);
        showToast("Title applied from " + data.provider);
      } else if (action === "generate-outline" && data.data?.outline) {
        setPostBody((prev) => (prev ? `${prev}\n\n${data.data.outline}` : data.data.outline!));
        showToast("Outline added to body!");
      } else if (action === "improve-writing" && data.data?.improvedContent) {
        setPostBody(data.data.improvedContent);
        showToast("Content polished!");
      } else if (action === "generate-seo" && data.data?.seo) {
        setPostTags(data.data.seo.suggestedTags.join(", "));
        if (!postExcerpt && data.data.seo.metaDescription) {
          setPostExcerpt(data.data.seo.metaDescription);
        }
        showToast("SEO tags generated!");
      }
    } catch (e) {
      console.error(e);
      showToast("Helper action failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Publish Blog Post directly to live feed
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!postTitle.trim() || !postExcerpt.trim() || !postBody.trim()) {
      showToast("Please ensure Title, Excerpt, and Body are completed.");
      return;
    }

    const parsedTags = postTags
      ? postTags.split(",").map((t) => t.trim()).filter(Boolean)
      : [selectedCategory];

    const slug = slugify(postTitle) || `dispatch-${Date.now()}`;

    const newArticle: Article = {
      id: Date.now(),
      slug,
      title: postTitle.trim(),
      category: selectedCategory as any,
      readTime: postReadTime.trim() || calculateReadingTime(postBody),
      author: "Elena Rostova (Admin)",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      date: getFormattedToday(),
      coverImage: postCoverImage.trim() || CURATED_SAMPLE_IMAGES[0],
      excerpt: postExcerpt.trim(),
      body: postBody,
      tags: parsedTags,
      likes: 12,
      claps: 5,
      bookmarked: false,
      featured: false,
      comments: [],
    };

    const updated = [newArticle, ...articles];
    saveArticles(updated);

    showToast("🎉 Article published live to the Onnesha feed!");

    // Reset editor
    setPostTitle("");
    setPostExcerpt("");
    setPostBody("");
    setPromptTopic("");
    setActiveTab("articles");
  };

  const handleToggleFeatured = (id: number | string) => {
    const updated = articles.map((a) => ({
      ...a,
      featured: a.id === id ? !a.featured : false, // single hero feature
    }));
    saveArticles(updated);
    showToast("Hero featured article updated!");
  };

  const handleDeleteArticle = (id: number | string) => {
    if (confirm("Are you sure you want to delete this article?")) {
      const updated = articles.filter((a) => a.id !== id);
      saveArticles(updated);
      showToast("Article deleted.");
    }
  };

  // Randomize Cover Image
  const handleRandomizeCover = () => {
    const pool = CURATED_SAMPLE_IMAGES;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setPostCoverImage(random);
    showToast("Randomized cover image!");
  };

  // If NOT ADMIN: Render Protected Gate Screen
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-md text-center">
            <div className="w-16 h-16 rounded-3xl bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
              <FaShieldHalved />
            </div>

            <div className="space-y-2">
              <h1 className="font-extrabold text-2xl text-slate-900">
                Admin Studio Protected
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                You are currently in <strong className="text-lime-800 font-bold">Reader Mode</strong> (read-only).
                Only authorized Admins can generate and publish blogs using ChatGPT, Claude, Gemini, Grok, Kimi, and DeepSeek.
              </p>
            </div>

            <form onSubmit={handleAdminAuthSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1 flex items-center gap-1.5">
                  <FaKey className="text-lime-700 text-[10px]" />
                  <span>ADMIN ACCESS SECRET KEY</span>
                </label>
                <input
                  type="password"
                  value={authPasswordInput}
                  onChange={(e) => setAuthPasswordInput(e.target.value)}
                  placeholder="Enter admin secret key"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {authError && (
                <p className="text-xs text-rose-500 font-mono">{authError}</p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <FaLock className="text-xs" />
                  <span>Authenticate Admin</span>
                </button>
              </div>
            </form>

            <div className="pt-2 border-t border-slate-200">
              <Link
                href="/"
                className="text-xs text-slate-600 hover:text-lime-700 transition flex items-center justify-center gap-1.5"
              >
                <FaArrowLeft className="text-[10px]" />
                <span>Return to Public Reader Feed</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ADMIN IS AUTHENTICATED: Render Full Studio & Dashboard
  return (
    <div className="min-h-screen flex flex-col text-left bg-slate-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-16 w-full space-y-8">
        {/* Dashboard Top Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-900 text-xs font-mono font-bold uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
              ADMIN PUBLISHING STUDIO
            </div>
            <h1 className="font-extrabold text-2xl sm:text-4xl text-slate-900 tracking-tight">
              AI Blog Publishing Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Post technical stories powered by <strong>ChatGPT, Claude, Gemini, Grok, Kimi, and DeepSeek</strong>.
              Readers on the frontend enjoy a clean, read-only experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:text-slate-950 hover:border-lime-400 flex items-center gap-1.5 transition shadow-sm"
            >
              <FaEye className="text-xs" />
              <span>View Live Feed</span>
            </Link>

            <button
              onClick={logout}
              className="px-4 py-2 rounded-full border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition"
              title="Log out back to Reader mode"
              type="button"
            >
              <FaRightFromBracket className="text-xs" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Mobile-friendly smooth horizontal scroll */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab("studio")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "studio"
                ? "bg-lime-400 text-slate-950 shadow-sm font-black border border-lime-500"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-lime-400 shadow-sm"
            }`}
          >
            <FaWandMagicSparkles className="text-xs" />
            <span>AI Post Studio</span>
          </button>

          <button
            onClick={() => setActiveTab("articles")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "articles"
                ? "bg-lime-400 text-slate-950 shadow-sm font-black border border-lime-500"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-lime-400 shadow-sm"
            }`}
          >
            <FaListCheck className="text-xs" />
            <span>Manage Posts ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("engines")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "engines"
                ? "bg-lime-400 text-slate-950 shadow-sm font-black border border-lime-500"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-lime-400 shadow-sm"
            }`}
          >
            <FaRobot className="text-xs" />
            <span>6 AI Models Status</span>
          </button>

          <button
            onClick={() => setActiveTab("automation")}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "automation"
                ? "bg-lime-400 text-slate-950 shadow-sm font-black border border-lime-500"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-950 hover:border-lime-400 shadow-sm"
            }`}
          >
            <FaBolt className="text-xs text-lime-900" />
            <span>AI Automation Agent</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: AI POST STUDIO */}
        {/* ============================================================== */}
        {activeTab === "studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: AI Engine Selector & Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Select AI Engine Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <FaRobot className="text-lime-700 text-xs" />
                    <span>Select AI Generator</span>
                  </h3>
                  <span className="text-[10px] font-mono text-lime-800 font-bold">
                    6 ENGINES AVAILABLE
                  </span>
                </div>

                {/* Engine Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(AI_ENGINES) as AiProviderKey[]).map((key) => {
                    const engine = AI_ENGINES[key];
                    const isSelected = selectedEngine === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          setSelectedEngine(key);
                          setAiEngineStatusMsg(`Switched to ${engine.name} (${engine.company})`);
                        }}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? "border-lime-500 bg-lime-50 shadow-sm ring-1 ring-lime-400"
                            : "border-slate-200 bg-slate-50 hover:border-lime-400 hover:bg-lime-50/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-xs text-slate-900">
                            {engine.name}
                          </span>
                          {isSelected && <FaCheck className="text-lime-700 text-[10px]" />}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {engine.company}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Engine Description */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-lime-500"></span>
                    <span>{AI_ENGINES[selectedEngine].name} Model: {AI_ENGINES[selectedEngine].defaultModel}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {AI_ENGINES[selectedEngine].description}
                  </p>
                </div>

                {/* Topic / Prompt Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-700 font-bold">
                    TOPIC OR PROMPT *
                  </label>
                  <textarea
                    rows={3}
                    value={promptTopic}
                    onChange={(e) => setPromptTopic(e.target.value)}
                    placeholder="e.g. Deep dive into React 19 Compiler, caching heuristics, and performance wins..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 leading-relaxed"
                  />
                </div>

                {/* Sample Topic Pills */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-mono text-slate-500">Quick ideas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_TOPICS.map((topic, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPromptTopic(topic)}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-700 transition"
                      >
                        + {topic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category & Tone */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 mb-1 font-bold">
                      CATEGORY
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                    >
                      <option value="AI & Prompts">AI & Prompts</option>
                      <option value="Coding & Tech">Coding & Tech</option>
                      <option value="UX Design">UX Design</option>
                      <option value="Web Development">Web Development</option>
                      <option value="Brand Strategy">Brand Strategy</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-500 mb-1 font-bold">
                      WRITING TONE
                    </label>
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                    >
                      <option value="Technical & In-depth">Technical Deep Dive</option>
                      <option value="Visionary & Thought Leadership">Visionary & Provocative</option>
                      <option value="Practical Tutorial">Hands-on Tutorial</option>
                      <option value="Executive Summary">Executive Brief</option>
                    </select>
                  </div>
                </div>

                {/* Optional Custom API Key */}
                <div>
                  <label className="block text-[11px] font-mono text-slate-500 mb-1 flex items-center justify-between font-bold">
                    <span>CUSTOM API KEY (OPTIONAL)</span>
                    <span className="text-[10px] text-lime-800 font-normal">Built-in generator active</span>
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder={`Leave blank or enter ${AI_ENGINES[selectedEngine].envKey}`}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                  />
                </div>

                {/* Primary Action Button: Generate Full Blog */}
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateFullPost}
                  className="w-full py-3.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 transition"
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Generating with {AI_ENGINES[selectedEngine].name}...</span>
                    </>
                  ) : (
                    <>
                      <FaWandMagicSparkles className="text-sm" />
                      <span>✨ Generate Full Post with {AI_ENGINES[selectedEngine].name}</span>
                    </>
                  )}
                </button>

                {aiEngineStatusMsg && (
                  <p className="text-[11px] font-mono text-lime-800 font-bold text-center">
                    {aiEngineStatusMsg}
                  </p>
                )}

                {/* Modular Sub-Actions */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <p className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                    Modular AI Writing Helpers:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleRunAiHelper("suggest-titles")}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-700 text-[11px] flex items-center gap-1.5 justify-center transition disabled:opacity-50"
                    >
                      <FaLightbulb className="text-lime-700 text-[10px]" />
                      <span>Suggest Title</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleRunAiHelper("generate-outline")}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-700 text-[11px] flex items-center gap-1.5 justify-center transition disabled:opacity-50"
                    >
                      <FaListCheck className="text-lime-700 text-[10px]" />
                      <span>Insert Outline</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleRunAiHelper("improve-writing")}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-700 text-[11px] flex items-center gap-1.5 justify-center transition disabled:opacity-50"
                    >
                      <FaAlignLeft className="text-lime-700 text-[10px]" />
                      <span>Polish Body</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGenerating}
                      onClick={() => handleRunAiHelper("generate-seo")}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-slate-700 text-[11px] flex items-center gap-1.5 justify-center transition disabled:opacity-50"
                    >
                      <FaTags className="text-lime-700 text-[10px]" />
                      <span>Generate SEO</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Blog Post Editor & Publisher */}
            <div className="lg:col-span-7 space-y-6">
              <form
                onSubmit={handlePublishPost}
                className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-lime-500"></span>
                    <h2 className="font-extrabold text-lg text-slate-900">
                      Live Story Editor
                    </h2>
                  </div>

                  {/* Edit / Preview Toggle */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode("edit")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        previewMode === "edit"
                          ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Edit Source
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("preview")}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        previewMode === "preview"
                          ? "bg-lime-400 text-slate-950 shadow-sm font-black"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {previewMode === "edit" ? (
                  /* Form Fields */
                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">
                        ARTICLE HEADLINE *
                      </label>
                      <input
                        type="text"
                        required
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Click 'Generate Full Post' or enter headline..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">
                        TEASER EXCERPT *
                      </label>
                      <input
                        type="text"
                        required
                        value={postExcerpt}
                        onChange={(e) => setPostExcerpt(e.target.value)}
                        placeholder="2-sentence teaser for the card feed..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                      />
                    </div>

                    {/* Meta Row: Read Time, Cover Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">
                          READ TIME
                        </label>
                        <input
                          type="text"
                          value={postReadTime}
                          onChange={(e) => setPostReadTime(e.target.value)}
                          placeholder="e.g. 6 MIN READ"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-mono text-slate-700 mb-1 flex items-center justify-between font-bold">
                          <span>COVER IMAGE</span>
                          <button
                            type="button"
                            onClick={handleRandomizeCover}
                            className="text-lime-700 hover:text-lime-800 text-[10px] flex items-center gap-1 font-bold"
                          >
                            <FaArrowRotateRight /> Randomize
                          </button>
                        </label>
                        <input
                          type="url"
                          value={postCoverImage}
                          onChange={(e) => setPostCoverImage(e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                        />
                      </div>
                    </div>

                    {/* Cover Image Thumbnail Preview */}
                    {postCoverImage && (
                      <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative shadow-sm">
                        <img
                          src={postCoverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[10px] font-mono">
                          Cover Preview
                        </span>
                      </div>
                    )}

                    {/* Full Body */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">
                        FULL ARTICLE BODY (HTML / MARKDOWN) *
                      </label>
                      <textarea
                        rows={10}
                        required
                        value={postBody}
                        onChange={(e) => {
                          setPostBody(e.target.value);
                          setPostReadTime(calculateReadingTime(e.target.value));
                        }}
                        placeholder="Article paragraphs, headings (<h3>), code snippets, and takeaways..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 text-xs font-mono text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 leading-relaxed"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-mono text-slate-700 mb-1 font-bold">
                        INDEX TAGS (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        placeholder="AI & Prompts, TypeScript, Architecture"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                      />
                    </div>
                  </div>
                ) : (
                  /* Live Reader Preview Mode */
                  <div className="space-y-6 text-left">
                    <div className="space-y-3">
                      <span className="px-3.5 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-xs font-extrabold uppercase shadow-sm">
                        {selectedCategory}
                      </span>
                      <h1 className="hero-title font-extrabold text-2xl sm:text-3xl text-slate-900">
                        {postTitle || "Story Title Preview"}
                      </h1>
                      <p className="text-xs text-slate-500 font-mono">
                        By Elena Rostova (Admin) • {getFormattedToday()} • {postReadTime}
                      </p>
                    </div>

                    {postCoverImage && (
                      <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                        <img
                          src={postCoverImage}
                          alt={postTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div
                      className="prose max-w-none text-slate-800 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: postBody || "<p class='italic text-slate-400'>Body is currently empty. Generate with AI or write above.</p>" }}
                    />
                  </div>
                )}

                {/* Submit Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                  <div className="text-[11px] font-mono text-slate-500">
                    Target Model: <strong className="text-lime-800 font-bold">{AI_ENGINES[selectedEngine].name}</strong>
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                  >
                    <FaPaperPlane className="text-xs" />
                    <span>Publish Live to Onnesha Feed</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ARTICLES MANAGEMENT */}
        {/* ============================================================== */}
        {activeTab === "articles" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">
                  Technical Dispatches & Drafts ({articles.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Review automated AI drafts, publish live to reader feed, or set hero featured banner.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setArticleFilter("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                    articleFilter === "all"
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  All ({articles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilter("published")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                    articleFilter === "published"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Published ({articles.filter((a) => a.status !== "draft").length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilter("draft")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition border ${
                    articleFilter === "draft"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Drafts ({articles.filter((a) => a.status === "draft").length})
                </button>

                <button
                  onClick={() => setActiveTab("studio")}
                  className="px-5 py-2 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-2 ml-auto transition"
                >
                  <FaWandMagicSparkles />
                  <span>Create New</span>
                </button>
              </div>
            </div>

            {articles.filter((a) => {
              if (articleFilter === "published") return a.status !== "draft";
              if (articleFilter === "draft") return a.status === "draft";
              return true;
            }).length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
                <FaListCheck className="text-3xl text-slate-300 mx-auto" />
                <div className="font-bold text-sm text-slate-700">
                  No {articleFilter === "draft" ? "drafts" : "articles"} found
                </div>
                <p className="text-xs text-slate-500">
                  {articleFilter === "draft"
                    ? "Run the AI Automation Agent in Draft mode to generate reviewable articles."
                    : "No published articles available in this view."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {articles
                  .filter((a) => {
                    if (articleFilter === "published") return a.status !== "draft";
                    if (articleFilter === "draft") return a.status === "draft";
                    return true;
                  })
                  .map((article) => {
                    const isDraft = article.status === "draft";
                    return (
                      <div
                        key={article.id}
                        className={`py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-3.5 rounded-2xl transition ${
                          isDraft ? "bg-amber-50/60 border border-amber-200/80 my-1.5" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-16 h-12 object-cover rounded-xl shrink-0 border border-slate-200"
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {isDraft ? (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                                  📝 DRAFT (NOT PUBLIC)
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                  LIVE
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[10px] font-bold uppercase">
                                {article.category}
                              </span>
                              {article.featured && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                                  <FaStar className="text-[9px]" /> HERO FEATURED
                                </span>
                              )}
                              <span className="text-[11px] font-mono text-slate-500">
                                {article.date} • {article.readTime}
                              </span>
                            </div>
                            <h3 className="font-bold text-sm text-slate-900 truncate">
                              {article.title}
                            </h3>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-auto pt-2 lg:pt-0">
                          {isDraft && (
                            <button
                              type="button"
                              disabled={isPublishingDraftId === article.id}
                              onClick={() => handlePublishDraft(article.id)}
                              className="px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition"
                              title="Publish this draft live to public reader feed"
                            >
                              {isPublishingDraftId === article.id ? (
                                <>
                                  <FaSpinner className="animate-spin text-xs" />
                                  <span>Publishing...</span>
                                </>
                              ) : (
                                <>
                                  <FaPaperPlane className="text-xs" />
                                  <span>Publish Live</span>
                                </>
                              )}
                            </button>
                          )}

                          <button
                            onClick={() => handleToggleFeatured(article.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition ${
                              article.featured
                                ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                                : "border-slate-200 text-slate-600 hover:text-amber-700 hover:border-amber-300"
                            }`}
                            title="Set as Hero featured article"
                          >
                            {article.featured ? <FaStar className="text-amber-600" /> : <FaRegStar />}
                            <span className="text-[11px]">
                              {article.featured ? "Featured" : "Set Hero"}
                            </span>
                          </button>

                          <Link
                            href={`/blog/${article.slug}`}
                            className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-lime-800 hover:border-lime-400 hover:bg-lime-50 transition"
                            title="Preview / View Article"
                          >
                            <FaEye className="text-xs" />
                          </Link>

                          <button
                            onClick={() => handleDeleteArticle(article.id)}
                            className="p-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition"
                            title="Delete Article"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: 6 AI ENGINES STATUS */}
        {/* ============================================================== */}
        {activeTab === "engines" && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-4 shadow-sm">
              <h2 className="font-extrabold text-xl text-slate-900">
                Multi-Model AI Architecture
              </h2>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                Onnesha integrates six specialized frontier AI models. If live API keys are provided in environment variables or in the studio, requests connect directly to the vendor&apos;s API. When in offline or demo mode, our smart fallback engine simulates each model&apos;s distinct stylistic signature.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.keys(AI_ENGINES) as AiProviderKey[]).map((key) => {
                const engine = AI_ENGINES[key];
                return (
                  <div
                    key={key}
                    className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm hover:border-lime-400 hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-lg text-slate-900">
                          {engine.name}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase border ${engine.badgeColor}`}>
                          {engine.company}
                        </span>
                      </div>

                      <div className="text-xs font-mono text-slate-500">
                        Default Model: <span className="font-bold text-lime-800">{engine.defaultModel}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {engine.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Environment Key:</span>
                        <code className="text-slate-800 font-bold bg-slate-100 px-2 py-0.5 rounded">{engine.envKey}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEngine(key);
                          setActiveTab("studio");
                          showToast(`Selected ${engine.name} in AI Studio!`);
                        }}
                        className="w-full py-2.5 rounded-full border border-lime-300 bg-lime-50 hover:bg-lime-400 text-lime-950 font-bold text-xs transition-all shadow-sm"
                      >
                        Launch with {engine.name}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: AI AUTOMATION AGENT */}
        {/* ============================================================== */}
        {activeTab === "automation" && (
          <div className="space-y-8">
            {/* SVG Circular Countdown Clock Widget */}
            <NextPostCountdown
              scheduleTime={automationConfig?.scheduleTime || "09:00"}
              timezone={automationConfig?.timezone || "UTC"}
              isEnabled={automationConfig?.enabled ?? true}
              isExecuting={isRunningAutomation}
              lastRunAt={automationLogs[0]?.timestamp || null}
              onRunNow={() => handleRunAutomationNow()}
              onToggleSchedule={handleToggleScheduler}
            />

            {/* Top Automation Banner with Status Controls */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-900 text-xs font-mono font-bold uppercase shadow-sm flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isRunningAutomation ? "bg-amber-500 animate-ping" : automationConfig?.enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}></span>
                      {isRunningAutomation
                        ? "PIPELINE RUNNING"
                        : automationConfig?.enabled
                        ? "AUTOMATION ACTIVE & SCHEDULED"
                        : "SCHEDULER PAUSED"}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold uppercase">
                      SINGLE-EXECUTION GUARD: LOCKED
                    </span>
                  </div>

                  <h2 className="font-extrabold text-2xl sm:text-3xl text-slate-900 tracking-tight">
                    Cloud Autonomous AI Blogging Engine
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                    Researches live technical topics on the web, verifies sources, and writes ~1,200-word SEO articles in Bangla (বাংলা) with code blueprints and tables on cloud infrastructure — running independently 24/7 even when your PC is turned off.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Pause / Resume Button */}
                  <button
                    type="button"
                    onClick={handleToggleScheduler}
                    className={`px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition ${
                      automationConfig?.enabled
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700"
                    }`}
                  >
                    {automationConfig?.enabled ? (
                      <>
                        <FaPause className="text-xs" />
                        <span>Pause Schedule</span>
                      </>
                    ) : (
                      <>
                        <FaPlay className="text-xs" />
                        <span>Resume Schedule</span>
                      </>
                    )}
                  </button>

                  {/* Refresh Button */}
                  <button
                    type="button"
                    onClick={() => {
                      loadAutomationData();
                      loadArticles();
                      showToast("Status refreshed from cloud database.");
                    }}
                    className="px-4 py-3 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 transition shadow-sm"
                  >
                    <FaArrowRotateRight className="text-xs" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {/* Status & Last Run Diagnostics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Current Status:</span>
                  <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                    {isRunningAutomation ? (
                      <span className="text-lime-700 font-extrabold flex items-center gap-1">
                        <FaSpinner className="animate-spin text-xs" /> Running Web Research & Generation
                      </span>
                    ) : automationConfig?.enabled ? (
                      <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                        <FaCircleCheck className="text-xs" /> Enabled (Next Run: {automationConfig.scheduleTime || "09:00"} {automationConfig.timezone || "UTC"})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-extrabold flex items-center gap-1">
                        <FaCircleExclamation className="text-xs" /> Disabled / Paused (Manual trigger available)
                      </span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Last Run Time:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">
                    {automationLogs[0] ? new Date(automationLogs[0].timestamp).toLocaleString() : "No runs recorded yet"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Latest Result:</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">
                    {automationLogs[0] ? (
                      <span className={`inline-flex items-center gap-1 font-bold ${automationLogs[0].status === "published" ? "text-emerald-700" : automationLogs[0].status === "draft" ? "text-amber-700" : "text-rose-700"}`}>
                        {automationLogs[0].status === "published" ? "Live Published" : automationLogs[0].status === "draft" ? "Saved as Draft" : "Failed"}: {automationLogs[0].topic}
                      </span>
                    ) : (
                      "Ready for initial run"
                    )}
                  </span>
                </div>
              </div>

              {/* Live Multi-Step Progress Tracker with Real-Time Percentage & Elapsed Timer */}
              {(isRunningAutomation || automationProgressStep > 0) && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-md shrink-0">
                        {isRunningAutomation ? (
                          <FaSpinner className="animate-spin text-base" />
                        ) : (
                          <FaCheck className="text-base" />
                        )}
                      </div>
                      <div>
                        <div className="text-[11px] font-mono uppercase tracking-wider text-lime-400 font-bold flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${isRunningAutomation ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`}></span>
                          <span>{isRunningAutomation ? "Autonomous Pipeline Active" : "Execution Finished"}</span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-100 mt-0.5">
                          {automationRunStatus || "Executing pipeline..."}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono">
                      {isRunningAutomation && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 shadow-inner">
                          <FaClock className="text-lime-400 text-[11px]" />
                          <span>Elapsed: <strong className="text-white font-bold">{automationElapsedSec}s</strong></span>
                        </div>
                      )}
                      <div className="px-3.5 py-1.5 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-300 font-extrabold shadow-sm">
                        {automationProgressStep === 5
                          ? "100% Complete"
                          : `${Math.min(96, Math.max(15, automationProgressStep * 20 + Math.min(15, automationElapsedSec)))}%`}
                      </div>
                    </div>
                  </div>

                  {/* Animated Continuous Progress Bar */}
                  <div className="relative w-full bg-slate-800 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/80 shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-lime-500 via-emerald-400 to-lime-300 transition-all duration-700 ease-out shadow-lg shadow-lime-500/30"
                      style={{
                        width: `${
                          automationProgressStep === 5
                            ? 100
                            : Math.min(96, Math.max(15, automationProgressStep * 20 + Math.min(15, automationElapsedSec)))
                        }%`,
                      }}
                    />
                  </div>

                  {/* 5 Step Indicator Badges */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-[11px] font-mono">
                    {[
                      { step: 1, title: "1. Web Research", desc: "14-16 Live Sources & RFCs" },
                      { step: 2, title: "2. Fact Analysis", desc: "Benchmarks & Latency Specs" },
                      { step: 3, title: "3. Bangla Drafting", desc: "~1,200 Words, Code & Tables" },
                      { step: 4, title: "4. Quality Audit", desc: "1,000+ Words Quality Gate" },
                      { step: 5, title: "5. Production Live", desc: "Stored in Neon Postgres" },
                    ].map((s) => {
                      const isComplete =
                        automationProgressStep > s.step || (automationProgressStep === 5 && s.step === 5);
                      const isCurrent = automationProgressStep === s.step && isRunningAutomation;
                      return (
                        <div
                          key={s.step}
                          className={`p-3 rounded-2xl border transition flex flex-col justify-between ${
                            isComplete
                              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-200"
                              : isCurrent
                              ? "bg-slate-800 border-lime-400 ring-2 ring-lime-400/50 text-white shadow-lg"
                              : "bg-slate-800/40 border-slate-800 text-slate-500"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[11px] text-slate-200">{s.title}</span>
                            {isComplete ? (
                              <FaCircleCheck className="text-emerald-400 text-xs" />
                            ) : isCurrent ? (
                              <FaSpinner className="animate-spin text-lime-400 text-xs" />
                            ) : (
                              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block text-[9px] text-center leading-3 text-slate-500">
                                {s.step}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 leading-tight">
                            {s.desc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Topic Test Runner Card */}
            <div className="bg-gradient-to-br from-lime-50/50 via-white to-slate-50 border-2 border-lime-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lime-200/60 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-200/60 border border-lime-300 text-lime-900 text-[11px] font-mono font-bold uppercase mb-2">
                    <FaWandMagicSparkles className="text-lime-800 text-xs" />
                    <span>INTERACTIVE TOPIC TEST RUNNER</span>
                  </div>
                  <h3 className="font-black text-xl text-slate-900">
                    Test Automation with Any Specific Technical Subject
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl mt-1 leading-relaxed">
                    Test the agent right now with a custom topic. It will strictly research that subject, synthesize real source citations, and generate a comprehensive ~1,200-word Bangla article. By default it is safely stored as a Draft for your review before going live.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <label className="text-xs font-mono font-bold text-slate-700 flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={testAsDraft}
                      onChange={(e) => setTestAsDraft(e.target.checked)}
                      className="accent-lime-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Save as Draft (Safe Review Mode)</span>
                  </label>
                </div>
              </div>

              {/* Topic Input Box */}
              <div className="space-y-3">
                <label className="block text-xs font-mono font-bold text-slate-800 flex items-center justify-between">
                  <span>ENTER TOPIC TO RESEARCH & WRITE:</span>
                  <span className="text-lime-800 text-[11px]">Strict Subject Adherence Enforced</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTestTopic}
                    onChange={(e) => setCustomTestTopic(e.target.value)}
                    placeholder="e.g. How to Create Motion Graphics Videos Using Claude Code"
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 font-medium focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-200 shadow-sm"
                  />
                </div>
              </div>

              {/* Sample Topic Pills */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-500 font-bold">
                  Quick test subjects (Click to populate):
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "How to Create Motion Graphics Videos Using Claude Code",
                    "Next.js 15 Partial Prerendering & React 19",
                    "DeepSeek R1 Reasoning Benchmarks vs Claude 3.5 Sonnet",
                    "Autonomous Multi-Agent Workflows with Remotion & FFmpeg",
                    "Zero-Bundle High-Contrast Design Systems with Vanilla CSS",
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomTestTopic(topic)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 ${
                        customTestTopic === topic
                          ? "bg-lime-400 text-slate-950 border-lime-500 font-black shadow-sm ring-1 ring-lime-400"
                          : "bg-white text-slate-700 border-slate-200 hover:border-lime-400 hover:bg-lime-50"
                      }`}
                    >
                      {idx === 0 && <FaStar className="text-amber-500 text-[10px]" />}
                      <span>{topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRunningAutomation || !customTestTopic.trim()}
                  onClick={() => handleRunAutomationNow({ customTopic: customTestTopic, forceDraft: testAsDraft })}
                  className="px-8 py-3.5 rounded-full bg-lime-400 hover:bg-lime-500 disabled:opacity-50 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                >
                  {isRunningAutomation ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>Agent Working...</span>
                    </>
                  ) : (
                    <>
                      <FaBolt className="text-sm" />
                      <span>⚡ Test Run with This Topic ({testAsDraft ? "Save as Draft" : "Publish Live"})</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={isRunningAutomation}
                  onClick={() => handleRunAutomationNow({ forceDraft: testAsDraft })}
                  className="px-6 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <FaRobot className="text-xs text-lime-400" />
                  <span>🤖 Run Autonomous Mode (Auto-Topic Ideation)</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>SCHEDULER STATUS</span>
                  <FaClock className="text-lime-700" />
                </div>
                <div className="text-xl font-black text-slate-900">
                  {automationConfig?.enabled ? "Active Daily" : "Paused"}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {automationConfig?.scheduleTime || "09:00"} {automationConfig?.timezone || "UTC"} (Server-side)
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>TARGET LENGTH</span>
                  <FaAlignLeft className="text-lime-700" />
                </div>
                <div className="text-xl font-black text-slate-900">
                  ~{automationConfig?.targetWordCount || 1200} Words
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  In-depth architectural guides
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>WEB RESEARCH</span>
                  <FaGlobe className="text-lime-700" />
                </div>
                <div className="text-xl font-black text-slate-900 capitalize">
                  {automationConfig?.researchProvider?.replace("-", " ") || "Gemini Search"}
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  Grounding & Source Verification
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>EXECUTIONS LOGGED</span>
                  <FaListCheck className="text-lime-700" />
                </div>
                <div className="text-xl font-black text-slate-900">
                  {automationLogs.length} Runs
                </div>
                <div className="text-[11px] text-slate-600 font-mono">
                  {articles.filter((a) => a.status === "draft").length} Drafts Awaiting Review
                </div>
              </div>
            </div>

            {/* Automation Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Automation Agent Configuration Form */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                    <FaGear className="text-lime-700" />
                    <span>Agent Configuration</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    SERVER-SIDE CRON
                  </span>
                </div>

                {automationConfig && (
                  <form onSubmit={handleSaveAutomationConfig} className="space-y-5">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Automated Daily Publishing
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Autonomous daily job execution
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={automationConfig.enabled}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              enabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                      </label>
                    </div>

                    {/* Schedule Time & Timezone */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                          SCHEDULE TIME (24H)
                        </label>
                        <input
                          type="text"
                          value={automationConfig.scheduleTime}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              scheduleTime: e.target.value,
                            })
                          }
                          placeholder="09:00"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-lime-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                          TIMEZONE
                        </label>
                        <select
                          value={automationConfig.timezone}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              timezone: e.target.value,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-lime-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="America/Los_Angeles">America/Los_Angeles</option>
                          <option value="Europe/London">Europe/London</option>
                          <option value="Asia/Dhaka">Asia/Dhaka</option>
                          <option value="Asia/Tokyo">Asia/Tokyo</option>
                        </select>
                      </div>
                    </div>

                    {/* Publishing Language */}
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>PUBLISHING LANGUAGE (ভাষা)</span>
                        <span className="text-lime-800 text-[10px] font-bold">1,200 WORDS TARGET</span>
                      </label>
                      <select
                        value={automationConfig.language || "bn"}
                        onChange={(e) =>
                          setAutomationConfig({
                            ...automationConfig,
                            language: e.target.value as "bn" | "en",
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-lime-500"
                      >
                        <option value="bn">বাংলা (Bangla) — SEO, Headings, Tables & Citations</option>
                        <option value="en">English — In-depth Systems Architecture & Blueprints</option>
                      </select>
                    </div>

                    {/* Blog Niche */}
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                        BLOG NICHE & EDITORIAL DOMAIN
                      </label>
                      <input
                        type="text"
                        value={automationConfig.niche}
                        onChange={(e) =>
                          setAutomationConfig({
                            ...automationConfig,
                            niche: e.target.value,
                          })
                        }
                        placeholder="Next.js, AI Engineering, Full-Stack System Design"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500"
                      />
                    </div>

                    {/* Target Keywords */}
                    <div>
                      <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                        TARGET KEYWORDS (COMMA SEPARATED)
                      </label>
                      <textarea
                        rows={2}
                        value={automationConfig.targetKeywords.join(", ")}
                        onChange={(e) =>
                          setAutomationConfig({
                            ...automationConfig,
                            targetKeywords: e.target.value
                              .split(",")
                              .map((k) => k.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-lime-500 resize-none font-mono"
                      />
                    </div>

                    {/* AI Provider & Research Provider */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                          WRITING AI MODEL
                        </label>
                        <select
                          value={automationConfig.preferredEngine}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              preferredEngine: e.target.value as any,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500"
                        >
                          <option value="gemini">Gemini 2.0 / 1.5</option>
                          <option value="chatgpt">ChatGPT (GPT-4o)</option>
                          <option value="claude">Claude 3.5 Sonnet</option>
                          <option value="grok">xAI Grok</option>
                          <option value="deepseek">DeepSeek R1</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                          RESEARCH ENGINE
                        </label>
                        <select
                          value={automationConfig.researchProvider}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              researchProvider: e.target.value as any,
                            })
                          }
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-lime-500"
                        >
                          <option value="gemini-grounding">Gemini Search Grounding</option>
                          <option value="tavily">Tavily Web Search</option>
                          <option value="smart-offline">Smart Synthesizer</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Word Count */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono font-bold text-slate-700">
                          ARTICLE LENGTH (TARGET: ~{automationConfig.targetWordCount} WORDS)
                        </label>
                        <span className="text-xs font-mono text-lime-800 font-bold">
                          {automationConfig.targetWordCount} words
                        </span>
                      </div>
                      <input
                        type="range"
                        min="800"
                        max="2000"
                        step="100"
                        value={automationConfig.targetWordCount}
                        onChange={(e) =>
                          setAutomationConfig({
                            ...automationConfig,
                            targetWordCount: parseInt(e.target.value, 10),
                          })
                        }
                        className="w-full accent-lime-500 cursor-pointer"
                      />
                    </div>

                    {/* Auto-publish toggle */}
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <div className="font-bold text-xs text-slate-900">
                          Direct Live Publishing
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Publish directly to live feed vs save as draft
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={automationConfig.autoPublish}
                          onChange={(e) =>
                            setAutomationConfig({
                              ...automationConfig,
                              autoPublish: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-lime-500"></div>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      {isSavingConfig ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>Saving Changes...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck className="text-xs text-lime-400" />
                          <span>Save Automation Settings</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>

              {/* Right Column: Execution History & Research Audit Logs */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <FaListCheck className="text-lime-700" />
                      <span>Automation Activity & Research Citations</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Factual verification audits, word counts, and web citations
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700">
                    {automationLogs.length} Records
                  </span>
                </div>

                {automationLogs.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-3">
                    <FaRobot className="text-3xl text-slate-400 mx-auto" />
                    <div className="font-bold text-xs text-slate-700">
                      No automated executions yet
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click <strong>&quot;Run Automation Now&quot;</strong> above to generate your first live researched article, or wait for the scheduled cron job to run at your set time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
                    {automationLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 hover:border-lime-400 transition"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase border ${
                              log.status === "published"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : log.status === "draft"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <div className="font-extrabold text-sm text-slate-900">
                            {log.topic}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 mt-1">
                            <span>~{log.wordCount} words</span>
                            <span>•</span>
                            <span>Engine: {log.engine}</span>
                            <span>•</span>
                            <span>{log.sourcesCount || (log.sources ? log.sources.length : 0)} Sources Cited</span>
                          </div>
                        </div>

                        {/* Citations List */}
                        {log.sources && log.sources.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <div className="text-[10px] font-mono font-bold text-slate-600 uppercase flex items-center gap-1.5">
                              <FaGlobe className="text-[9px] text-lime-700" />
                              <span>Verified Web Sources ({log.sources.length}):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {log.sources.map((source: { title: string; url: string }, sIdx: number) => (
                                <a
                                  key={sIdx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] bg-white border border-slate-200 text-slate-700 hover:text-lime-800 hover:border-lime-400 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                                >
                                  <span className="truncate max-w-[200px]">{source.title}</span>
                                  <FaArrowUpRightFromSquare className="text-[9px] text-slate-400 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Published link or notes */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          {log.slug ? (
                            <Link
                              href={`/blog/${log.slug}`}
                              target="_blank"
                              className="text-xs font-bold text-lime-800 hover:text-lime-950 flex items-center gap-1.5 transition"
                            >
                              <span>View Live Article</span>
                              <FaArrowUpRightFromSquare className="text-[10px]" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">No article URL</span>
                          )}

                          {log.status === "published" && (
                            <span className="text-[11px] font-mono text-emerald-700 flex items-center gap-1 font-bold">
                              <FaCheck className="text-[10px]" /> Quality Audit Passed
                            </span>
                          )}
                        </div>

                        {log.error && (
                          <p className="text-[11px] text-rose-600 font-mono bg-white p-2.5 rounded-xl border border-rose-200">
                            {log.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


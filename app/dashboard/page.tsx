"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
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
  FaWandMagicSparkles,
  FaFilePen,
  FaBookOpen,
} from "react-icons/fa6";
import { useAuth } from "@/components/auth-context";
import { useToast } from "@/components/toast";
import { Header } from "@/components/header";
import { AutomationConfig, AutomationLog } from "@/lib/ai/automation-config";
import { Article } from "@/types/article";
import { initialArticles } from "@/lib/data/articles";
import { NextPostCountdown } from "@/components/next-post-countdown";

type ActiveTab = "articles" | "automation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, role, loginAsAdmin, logout, adminToken } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>("articles");
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [articleFilter, setArticleFilter] = useState<"all" | "published" | "draft">("all");
  const [isPublishingDraftId, setIsPublishingDraftId] = useState<number | string | null>(null);

  // Automation Agent States
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig | null>(null);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [isRunningAutomation, setIsRunningAutomation] = useState(false);
  const [automationRunStatus, setAutomationRunStatus] = useState("");
  const [automationProgressStep, setAutomationProgressStep] = useState<number>(0);
  const [automationElapsedSec, setAutomationElapsedSec] = useState<number>(0);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [customTestTopic, setCustomTestTopic] = useState("২০২৬ সালে সেরা ৫টি প্রোগ্রামিং ল্যাঙ্গুয়েজ ও প্রডাকশন আর্কিটেকচার");
  const [testAsDraft, setTestAsDraft] = useState(true);

  // Admin login password field if not authenticated
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

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
      console.warn("Could not fetch /api/articles, using local cache:", err);
    }

    const saved = localStorage.getItem("onnesha-articles");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setArticles(parsed);
        }
      } catch {}
    }
  };

  const loadAutomationData = async () => {
    try {
      const res = await fetch("/api/cron/config");
      if (res.ok) {
        const data = await res.json();
        if (data.config) setAutomationConfig(data.config);
        if (Array.isArray(data.logs)) setAutomationLogs(data.logs);
      }
    } catch (err) {
      console.warn("Could not load automation config:", err);
    }
  };

  useEffect(() => {
    loadArticles();
    loadAutomationData();
  }, []);

  const saveArticles = async (updated: Article[]) => {
    setArticles(updated);
    try {
      localStorage.setItem("onnesha-articles", JSON.stringify(updated));
    } catch {}

    try {
      await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articles: updated }),
      });
    } catch (err) {
      console.warn("Failed to sync articles with server:", err);
    }
  };

  const handlePublishDraft = async (id: number | string) => {
    setIsPublishingDraftId(id);
    try {
      const res = await fetch("/api/articles/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken || ""}`,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish draft");
      }

      const updated = articles.map((a) => (a.id === id ? { ...a, status: "published" as const } : a));
      await saveArticles(updated);
      showToast("Draft successfully published live to the Onnesha feed!");
    } catch (err: any) {
      showToast(`Error publishing draft: ${err.message || String(err)}`);
    } finally {
      setIsPublishingDraftId(null);
    }
  };

  const handleToggleFeatured = (id: number | string) => {
    const updated = articles.map((a) => ({
      ...a,
      featured: a.id === id ? !a.featured : false,
    }));
    saveArticles(updated);
    showToast("Hero featured article updated!");
  };

  const handleDeleteArticle = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this dispatch?")) return;
    const strId = String(id);
    const updated = articles.filter((a) => String(a.id) !== strId && a.slug !== strId);
    setArticles(updated);
    try {
      localStorage.setItem("onnesha-articles", JSON.stringify(updated));
    } catch {}

    try {
      const res = await fetch(`/api/articles?id=${encodeURIComponent(strId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
        },
      });
      if (res.ok) {
        showToast("Dispatch deleted permanently.");
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(`Deletion issue: ${data.error || "Could not remove from database"}`);
      }
    } catch (err) {
      console.error("Failed to delete article from database:", err);
      showToast("Error deleting article from database.");
    }
  };

  const handleClearAllArticles = async () => {
    if (!confirm("Are you sure you want to delete ALL articles? This gives you a completely clean blog.")) return;
    setArticles([]);
    try {
      localStorage.setItem("onnesha-articles", JSON.stringify([]));
    } catch {}

    try {
      const res = await fetch("/api/articles", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
        },
      });
      if (res.ok) {
        showToast("All articles cleared permanently.");
      }
    } catch (err) {
      console.error("Failed to clear articles:", err);
      showToast("Error clearing articles from database.");
    }
  };

  const handleClearDrafts = async () => {
    if (!confirm("Are you sure you want to delete all drafts?")) return;
    const updated = articles.filter((a) => a.status !== "draft");
    setArticles(updated);
    try {
      localStorage.setItem("onnesha-articles", JSON.stringify(updated));
    } catch {}

    try {
      const res = await fetch("/api/articles?status=draft", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
        },
      });
      if (res.ok) {
        showToast("All drafts removed permanently.");
      }
    } catch (err) {
      console.error("Failed to delete drafts:", err);
      showToast("Error deleting drafts from database.");
    }
  };

  const handleRunAutomationNow = async (options?: { customTopic?: string; forceDraft?: boolean }) => {
    if (isRunningAutomation) return;
    setIsRunningAutomation(true);
    setAutomationProgressStep(1);
    setAutomationElapsedSec(0);
    setAutomationRunStatus("Initializing TinyFish multi-page web research...");

    const timer = setInterval(() => {
      setAutomationElapsedSec((prev) => prev + 1);
    }, 1000);

    try {
      const res = await fetch("/api/cron/publish?stream=true", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken || ""}`,
        },
        body: JSON.stringify({
          customTopic: options?.customTopic || customTestTopic,
          forceDraft: options?.forceDraft !== undefined ? options.forceDraft : testAsDraft,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${res.status}`);
      }

      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;
            try {
              const payload = JSON.parse(trimmed.slice(6));
              if (payload.type === "progress") {
                setAutomationProgressStep(payload.step);
                setAutomationRunStatus(payload.message);
              } else if (payload.type === "completed") {
                setAutomationProgressStep(4);
                setAutomationRunStatus("Complete! Article safely staged as Draft.");
                showToast("বাংলা আর্টিকেল ড্রাফট সফলভাবে তৈরি হয়েছে!");
                if (payload.result?.article) {
                  const newArticle = payload.result.article;
                  setArticles((prev) => {
                    const filtered = prev.filter(
                      (a) => a.id !== newArticle.id && a.slug !== newArticle.slug
                    );
                    const updated = [newArticle, ...filtered];
                    try {
                      localStorage.setItem("onnesha-articles", JSON.stringify(updated));
                    } catch {}
                    return updated;
                  });
                }
              } else if (payload.type === "error") {
                throw new Error(payload.error);
              }
            } catch (pErr: any) {
              if (pErr.message && !pErr.message.includes("JSON")) {
                throw pErr;
              }
            }
          }
        }
      }

      await loadArticles();
      await loadAutomationData();
    } catch (err: any) {
      showToast(`Automation run notice: ${err.message || String(err)}`);
    } finally {
      clearInterval(timer);
      setIsRunningAutomation(false);
      setTimeout(() => setAutomationProgressStep(0), 4000);
    }
  };

  const handleToggleScheduler = async () => {
    if (!automationConfig) return;
    const newEnabled = !automationConfig.enabled;
    const updated = { ...automationConfig, enabled: newEnabled };
    setAutomationConfig(updated);

    try {
      await fetch("/api/cron/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      showToast(newEnabled ? "Scheduler resumed." : "Scheduler paused.");
    } catch {
      showToast("Could not update schedule state.");
    }
  };

  const handleSaveAutomationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!automationConfig) return;
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/cron/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(automationConfig),
      });
      if (res.ok) {
        showToast("Automation configuration saved!");
      }
    } catch {
      showToast("Failed to save configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleClearAutomationLogs = async () => {
    if (!confirm("Are you sure you want to clear all automation execution history and research logs?")) return;
    setAutomationLogs([]);
    try {
      const res = await fetch("/api/cron/config", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken || ""}`,
        },
      });
      if (res.ok) {
        showToast("Automation history logs cleared.");
      } else {
        showToast("Failed to clear automation history.");
      }
    } catch {
      showToast("Error clearing automation history.");
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-lime-100 border border-lime-300 flex items-center justify-center mx-auto text-lime-900 text-2xl shadow-sm">
            <FaShieldHalved />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Admin Authentication Required</h1>
            <p className="text-xs text-slate-600 mt-1">
              Please enter the secret admin passphrase to manage Onnesha editorial controls.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (loginAsAdmin(authPasswordInput)) {
                setAuthError("");
                showToast("Welcome back, Administrator.");
              } else {
                setAuthError("Invalid secret passphrase.");
              }
            }}
            className="space-y-4"
          >
            <input
              type="password"
              placeholder="Secret Passphrase"
              value={authPasswordInput}
              onChange={(e) => setAuthPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:border-lime-500 font-mono"
            />
            {authError && <div className="text-rose-600 text-xs font-semibold">{authError}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl lime-cta-btn text-xs font-bold uppercase tracking-wider shadow-sm"
            >
              Verify & Enter Dashboard
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              <FaArrowLeft className="text-[10px]" /> Return to Public Feed
            </Link>
          </form>
        </div>
      </div>
    );
  }

  const publishedCount = articles.filter((a) => a.status !== "draft").length;
  const draftsCount = articles.filter((a) => a.status === "draft").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Control Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500 animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                EDITORIAL DESK & AUTOMATION
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Onnesha Publisher Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <FaArrowLeft className="text-xs" />
              <span>Public Feed</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="px-4 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              type="button"
            >
              <FaRightFromBracket className="text-xs" />
              <span>Exit Admin</span>
            </button>
          </div>
        </div>

        {/* Streamlined 2-Tab Navigation Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4 overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setActiveTab("articles")}
            className={`px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "articles"
                ? "lime-cta-btn font-bold shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-900 hover:border-lime-400 font-semibold shadow-sm"
            }`}
          >
            <FaListCheck className="text-xs" />
            <span>Manage Posts & Drafts ({articles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("automation")}
            className={`px-5 py-2.5 rounded-full text-xs transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "automation"
                ? "lime-cta-btn font-bold shadow-sm"
                : "bg-white text-slate-700 border border-slate-200 hover:text-slate-900 hover:border-lime-400 font-semibold shadow-sm"
            }`}
          >
            <FaBolt className="text-xs" />
            <span>AI Publisher & Automation</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: MANAGE POSTS & DRAFTS */}
        {/* ============================================================== */}
        {activeTab === "articles" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="font-bold text-xl text-slate-800">
                  Technical Dispatches & Drafts ({articles.length})
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Review automated Bangla AI drafts, publish live to reader feed, or pin featured articles.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setArticleFilter("all")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                    articleFilter === "all"
                      ? "bg-slate-800 text-white border-slate-800 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  All ({articles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilter("published")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                    articleFilter === "published"
                      ? "bg-emerald-600 text-white border-emerald-600 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Live ({publishedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setArticleFilter("draft")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition border ${
                    articleFilter === "draft"
                      ? "bg-amber-500 text-white border-amber-500 font-bold"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  Drafts ({draftsCount})
                </button>

                <button
                  onClick={() => setActiveTab("automation")}
                  className="px-5 py-2 rounded-full lime-cta-btn text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2 transition ml-auto"
                >
                  <FaWandMagicSparkles className="text-xs" />
                  <span>Generate Bangla Post</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearAllArticles}
                  className="px-3.5 py-2 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Delete all articles and start with a clean slate"
                >
                  <FaTrash className="text-xs" />
                  <span>Clear All</span>
                </button>

                {articleFilter === "draft" && draftsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearDrafts}
                    className="px-3.5 py-2 rounded-full border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition"
                    title="Delete all drafts and keep only published posts"
                  >
                    <FaTrash className="text-xs" />
                    <span>Clear Drafts</span>
                  </button>
                )}
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
                    ? "Generate a new Bangla technical article in the AI Publisher tab."
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
                          isDraft ? "bg-amber-50/50 border border-amber-200/60 my-1.5" : "hover:bg-slate-50/80"
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
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                  <FaFilePen className="text-[10px]" />
                                  <span>DRAFT • HUMANIZED</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                  LIVE
                                </span>
                              )}
                              <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[10px] font-bold uppercase">
                                {article.category}
                              </span>
                              {article.featured && (
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center gap-1">
                                  <FaStar className="text-[9px]" /> HERO PINNED
                                </span>
                              )}
                              <span className="text-[11px] font-mono text-slate-500">
                                {article.date} • {article.readTime}
                              </span>
                              {article.sources && article.sources.length > 0 && (
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <FaBookOpen className="text-[9px]" />
                                  <span>{article.sources.length} Sources</span>
                                </span>
                              )}
                              {article.rigorScore && (
                                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1 font-bold">
                                  <FaShieldHalved className="text-[9px] text-emerald-600" />
                                  <span>{article.rigorScore}% Rigor</span>
                                </span>
                              )}
                            </div>
                            <h3 className="font-semibold text-sm text-slate-800 truncate hover:text-lime-700 transition-colors">
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
                              className="px-4 py-2 rounded-full lime-cta-btn disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition"
                              title="Publish this draft live to reader feed"
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
                            type="button"
                            onClick={() => {
                              const text =
                                article.socialSnippets?.linkedin ||
                                `New Technical Deep Dive: ${article.title}\n\n${article.excerpt}\n\nRead complete breakdown:\nhttps://onneshax.vercel.app/blog/${article.slug}\n\n#SoftwareEngineering #TechBlog #Onnesha`;
                              navigator.clipboard.writeText(text);
                              showToast("১-ক্লিক লিঙ্কডইন পোস্ট টেক্সট কপি হয়েছে!");
                            }}
                            className="px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-lime-300 text-slate-700 hover:text-slate-900 text-xs font-semibold flex items-center gap-1 transition shadow-sm"
                            title="Copy 1-Click LinkedIn & X Social Post Package"
                          >
                            <FaBolt className="text-[10px] text-lime-700" />
                            <span className="text-[11px]">Social Post</span>
                          </button>

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
                            className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-lime-400 hover:bg-lime-50 transition"
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
        {/* TAB 2: AI PUBLISHER & AUTOMATION */}
        {/* ============================================================== */}
        {activeTab === "automation" && (
          <div className="space-y-8">
            {/* SVG Circular Countdown Clock Widget */}
            <NextPostCountdown
              scheduleTime={automationConfig?.scheduleTime || "06:00"}
              timezone={automationConfig?.timezone || "Asia/Dhaka"}
              isEnabled={automationConfig?.enabled ?? true}
              isExecuting={isRunningAutomation}
              lastRunAt={automationLogs[0]?.timestamp || null}
              onRunNow={() => handleRunAutomationNow()}
              onToggleSchedule={handleToggleScheduler}
            />

            {/* 1-Click Instant Bangla Post Generator Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="font-bold text-xl sm:text-2xl text-slate-800 tracking-tight flex items-center gap-2">
                  <FaBolt className="text-lime-600 text-lg" />
                  <span>১-ক্লিক বাংলা টেকনিক্যাল আর্টিকেল জেনারেটর</span>
                </h2>
              </div>

              {/* Topic Input Box */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  আর্টিকেলের বিষয়বস্তু বা শিরোনাম লিখুন:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customTestTopic}
                    onChange={(e) => setCustomTestTopic(e.target.value)}
                    placeholder="যেমন: ২০২৬ সালে সেরা ৫টি প্রোগ্রামিং ল্যাঙ্গুয়েজ..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-lime-500 transition shadow-inner font-medium"
                  />
                  {customTestTopic && (
                    <button
                      type="button"
                      onClick={() => setCustomTestTopic("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-2 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Action Trigger Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <button
                  type="button"
                  disabled={isRunningAutomation || !customTestTopic.trim()}
                  onClick={() => handleRunAutomationNow({ customTopic: customTestTopic, forceDraft: testAsDraft })}
                  className="px-8 py-3.5 rounded-full lime-cta-btn disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                >
                  {isRunningAutomation ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" />
                      <span>রিসার্চ ও লেখা চলছে ({automationElapsedSec}s)...</span>
                    </>
                  ) : (
                    <>
                      <FaBolt className="text-sm" />
                      <span>রিসার্চ ও বাংলা ড্রাফট তৈরি করুন</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Multi-Step Progress Tracker */}
              {(isRunningAutomation || automationProgressStep > 0) && (
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2">
                      <FaSpinner className="animate-spin text-lime-400" />
                      <span>লাইভ পাইপলাইন এক্সেকিউশন</span>
                    </span>
                    <span className="text-lime-400 font-bold">{automationElapsedSec}s</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-200">{automationRunStatus}</p>

                  <div className="grid grid-cols-4 gap-2 pt-2 text-[11px] font-mono">
                    <div className={`p-2.5 rounded-xl border ${automationProgressStep >= 1 ? "bg-lime-950/60 border-lime-500 text-lime-300 font-bold" : "bg-slate-800/40 border-slate-700 text-slate-400"}`}>
                      ১. TinyFish Web Research
                    </div>
                    <div className={`p-2.5 rounded-xl border ${automationProgressStep >= 2 ? "bg-lime-950/60 border-lime-500 text-lime-300 font-bold" : "bg-slate-800/40 border-slate-700 text-slate-400"}`}>
                      ২. বাংলা ড্রাফট রাইটার
                    </div>
                    <div className={`p-2.5 rounded-xl border ${automationProgressStep >= 3 ? "bg-lime-950/60 border-lime-500 text-lime-300 font-bold" : "bg-slate-800/40 border-slate-700 text-slate-400"}`}>
                      ৩. Humanizer Anti-AI Pass
                    </div>
                    <div className={`p-2.5 rounded-xl border ${automationProgressStep >= 4 ? "bg-lime-950/60 border-lime-500 text-lime-300 font-bold" : "bg-slate-800/40 border-slate-700 text-slate-400"}`}>
                      ৪. Staged in Drafts
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Schedule Configuration Card & Activity Logs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Schedule Settings (Clutter-Free) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                    <FaGear className="text-lime-700" />
                    <span>শিডিউল ও ক্রন কনফিগারেশন</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-500">
                    SERVER CRON
                  </span>
                </div>

                {automationConfig && (
                  <form onSubmit={handleSaveAutomationConfig} className="space-y-5">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <div className="font-bold text-xs text-slate-800">
                          প্রতিদিনের স্বয়ংক্রিয় শিডিউল
                        </div>
                        <div className="text-[11px] text-slate-500">
                          নির্দিষ্ট সময়ে ব্যাকগ্রাউন্ডে রান হবে
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
                          সময় (24H FORMAT)
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
                          placeholder="06:00"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-lime-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold text-slate-700 mb-1">
                          টাইমজোন
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
                          <option value="Asia/Dhaka">Asia/Dhaka (বাংলাদেশ সময়)</option>
                          <option value="UTC">UTC (00:00 UTC)</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Europe/London">Europe/London</option>
                        </select>
                      </div>
                    </div>

                    {/* Target Word Count */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-mono font-bold text-slate-700">
                          টার্গেট ওয়ার্ড কাউন্ট: ~{automationConfig.targetWordCount} শব্দ
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

                    <button
                      type="submit"
                      disabled={isSavingConfig}
                      className="w-full py-3 rounded-full lime-cta-btn disabled:opacity-50 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                    >
                      {isSavingConfig ? (
                        <>
                          <FaSpinner className="animate-spin text-xs" />
                          <span>সংরক্ষণ হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <FaCheck className="text-xs" />
                          <span>Save Settings</span>
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
                    <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                      <FaListCheck className="text-lime-700" />
                      <span>Automation Activity & Research Citations</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      TinyFish সোর্স ভেরিফিকেশন ও এক্সিকিউশন ইতিহাস
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {automationLogs.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAutomationLogs}
                        className="px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1.5 transition"
                        title="Clear execution history"
                      >
                        <FaTrash className="text-xs" />
                        <span>Clear History</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        loadAutomationData();
                        showToast("Logs refreshed.");
                      }}
                      className="p-2 rounded-full border border-slate-200 text-slate-600 hover:text-slate-900 transition"
                      title="Refresh logs"
                    >
                      <FaArrowRotateRight className="text-xs" />
                    </button>
                  </div>
                </div>

                {automationLogs.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs font-mono">
                    No automation executions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                    {automationLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              log.status === "published"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : log.status === "draft"
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-rose-50 text-rose-800 border-rose-300"
                            }`}
                          >
                            {log.status === "draft" ? "DRAFT • HUMANIZED" : log.status}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <div className="font-semibold text-sm text-slate-800">
                            {log.topic}
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 mt-1">
                            <span>~{log.wordCount} words</span>
                            <span>•</span>
                            <span>{log.sourcesCount || (log.sources ? log.sources.length : 0)} Sources Cited</span>
                          </div>
                        </div>

                        {/* Citations List */}
                        {log.sources && log.sources.length > 0 && (
                          <div className="space-y-1.5 pt-2 border-t border-slate-200">
                            <div className="text-[10px] font-mono font-bold text-slate-600 uppercase flex items-center gap-1.5">
                              <FaGlobe className="text-[9px] text-lime-700" />
                              <span>TinyFish Verified Web Sources ({log.sources.length}):</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {log.sources.slice(0, 8).map((source: { title: string; url: string }, sIdx: number) => (
                                <a
                                  key={sIdx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] bg-white border border-slate-200 text-slate-700 hover:text-lime-800 hover:border-lime-400 px-2.5 py-1 rounded-lg flex items-center gap-1 transition"
                                >
                                  <span className="truncate max-w-[180px]">{source.title}</span>
                                  <FaArrowUpRightFromSquare className="text-[9px] text-slate-400 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          {log.slug ? (
                            <Link
                              href={`/blog/${log.slug}`}
                              target="_blank"
                              className="text-xs font-bold text-lime-800 hover:text-lime-950 flex items-center gap-1.5 transition"
                            >
                              <span>View Post</span>
                              <FaArrowUpRightFromSquare className="text-[10px]" />
                            </Link>
                          ) : (
                            <span className="text-xs text-slate-500 font-mono">No article URL</span>
                          )}

                          {log.status === "draft" && (
                            <span className="text-[11px] font-mono text-amber-700 flex items-center gap-1 font-bold">
                              <FaCheck className="text-[10px]" /> Staged as Reviewable Draft
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

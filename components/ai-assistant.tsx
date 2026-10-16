"use client";

import React, { useState } from "react";
import { FaWandMagicSparkles, FaSpinner, FaLightbulb, FaAlignLeft, FaListCheck, FaTags } from "react-icons/fa6";
import { AiAction, AiResponse } from "@/lib/ai/types";
import { useToast } from "./toast";

interface AiAssistantProps {
  topic: string;
  category: string;
  draft: string;
  onApplyTitle: (title: string) => void;
  onApplySummary: (summary: string) => void;
  onApplyContent: (content: string) => void;
  onApplyTags: (tags: string[]) => void;
}

export function AiAssistant({
  topic,
  category,
  draft,
  onApplyTitle,
  onApplySummary,
  onApplyContent,
  onApplyTags,
}: AiAssistantProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [aiMessage, setAiMessage] = useState<string>("");

  const runAiAction = async (action: AiAction) => {
    setIsLoading(true);
    setActiveAction(action);
    setAiMessage("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          topic: topic || draft.slice(0, 50),
          category,
          draft,
        }),
      });

      const data: AiResponse = await res.json();

      if (!data.success) {
        showToast(data.message || "AI action failed");
        return;
      }

      if (data.message) {
        setAiMessage(data.message);
      }

      if (action === "suggest-titles" && data.data.titles) {
        setSuggestedTitles(data.data.titles);
        showToast("Generated 4 title recommendations!");
      } else if (action === "generate-summary" && data.data.summary) {
        onApplySummary(data.data.summary);
        showToast("Summary applied to excerpt!");
      } else if (action === "improve-writing" && data.data.improvedContent) {
        onApplyContent(data.data.improvedContent);
        showToast("Polished draft applied!");
      } else if (action === "generate-outline" && data.data.outline) {
        const appended = draft ? `${draft}\n\n${data.data.outline}` : data.data.outline;
        onApplyContent(appended);
        showToast("Outline added to story content!");
      } else if (action === "generate-seo" && data.data.seo) {
        onApplyTags(data.data.seo.suggestedTags);
        if (!draft && data.data.seo.metaDescription) {
          onApplySummary(data.data.seo.metaDescription);
        }
        showToast("SEO tags generated and applied!");
      }
    } catch (err) {
      console.error("AI error:", err);
      showToast("Unable to reach AI service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaWandMagicSparkles className="text-lime-700 text-xs" />
          <span className="text-xs font-mono font-bold text-lime-900 uppercase tracking-wider">
            AI Quick Assist
          </span>
        </div>
        {isLoading && (
          <span className="flex items-center gap-1.5 text-[10px] font-mono text-lime-700 animate-pulse">
            <FaSpinner className="animate-spin text-xs" /> Generating...
          </span>
        )}
      </div>

      {/* AI Action Buttons */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAiAction("suggest-titles")}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-lime-400 text-slate-700 hover:text-slate-950 hover:bg-lime-50/60 transition flex items-center gap-1.5 disabled:opacity-50 text-[11px] shadow-sm"
        >
          <FaLightbulb className="text-lime-700 text-[10px]" />
          <span>Suggest Titles</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAiAction("generate-summary")}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-lime-400 text-slate-700 hover:text-slate-950 hover:bg-lime-50/60 transition flex items-center gap-1.5 disabled:opacity-50 text-[11px] shadow-sm"
        >
          <FaAlignLeft className="text-lime-700 text-[10px]" />
          <span>Auto Summary</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAiAction("generate-outline")}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-lime-400 text-slate-700 hover:text-slate-950 hover:bg-lime-50/60 transition flex items-center gap-1.5 disabled:opacity-50 text-[11px] shadow-sm"
        >
          <FaListCheck className="text-lime-700 text-[10px]" />
          <span>Draft Outline</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAiAction("improve-writing")}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-lime-400 text-slate-700 hover:text-slate-950 hover:bg-lime-50/60 transition flex items-center gap-1.5 disabled:opacity-50 text-[11px] shadow-sm"
        >
          <FaWandMagicSparkles className="text-lime-700 text-[10px]" />
          <span>Polish Draft</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => runAiAction("generate-seo")}
          className="px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:border-lime-400 text-slate-700 hover:text-slate-950 hover:bg-lime-50/60 transition flex items-center gap-1.5 disabled:opacity-50 text-[11px] shadow-sm"
        >
          <FaTags className="text-lime-700 text-[10px]" />
          <span>SEO & Tags</span>
        </button>
      </div>

      {/* Suggested Titles Dropdown/Pills */}
      {suggestedTitles.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200 text-left">
          <p className="text-[10px] font-mono text-slate-500">Click any title to apply:</p>
          <div className="space-y-1">
            {suggestedTitles.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onApplyTitle(t);
                  setSuggestedTitles([]);
                  showToast("Title applied!");
                }}
                className="w-full text-left text-xs p-2.5 rounded-xl bg-white hover:bg-lime-50/70 border border-slate-200 hover:border-lime-400 text-slate-800 hover:text-slate-950 transition shadow-sm"
              >
                👉 {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {aiMessage && (
        <p className="text-[10px] font-mono text-slate-500 pt-1 text-left">
          ℹ️ {aiMessage}
        </p>
      )}
    </div>
  );
}

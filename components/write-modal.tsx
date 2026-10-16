"use client";

import React, { useState } from "react";
import { FaXmark, FaWandMagicSparkles } from "react-icons/fa6";
import { useTheme } from "./theme-context";
import { useToast } from "./toast";
import { AiAssistant } from "./ai-assistant";
import { Article } from "@/types/article";
import { slugify, getFormattedToday, calculateReadingTime } from "@/lib/utils";
import Link from "next/link";

interface WriteModalProps {
  onPublishArticle: (newArticle: Article) => void;
}

export function WriteModal({ onPublishArticle }: WriteModalProps) {
  const { isWriteModalOpen, closeWriteModal } = useTheme();
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("UX Design");
  const [readTime, setReadTime] = useState("5 MIN READ");
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  if (!isWriteModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim() || !body.trim()) {
      showToast("Please fill in required fields.");
      return;
    }

    const finalImage =
      coverImage.trim() ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200";

    const parsedTags = tags
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [category];

    const newArticle: Article = {
      id: Date.now(),
      slug: slugify(title) || `story-${Date.now()}`,
      title: title.trim(),
      category: category as any,
      readTime: readTime.trim() || calculateReadingTime(body),
      author: "Elena Rostova (Admin)",
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200",
      date: getFormattedToday(),
      coverImage: finalImage,
      excerpt: excerpt.trim(),
      body: `<div class="my-6 p-5 sm:p-6 rounded-2xl bg-lime-50 border-l-4 border-lime-500 shadow-sm text-slate-800 text-lg sm:text-xl font-medium leading-relaxed">${excerpt.trim()}</div><div class="text-lg text-slate-800 mt-4 space-y-4">${body
        .split("\n\n")
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("")}</div>`,
      tags: parsedTags,
      likes: 0,
      claps: 0,
      bookmarked: false,
      comments: [],
    };

    onPublishArticle(newArticle);
    closeWriteModal();
    // Reset form
    setTitle("");
    setCoverImage("");
    setExcerpt("");
    setBody("");
    setTags("");
    showToast("Article published successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-lime-400 shadow-sm"></span>
            <h2 className="font-extrabold text-xl text-slate-900">
              Publish Story (Admin Studio)
            </h2>
          </div>
          <button
            onClick={closeWriteModal}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition"
            type="button"
          >
            <FaXmark className="text-sm" />
          </button>
        </div>

        {/* Pro Banner: Link to full Dashboard */}
        <div className="p-3.5 rounded-2xl bg-lime-50 border border-lime-300 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <FaWandMagicSparkles className="text-lime-700 text-xs" />
            <span>Generate complete posts with ChatGPT, Claude, Gemini, Grok, Kimi, & DeepSeek</span>
          </div>
          <Link
            href="/dashboard"
            onClick={closeWriteModal}
            className="text-lime-800 hover:text-lime-950 font-bold font-mono text-[11px] shrink-0 hover:underline"
          >
            Open Dashboard →
          </Link>
        </div>

        {/* AI Writing Assistant Toolbar */}
        <AiAssistant
          topic={title}
          category={category}
          draft={body}
          onApplyTitle={(t) => setTitle(t)}
          onApplySummary={(s) => setExcerpt(s)}
          onApplyContent={(c) => {
            setBody(c);
            setReadTime(calculateReadingTime(c));
          }}
          onApplyTags={(tagList) => setTags(tagList.join(", "))}
        />

        {/* Story Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1 font-bold">ARTICLE TITLE *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Systems with Electric Lime Palette"
              className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1 font-bold">CATEGORY *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
              >
                <option value="UX Design">UX Design</option>
                <option value="Brand Strategy">Brand Strategy</option>
                <option value="Web Development">Web Development</option>
                <option value="Coding & Tech">Coding & Tech</option>
                <option value="AI & Prompts">AI & Prompts</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1 font-bold">
                ESTIMATED READ TIME *
              </label>
              <input
                type="text"
                required
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 MIN READ"
                className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1">COVER IMAGE URL</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1 font-bold">EXCERPT *</label>
            <input
              type="text"
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short preview teaser..."
              className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1 font-bold">STORY CONTENT *</label>
            <textarea
              rows={5}
              required
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setReadTime(calculateReadingTime(e.target.value));
              }}
              placeholder="Write your full story here or use the AI Assistant above..."
              className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-2xl p-4 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-300 light:text-slate-600 mb-1">
              TAGS (Comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="UX Design, Brand Strategy, Lime"
              className="w-full bg-obsidian-surface light:bg-slate-50 border border-obsidian-border light:border-slate-300 rounded-full px-5 py-2.5 text-xs text-white light:text-slate-900 focus:outline-none focus:border-lime"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-obsidian-border light:border-slate-200">
            <button
              type="button"
              onClick={closeWriteModal}
              className="px-5 py-2 rounded-full border border-obsidian-border light:border-slate-300 text-xs text-gray-300 light:text-slate-600 hover:text-white light:hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="lime-gradient-btn px-6 py-2 rounded-full text-xs font-extrabold shadow-lime-glow"
            >
              Publish Live
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

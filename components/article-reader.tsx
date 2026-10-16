"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaHandsClapping,
  FaHeart,
  FaBookmark,
  FaRegBookmark,
  FaShareNodes,
  FaXmark,
  FaXTwitter,
  FaLinkedinIn,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa6";
import { Article } from "@/types/article";
import { useToast } from "./toast";

interface ArticleReaderProps {
  article: Article;
  relatedArticles?: Article[];
  isModal?: boolean;
  onClose?: () => void;
  onToggleBookmark?: (id: number | string) => void;
  onUpdateArticle?: (updated: Article) => void;
}

export function ArticleReader({
  article,
  relatedArticles = [],
  isModal = false,
  onClose,
  onToggleBookmark,
  onUpdateArticle,
}: ArticleReaderProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [readingProgress, setReadingProgress] = useState(0);
  const [likes, setLikes] = useState(article.likes);
  const [claps, setClaps] = useState(article.claps || 0);
  const [isBookmarked, setIsBookmarked] = useState(article.bookmarked);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.push("/");
    }
  };

  const handleBookmarkClick = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (onToggleBookmark) {
      onToggleBookmark(article.id);
    } else {
      // Local fallback for standalone pages
      showToast(next ? "Saved to bookmarks" : "Removed from bookmarks");
      try {
        const saved = localStorage.getItem("onnesha-articles");
        if (saved) {
          const list: Article[] = JSON.parse(saved);
          const updated = list.map((a) =>
            a.id === article.id ? { ...a, bookmarked: next } : a
          );
          localStorage.setItem("onnesha-articles", JSON.stringify(updated));
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Reading progress tracker (modal vs standalone window scroll)
  useEffect(() => {
    if (isModal) {
      const handleScroll = () => {
        if (!containerRef.current) return;
        const el = containerRef.current;
        const total = el.scrollHeight - el.clientHeight;
        if (total <= 0) {
          setReadingProgress(0);
        } else {
          const progress = (el.scrollTop / total) * 100;
          setReadingProgress(Math.min(100, Math.max(0, progress)));
        }
      };

      const el = containerRef.current;
      if (el) {
        el.addEventListener("scroll", handleScroll);
        return () => el.removeEventListener("scroll", handleScroll);
      }
    } else {
      const handleWindowScroll = () => {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) {
          setReadingProgress(0);
        } else {
          const progress = (window.scrollY / docHeight) * 100;
          setReadingProgress(Math.min(100, Math.max(0, progress)));
        }
      };

      window.addEventListener("scroll", handleWindowScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleWindowScroll);
    }
  }, [isModal]);

  const handleClap = () => {
    const updatedClaps = claps + 1;
    setClaps(updatedClaps);
    if (onUpdateArticle) {
      onUpdateArticle({ ...article, claps: updatedClaps });
    }
    showToast("👏 Applauded story!");
  };

  const handleLike = () => {
    const updatedLikes = likes + 1;
    setLikes(updatedLikes);
    if (onUpdateArticle) {
      onUpdateArticle({ ...article, likes: updatedLikes });
    }
    showToast("❤️ Liked story!");
  };

  const getArticleUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${article.slug}`;
    }
    return `/blog/${article.slug}`;
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(getArticleUrl());
      setCopied(true);
      showToast("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(getArticleUrl());
    const text = encodeURIComponent(`Reading "${article.title}" on Onnesha:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank", "noopener,noreferrer");
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  // Reusable Article Body & Meta Content
  const articleContent = (
    <article className="space-y-8 text-left w-full">
      {/* Article Header Meta */}
      <div className="space-y-4">
        {/* Category Pill and Read Time */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <span className="px-3 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-xs font-mono font-extrabold uppercase tracking-wider shadow-sm">
            {article.category}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {article.readTime}
          </span>
        </div>

        {/* Headline */}
        <h1 className="hero-title font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 tracking-tight leading-tight sm:leading-snug break-words">
          {article.title}
        </h1>

        {/* Author Info Row & Share Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200">
          <div className="flex items-center gap-3">
            <img
              src={article.authorAvatar}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-lime-400 shrink-0"
              alt={article.author}
            />
            <div className="flex flex-col justify-center text-left">
              <div className="font-bold text-slate-900 text-sm leading-snug">
                {article.author}
              </div>
              <div className="text-xs font-mono text-slate-500 leading-snug">
                Published {article.date}
              </div>
            </div>
          </div>

          {/* Share Row */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-slate-500 text-[11px] font-mono font-bold tracking-wider mr-1">
              SHARE:
            </span>
            <button
              onClick={shareOnTwitter}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-950 transition shadow-sm"
              title="Share on X"
              type="button"
            >
              <FaXTwitter className="text-xs sm:text-sm" />
            </button>
            <button
              onClick={shareOnLinkedIn}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-950 transition shadow-sm"
              title="Share on LinkedIn"
              type="button"
            >
              <FaLinkedinIn className="text-xs sm:text-sm" />
            </button>
            <button
              onClick={handleCopyLink}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-950 transition shadow-sm"
              title="Copy Link"
              type="button"
            >
              {copied ? <FaCheck className="text-lime-700 text-xs" /> : <FaShareNodes className="text-xs sm:text-sm" />}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/9] w-full bg-slate-100 relative shadow-sm border border-slate-200">
        <img
          src={article.coverImage}
          className="w-full h-full object-cover"
          alt={article.title}
        />
      </div>

      {/* Article Body Content */}
      <div
        className="prose max-w-none text-slate-800 text-base sm:text-lg leading-relaxed space-y-6 pt-2 break-words"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />

      {/* Tags Section */}
      <div className="pt-6 border-t border-slate-200 space-y-3">
        <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
          Article Index Tags:
        </span>
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-white border border-slate-200 hover:border-lime-400 hover:bg-lime-50 text-xs text-slate-700 font-mono shadow-sm transition cursor-default"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Appreciation / Reaction Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-lime-50/70 border border-lime-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 my-8">
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
            Enjoyed this technical dispatch?
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Applaud, like, or bookmark this post to support independent engineering writing.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleClap}
            className="px-4 py-2 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 text-slate-900 font-bold text-xs flex items-center gap-2 transition shadow-sm"
            type="button"
          >
            <FaHandsClapping className="text-lime-700 text-sm" />
            <span>Applaud ({claps})</span>
          </button>

          <button
            onClick={handleLike}
            className="px-4 py-2 rounded-full bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-900 font-bold text-xs flex items-center gap-2 transition shadow-sm"
            type="button"
          >
            <FaHeart className="text-rose-500 text-sm" />
            <span>Like ({likes})</span>
          </button>
        </div>
      </div>

      {/* Author Profile Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <img
          src={article.authorAvatar}
          alt={article.author}
          className="w-16 h-16 rounded-full object-cover border-2 border-lime-400 shrink-0"
        />
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-base text-slate-900">{article.author}</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-[10px] font-mono font-bold">
              Author & Researcher
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Writing technical deep dives on modern web architecture, AI-assisted development pipelines, and high-contrast design systems.
          </p>
        </div>
      </div>

      {/* Related Stories (shown on standalone page or when provided) */}
      {relatedArticles.length > 0 && (
        <div className="pt-8 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xl text-slate-900 tracking-tight">
              Recommended Next Stories
            </h3>
            <Link
              href="/"
              className="text-xs font-bold text-lime-700 hover:text-lime-800 flex items-center gap-1.5 hover:underline"
            >
              <span>View all dispatches</span>
              <FaArrowRight className="text-[10px]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {relatedArticles.map((rel) => (
              <Link
                key={rel.id}
                href={`/blog/${rel.slug}`}
                className="group bg-white border border-slate-200 rounded-3xl p-5 hover:border-lime-400 hover:shadow-md transition-all flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 relative">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-black uppercase shadow-sm">
                      {rel.category}
                    </span>
                  </div>

                  <div className="text-[11px] font-mono text-slate-500">
                    {rel.date} • {rel.readTime}
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 group-hover:text-lime-800 transition line-clamp-2">
                    {rel.title}
                  </h4>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {rel.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{rel.author}</span>
                  <span className="text-lime-700 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Read Story →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );

  // Companion Sticky Bar (Used in both modal and page)
  const stickyBar = (
    <div className="sticky top-3 sm:top-5 z-30 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shadow-sm border border-slate-200/90 bg-white/95 backdrop-blur-xl w-full">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-lime-700 transition-colors shrink-0"
        type="button"
      >
        <FaArrowLeft className="text-xs text-slate-600" />
        <span className="hidden sm:inline">Back to stories</span>
        <span className="sm:hidden">Back</span>
      </button>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Applause Clap Button */}
        <button
          onClick={handleClap}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-lime-50 border border-slate-200 hover:border-lime-300 text-xs flex items-center gap-1.5 text-slate-800 transition shadow-sm"
          title="Give Claps"
          type="button"
        >
          <FaHandsClapping className="text-lime-700 text-xs" />
          <span className="font-bold">{claps}</span>
        </button>

        {/* Heart Like Button */}
        <button
          onClick={handleLike}
          className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-xs flex items-center gap-1.5 text-slate-800 transition shadow-sm"
          title="Like Article"
          type="button"
        >
          <FaHeart className="text-rose-500 text-xs" />
          <span className="font-bold">{likes}</span>
        </button>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`p-1.5 sm:p-2 rounded-full border transition shadow-sm ${
            isBookmarked
              ? "bg-lime-100 border-lime-300 text-lime-800"
              : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-slate-900"
          }`}
          title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
          type="button"
        >
          {isBookmarked ? (
            <FaBookmark className="text-lime-700 text-xs" />
          ) : (
            <FaRegBookmark className="text-xs text-slate-600" />
          )}
        </button>

        {/* Share Link */}
        <button
          onClick={handleCopyLink}
          className="p-1.5 sm:p-2 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 text-xs transition shadow-sm"
          title="Share Link"
          type="button"
        >
          {copied ? <FaCheck className="text-lime-700 text-xs" /> : <FaShareNodes className="text-xs" />}
        </button>

        {/* Close Button - Only in Modal Mode */}
        {isModal && (
          <button
            onClick={handleBack}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 flex items-center justify-center font-black transition shadow-sm ml-0.5 sm:ml-1"
            title="Close Reader"
            type="button"
          >
            <FaXmark className="text-xs sm:text-sm" />
          </button>
        )}
      </div>
    </div>
  );

  // MODE A: MODAL OVERLAY (When opened from Home preview)
  if (isModal) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md overflow-y-auto transition-all p-3 sm:p-6 flex justify-center items-start text-left"
      >
        {/* Top Reading Progress Indicator Bar */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
          <div
            className="h-full bg-lime-500 shadow-sm transition-all duration-100 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>

        <div className="relative w-full max-w-4xl bg-white border border-slate-200 rounded-3xl shadow-2xl p-4 sm:p-8 my-4 sm:my-8 space-y-6">
          {stickyBar}
          {articleContent}
        </div>
      </div>
    );
  }

  // MODE B: NATIVE PAGE FLOW (When on /blog/[slug])
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-8 text-left">
      {/* Top Reading Progress Indicator Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div
          className="h-full bg-lime-500 shadow-sm transition-all duration-100 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 overflow-x-auto whitespace-nowrap pt-2">
        <Link href="/" className="hover:text-lime-800 transition">
          Home
        </Link>
        <span>/</span>
        <Link href="/" className="hover:text-lime-800 transition">
          Stories
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{article.category}</span>
      </nav>

      {/* Sticky Companion Action Capsule */}
      {stickyBar}

      {/* Full Article Content */}
      {articleContent}
    </div>
  );
}

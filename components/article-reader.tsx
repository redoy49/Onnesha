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
  FaArrowUpRightFromSquare,
  FaChevronDown,
  FaChevronUp,
  FaShieldHalved,
  FaBolt,
  FaCopy,
  FaClock,
} from "react-icons/fa6";
import { Article } from "@/types/article";
import { useToast } from "./toast";
import { generateSocialDistribution } from "@/lib/ai/social-curator";
import { GoogleAdBanner } from "./google-ad-banner";

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
  const [isSourcesExpanded, setIsSourcesExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const handleCopySocialPost = async () => {
    try {
      const socialPkg = article.socialSnippets?.linkedin
        ? article.socialSnippets.linkedin
        : generateSocialDistribution(
            article.title,
            article.slug,
            article.excerpt,
            article.tags || ["Tech"],
            article.sources?.length || 16,
            article.rigorScore || 98
          ).linkedinPost;

      await navigator.clipboard.writeText(socialPkg);
      showToast("১-ক্লিক লিঙ্কডইন পোস্ট টেক্সট কপি হয়েছে!");
    } catch {
      showToast("সোশ্যাল পোস্ট কপি করা যায়নি।");
    }
  };

  // Sanitize and ensure responsive containers for embedded content
  const cleanBody = React.useMemo(() => {
    if (!article.body) return "";
    let body = article.body
      .replace(
        /<(?:h[1-6]|section|div)[^>]*>[\s\S]*?(?:তথ্যসূত্র|External Citations|Verified Multi-Page Citations|Verified External Citations|যাচাইকৃত রেফারেন্স|সাইটেশন)[\s\S]*$/i,
        ""
      )
      .replace(/<pre[^>]*class="[^"]*mermaid[^"]*"[^>]*>[\s\S]*?<\/pre>/gi, "")
      .replace(/<div[^>]*class="[^"]*mermaid[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "")
      .replace(/flowchart\s+(?:TD|LR|TB|BT)[\s\S]*?(?=(?:<h[1-6]|\n\n|$))/gi, "")
      .trim();

    return body;
  }, [article.body]);

  const getHostname = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

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
    showToast("Applauded story!");
  };

  const handleLike = () => {
    const updatedLikes = likes + 1;
    setLikes(updatedLikes);
    if (onUpdateArticle) {
      onUpdateArticle({ ...article, likes: updatedLikes });
    }
    showToast("Liked story!");
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

  // Companion Sticky Bar (Floating action bar for reader)
  const stickyBar = (
    <div className="sticky top-3 sm:top-5 z-40 rounded-full px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between shadow-sm border border-slate-200/90 bg-white/95 backdrop-blur-xl w-full">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-lime-700 transition-colors shrink-0"
        type="button"
      >
        <FaArrowLeft className="text-xs text-slate-600" />
        <span className="inline font-bold">Back to stories</span>
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 flex items-center justify-center font-bold transition shadow-sm ml-0.5 sm:ml-1"
            title="Close Reader"
            type="button"
          >
            <FaXmark className="text-xs sm:text-sm" />
          </button>
        )}
      </div>
    </div>
  );

  // Full-Width Article Header & Hero Visual (Matching Home Page HeroBanner)
  const headerAndCover = (
    <div className="space-y-6 w-full text-left">
      {/* Category Pill and Read Time */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <span className="px-3 py-1 rounded-full bg-lime-100 text-lime-900 border border-lime-300 text-xs font-mono font-bold uppercase tracking-wider shadow-sm">
          {article.category}
        </span>
        <span className="text-xs font-mono text-slate-500">
          {article.readTime}
        </span>
      </div>

      {/* Headline */}
      <h1 className="hero-title font-extrabold font-serif text-2xl sm:text-3xl lg:text-5xl leading-[1.1] text-slate-900 tracking-tight break-words">
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
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-900 transition shadow-sm"
            title="Share on X"
            type="button"
          >
            <FaXTwitter className="text-xs sm:text-sm" />
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-900 transition shadow-sm"
            title="Share on LinkedIn"
            type="button"
          >
            <FaLinkedinIn className="text-xs sm:text-sm" />
          </button>
          <button
            onClick={handleCopyLink}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-lime-400 border border-slate-200 hover:border-lime-400 flex items-center justify-center text-slate-700 hover:text-slate-900 transition shadow-sm"
            title="Copy Link"
            type="button"
          >
            {copied ? <FaCheck className="text-lime-700 text-xs" /> : <FaShareNodes className="text-xs sm:text-sm" />}
          </button>
          <button
            onClick={handleCopySocialPost}
            className="px-3 py-1.5 rounded-full bg-lime-100 hover:bg-lime-300 border border-lime-300 text-lime-950 text-xs font-bold font-mono flex items-center gap-1.5 transition shadow-sm ml-1"
            title="Copy 1-Click LinkedIn Technical Briefing"
            type="button"
          >
            <FaBolt className="text-xs text-lime-800" />
            <span>1-Click Post</span>
          </button>
        </div>
      </div>

      {/* Wide Curved Hero Visual Banner (Exact Match to Home Page HeroBanner) */}
      <div className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden group border border-slate-200/90 shadow-md block">
        <div className="aspect-[21/9] min-h-[280px] sm:min-h-[380px] w-full bg-slate-100 relative overflow-hidden">
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

          {/* Floating Glass Overlay Bar on Image */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
                {article.category}
              </span>
              {article.tags.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/30"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-white text-xs font-mono bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <FaClock className="text-lime-400" /> {article.readTime}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Reusable Article Body & Reading Content Column
  const readingColumn = (
    <article className="space-y-8 text-left w-full">
      {/* Sticky Companion Action Capsule */}
      {stickyBar}

      {/* Article Body Content */}
      <div
        className="prose max-w-none font-serif text-slate-800 text-base leading-[1.85] font-normal space-y-6 pt-2 break-words"
        dangerouslySetInnerHTML={{ __html: cleanBody }}
      />

      {/* Smart Non-Intrusive Research Dossier & Citations Drawer */}
      {article.sources && article.sources.length > 0 && (
        <section className="pt-6 border-t border-slate-200">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 transition shadow-sm hover:border-slate-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                  <FaShieldHalved className="text-base" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800">
                      গবেষণা ও যাচাইকৃত তথ্যসূত্র (Research Citations)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold">
                      {article.sources.length} Sources
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    যাচাইকৃত রেফারেন্স এবং তথ্যসূত্র তালিকা
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSourcesExpanded(!isSourcesExpanded)}
                className={`px-4 py-2 rounded-full text-xs font-bold font-mono transition flex items-center gap-2 self-start sm:self-auto border ${
                  isSourcesExpanded
                    ? "bg-slate-200 text-slate-800 border-slate-300"
                    : "lime-cta-btn"
                }`}
                aria-expanded={isSourcesExpanded}
              >
                <span>
                  {isSourcesExpanded
                    ? "তথ্যসূত্র লুকান (Collapse)"
                    : `${article.sources.length}টি তথ্যসূত্র দেখুন (View Sources)`}
                </span>
                {isSourcesExpanded ? (
                  <FaChevronUp className="text-[11px]" />
                ) : (
                  <FaChevronDown className="text-[11px]" />
                )}
              </button>
            </div>

            {/* Collapsible Source List (Clean 2-Column Responsive Grid) */}
            {isSourcesExpanded && (
              <div className="mt-5 pt-4 border-t border-slate-200 space-y-4 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {article.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-3 rounded-xl bg-white border border-slate-200 hover:border-lime-400 hover:bg-lime-50/30 transition shadow-sm flex items-start gap-3"
                    >
                      <span className="shrink-0 w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-lime-200 text-slate-700 group-hover:text-slate-900 text-[11px] font-mono font-bold flex items-center justify-center transition">
                        {(idx + 1).toString().padStart(2, "0")}
                      </span>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="text-xs font-semibold text-slate-800 group-hover:text-lime-900 line-clamp-1">
                          {source.title}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 group-hover:text-slate-600">
                          <span className="truncate">{getHostname(source.url)}</span>
                          <FaArrowUpRightFromSquare className="text-[9px] shrink-0 opacity-70 group-hover:opacity-100" />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

              </div>
            )}
          </div>
        </section>
      )}

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
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-900 text-[10px] font-bold uppercase shadow-sm">
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

  if (isModal) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-start overflow-y-auto p-4 sm:p-6"
      >
        <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 relative my-8 shadow-2xl border border-slate-200 space-y-8 text-left">
          {headerAndCover}
          {readingColumn}
        </div>
      </div>
    );
  }

  // Native Full Page View (No modal pop-up) - 2-Column Grid Layout Matching Home Page
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 text-left">
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

      {/* Top Full-Width Article Header & 21:9 Hero Image (Same width & format as Home Hero) */}
      {headerAndCover}

      {/* Main 2-Column Content Layout: Left Column Google Ads, Right Column Article Reading */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 w-full pt-4">
        {/* Left Column: Google Ads Trial Demo (Sticky on Desktop, Natural Flow on Mobile) */}
        <div className="lg:col-span-3 lg:self-start lg:sticky lg:top-24">
          <GoogleAdBanner slotId="onnesha-blog-sidebar" />
        </div>

        {/* Right Column: Article Reading Experience */}
        <div className="lg:col-span-9 space-y-8 min-w-0">
          {readingColumn}
        </div>
      </div>
    </div>
  );
}

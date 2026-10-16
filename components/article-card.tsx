"use client";

import React from "react";
import { FaBookmark, FaRegBookmark, FaArrowRight } from "react-icons/fa6";
import { Article, LayoutMode } from "@/types/article";

interface ArticleCardProps {
  article: Article;
  layoutMode: LayoutMode;
  onReadArticle: (article: Article) => void;
  onToggleBookmark: (id: number | string, e: React.MouseEvent) => void;
}

export function ArticleCard({
  article,
  layoutMode,
  onReadArticle,
  onToggleBookmark,
}: ArticleCardProps) {
  const isBookmarked = article.bookmarked;

  if (layoutMode === "grid") {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-lime-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-sm text-left">
        <div className="space-y-4">
          <div
            className="aspect-[16/9] rounded-2xl overflow-hidden relative cursor-pointer bg-slate-100"
            onClick={() => onReadArticle(article)}
          >
            <img
              src={article.coverImage}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              alt={article.title}
            />
            <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-lime-400 text-slate-950 text-[10px] font-extrabold uppercase shadow-sm">
              {article.category}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-2">
              <span>{article.date}</span> • <span>{article.readTime}</span>
            </div>
            <h3
              onClick={() => onReadArticle(article)}
              className="font-extrabold text-lg text-slate-900 group-hover:text-lime-700 transition-colors cursor-pointer line-clamp-2"
            >
              {article.title}
            </h3>
            <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src={article.authorAvatar}
              className="w-7 h-7 rounded-full border border-lime-400 object-cover"
              alt={article.author}
            />
            <span className="text-xs font-bold text-slate-800">
              {article.author}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => onToggleBookmark(article.id, e)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-lime-700 transition"
              title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
              type="button"
            >
              {isBookmarked ? (
                <FaBookmark className="text-lime-700 text-sm" />
              ) : (
                <FaRegBookmark className="text-sm" />
              )}
            </button>
            <button
              onClick={() => onReadArticle(article)}
              className="text-xs font-bold text-lime-700 hover:text-lime-800 flex items-center gap-1 hover:underline"
              type="button"
            >
              Read <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: List View
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-lime-400 hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6 group shadow-sm text-left">
      <div
        className="w-full sm:w-48 h-36 shrink-0 rounded-2xl overflow-hidden relative cursor-pointer bg-slate-100"
        onClick={() => onReadArticle(article)}
      >
        <img
          src={article.coverImage}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          alt={article.title}
        />
        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-lime-400 text-slate-950 text-[10px] font-extrabold uppercase shadow-sm">
          {article.category}
        </span>
      </div>

      <div className="flex-1 space-y-2 w-full">
        <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>{article.date}</span> • <span>{article.readTime}</span>
          </div>
          <button
            onClick={(e) => onToggleBookmark(article.id, e)}
            className="hover:text-lime-700 transition p-1 text-slate-400"
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            type="button"
          >
            {isBookmarked ? (
              <FaBookmark className="text-lime-700 text-sm" />
            ) : (
              <FaRegBookmark className="text-sm" />
            )}
          </button>
        </div>

        <h3
          onClick={() => onReadArticle(article)}
          className="font-extrabold text-xl text-slate-900 group-hover:text-lime-700 transition-colors cursor-pointer line-clamp-1"
        >
          {article.title}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <img
              src={article.authorAvatar}
              className="w-6 h-6 rounded-full border border-lime-400 object-cover"
              alt={article.author}
            />
            <span className="text-xs font-bold text-slate-800">
              {article.author}
            </span>
          </div>
          <button
            onClick={() => onReadArticle(article)}
            className="text-xs font-extrabold text-lime-700 hover:text-lime-800 flex items-center gap-1.5 hover:underline"
            type="button"
          >
            <span>Read article</span>
            <FaArrowRight className="text-[10px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { FaArrowRight, FaClock } from "react-icons/fa6";
import { Article } from "@/types/article";

interface HeroBannerProps {
  featuredArticle: Article;
  onReadArticle: (article: Article) => void;
}

export function HeroBanner({ featuredArticle, onReadArticle }: HeroBannerProps) {
  return (
    <section id="heroSection" className="pt-6 sm:pt-8 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 text-left">
        <div className="max-w-3xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-lime-100 border border-lime-300 text-lime-900 text-xs font-bold uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lime-600 animate-pulse"></span>
            FEATURED TECH DISPATCH
          </div>
          <h1
            onClick={() => onReadArticle(featuredArticle)}
            className="hero-title font-extrabold text-3xl sm:text-5xl lg:text-6xl text-slate-900 tracking-tight cursor-pointer hover:text-lime-700 transition-colors"
          >
            {featuredArticle.title}
          </h1>
        </div>

        {/* Top Right Author Snippet */}
        <div className="flex items-center gap-4 border-l-2 border-lime-400 pl-4 py-1">
          <img
            src={featuredArticle.authorAvatar}
            className="w-12 h-12 rounded-full object-cover border-2 border-lime-400 shrink-0"
            alt={featuredArticle.author}
          />
          <div className="text-xs space-y-0.5">
            <p className="text-slate-500 font-mono">A limited Onnesha pop up</p>
            <p className="font-bold text-slate-800">
              By {featuredArticle.author} • {featuredArticle.date}
            </p>
            <button
              onClick={() => onReadArticle(featuredArticle)}
              className="text-lime-700 hover:text-lime-800 font-bold text-xs hover:underline flex items-center gap-1 transition-colors"
            >
              Read full story <FaArrowRight className="text-[10px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Wide Curved Hero Visual Banner */}
      <div
        className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden group cursor-pointer border border-slate-200/90 shadow-md"
        onClick={() => onReadArticle(featuredArticle)}
      >
        <div className="aspect-[21/9] min-h-[280px] sm:min-h-[380px] w-full bg-slate-100 relative overflow-hidden">
          <img
            src={featuredArticle.coverImage}
            alt="Hero Architecture Visual"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>

          {/* Floating Glass Overlay Bar on Image */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-lime-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-sm">
                {featuredArticle.category}
              </span>
              {featuredArticle.tags.slice(0, 2).map((tag, i) => (
                <span
                  key={i}
                  className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/30"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-white text-xs font-mono bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
              <FaClock className="text-lime-400" /> {featuredArticle.readTime}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

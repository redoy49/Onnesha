"use client";

import React, { useState, useEffect, useMemo } from "react";
import { initialArticles } from "@/lib/data/articles";
import { Article, CategoryFilter, LayoutMode } from "@/types/article";
import { Header } from "@/components/header";
import { HeroBanner } from "@/components/hero-banner";
import { FilterSidebar } from "@/components/filter-sidebar";
import { CategoryPills } from "@/components/category-pills";
import { ArticleCard } from "@/components/article-card";
import { ArticleReader } from "@/components/article-reader";
import { MembershipTiers } from "@/components/membership-tiers";
import { WriteModal } from "@/components/write-modal";
import { useToast } from "@/components/toast";
import { useAuth } from "@/components/auth-context";
import { FaFolderOpen, FaArrowDown } from "react-icons/fa6";

export default function HomePage() {
  const { showToast } = useToast();
  const { isAdmin } = useAuth();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [currentCategory, setCurrentCategory] = useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuickTags, setSelectedQuickTags] = useState<string[]>(["UX Design"]);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("list");
  const [activeReaderArticle, setActiveReaderArticle] = useState<Article | null>(null);

  // Sync with /api/articles on client mount & window focus, with localStorage fallback
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const res = await fetch("/api/articles");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
            setArticles(data.articles);
            localStorage.setItem("onnesha-articles", JSON.stringify(data.articles));
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch /api/articles, falling back to local:", err);
      }

      const saved = localStorage.getItem("onnesha-articles");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setArticles(parsed);
          }
        } catch (e) {
          console.error("Failed to load saved articles:", e);
        }
      }
    };

    loadArticles();
    window.addEventListener("focus", loadArticles);
    return () => window.removeEventListener("focus", loadArticles);
  }, []);

  const saveArticles = async (newArticles: Article[]) => {
    setArticles(newArticles);
    localStorage.setItem("onnesha-articles", JSON.stringify(newArticles));
  };

  // Filter logic
  const filteredArticles = useMemo(() => {
    return articles.filter((post) => {
      // Saved filter
      if (currentCategory === "Saved" && !post.bookmarked) return false;

      // Category filter
      if (
        currentCategory !== "All" &&
        currentCategory !== "Saved" &&
        post.category !== currentCategory
      ) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesAuthor = post.author.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExcerpt && !matchesAuthor) return false;
      }

      // Quick tags filter (only when in All category)
      if (selectedQuickTags.length > 0 && currentCategory === "All") {
        const hasTag = post.tags.some((tag) => selectedQuickTags.includes(tag));
        if (!hasTag) return false;
      }

      return true;
    });
  }, [articles, currentCategory, searchQuery, selectedQuickTags]);

  const bookmarkCount = useMemo(() => {
    return articles.filter((a) => a.bookmarked).length;
  }, [articles]);

  const featuredArticle = useMemo(() => {
    return articles.find((a) => a.featured) || articles[0];
  }, [articles]);

  const handleToggleBookmark = (id: number | string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = articles.map((a) => {
      if (a.id === id) {
        const nextState = !a.bookmarked;
        showToast(nextState ? "Saved to bookmarks" : "Removed from bookmarks");
        return { ...a, bookmarked: nextState };
      }
      return a;
    });
    saveArticles(updated);
    if (activeReaderArticle && activeReaderArticle.id === id) {
      setActiveReaderArticle({
        ...activeReaderArticle,
        bookmarked: !activeReaderArticle.bookmarked,
      });
    }
  };

  const handleToggleTag = (tag: string) => {
    if (selectedQuickTags.includes(tag)) {
      setSelectedQuickTags(selectedQuickTags.filter((t) => t !== tag));
    } else {
      setSelectedQuickTags([...selectedQuickTags, tag]);
    }
  };

  const handlePublishArticle = (newPost: Article) => {
    const updated = [newPost, ...articles];
    saveArticles(updated);
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updated = articles.map((a) =>
      a.id === updatedArticle.id ? updatedArticle : a
    );
    saveArticles(updated);
    setActiveReaderArticle(updatedArticle);
  };

  const handleResetFilters = () => {
    setCurrentCategory("All");
    setSearchQuery("");
    setSelectedQuickTags(["UX Design"]);
    showToast("Reset all filters");
  };

  return (
    <>
      {/* Floating Capsule Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bookmarkCount={bookmarkCount}
        onBookmarkClick={() => setCurrentCategory("Saved")}
        onCategorySelect={(cat) => setCurrentCategory(cat as CategoryFilter)}
      />

      {/* Hero Banner */}
      {featuredArticle && (
        <HeroBanner
          featuredArticle={featuredArticle}
          onReadArticle={(art) => setActiveReaderArticle(art)}
        />
      )}

      {/* Main Content Layout */}
      <main id="feedSection" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Quick Filters & Sidebar */}
          <FilterSidebar
            selectedTags={selectedQuickTags}
            onToggleTag={handleToggleTag}
          />

          {/* Right Column: Article Feed & List View */}
          <div className="lg:col-span-9 space-y-6">
            {/* Category Pills & Layout Toggle Bar */}
            <CategoryPills
              currentCategory={currentCategory}
              onSelectCategory={setCurrentCategory}
              layoutMode={layoutMode}
              onToggleLayout={setLayoutMode}
            />

            {/* Articles Feed */}
            {filteredArticles.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center mx-auto text-2xl shadow-sm">
                  <FaFolderOpen />
                </div>
                <h3 className="font-extrabold text-xl text-slate-900">
                  No matching articles found
                </h3>
                <p className="text-slate-600 text-xs max-w-md mx-auto">
                  Try clearing search keywords or switching category filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-sm transition"
                  type="button"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={
                  layoutMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0"
                    : "space-y-4"
                }
              >
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    layoutMode={layoutMode}
                    onReadArticle={(art) => setActiveReaderArticle(art)}
                    onToggleBookmark={handleToggleBookmark}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            <div className="pt-8 text-center">
              <button
                onClick={() => showToast("Loaded latest dispatches!")}
                className="px-8 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs uppercase tracking-widest font-black shadow-sm hover:scale-105 transition-all inline-flex items-center gap-2"
                type="button"
              >
                <span>See more articles</span>
                <FaArrowDown className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Membership Callout Banner */}
      <MembershipTiers />

      {/* Write Story Modal (Admin Only) */}
      {isAdmin && <WriteModal onPublishArticle={handlePublishArticle} />}

      {/* Full-Bleed Article Reader Modal */}
      {activeReaderArticle && (
        <ArticleReader
          article={activeReaderArticle}
          isModal={true}
          onClose={() => setActiveReaderArticle(null)}
          onToggleBookmark={(id) => handleToggleBookmark(id)}
          onUpdateArticle={handleUpdateArticle}
        />
      )}
    </>
  );
}

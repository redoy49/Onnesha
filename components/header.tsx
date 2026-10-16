"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaMagnifyingGlass,
  FaLock,
  FaWandMagicSparkles,
  FaBars,
  FaXmark,
  FaArrowRight,
} from "react-icons/fa6";
import { useAuth } from "./auth-context";

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  bookmarkCount?: number;
  onBookmarkClick?: () => void;
  onCategorySelect?: (category: string) => void;
}

export function Header({
  searchQuery = "",
  onSearchChange,
  onCategorySelect,
}: HeaderProps) {
  const { isAdmin, openAdminModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleNavClick = (category?: string) => {
    if (category && onCategorySelect) {
      onCategorySelect(category);
    }
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  };

  return (
    <div className="sticky top-3 sm:top-4 z-40 max-w-7xl mx-auto px-3 sm:px-4 w-full pointer-events-none">
      {/* Main Pill Navbar */}
      <header className="glass-pill rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm border border-slate-200/90 bg-white/95 backdrop-blur-xl pointer-events-auto transition-all">
        {/* Brand Logo */}
        <Link
          href="/"
          onClick={() => handleNavClick("All")}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 flex items-center justify-center font-black text-xs sm:text-sm shadow-sm transition-transform group-hover:scale-105">
            ⚡
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
              ONNESHA
            </span>
          </div>
        </Link>

        {/* Desktop Central Navigation Links (About & Saved removed) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold tracking-wider uppercase text-slate-600">
          <Link href="/" className="hover:text-lime-700 transition-colors">
            Home
          </Link>
          <button
            onClick={() => handleNavClick("All")}
            className="hover:text-lime-700 transition-colors uppercase font-bold"
            type="button"
          >
            Stories
          </button>
          <button
            onClick={() => handleNavClick("AI & Prompts")}
            className="hover:text-lime-700 transition-colors uppercase font-bold"
            type="button"
          >
            AI & Tech
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Search Input */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              placeholder="Search stories..."
              className="w-36 md:w-48 lg:w-56 bg-slate-100 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-full py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100 transition-all"
            />
            <FaMagnifyingGlass className="absolute left-2.5 top-2 text-slate-400 text-[11px]" />
          </div>

          {/* Mobile Search Toggle Icon */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center justify-center"
            title="Search"
            type="button"
          >
            <FaMagnifyingGlass className="text-xs" />
          </button>

          {/* Role-Based CTA: Only Admin can post/write */}
          {isAdmin ? (
            /* Admin view: Direct Dashboard Link with AI Studio */
            <Link
              href="/dashboard"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1.5 shrink-0 transition-colors"
              title="Admin Dashboard"
            >
              <FaWandMagicSparkles className="text-xs text-slate-900" />
              <span className="hidden sm:inline">AI Studio</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          ) : (
            /* Reader view: Clean, discreet Admin Login lock icon button */
            <button
              onClick={openAdminModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 hover:bg-lime-50 border border-slate-200 hover:border-lime-300 text-slate-700 hover:text-lime-800 text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0"
              title="Admin Access (Publishing Controls)"
              type="button"
            >
              <FaLock className="text-[10px] text-lime-700" />
              <span className="hidden sm:inline font-mono text-[11px]">Admin</span>
            </button>
          )}

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center justify-center shrink-0"
            title="Navigation Menu"
            type="button"
          >
            {mobileMenuOpen ? <FaXmark className="text-sm" /> : <FaBars className="text-xs" />}
          </button>
        </div>
      </header>

      {/* Mobile Slide-down Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden mt-2 pointer-events-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-lg">
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                placeholder="Search stories..."
                className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500"
              />
              <FaMagnifyingGlass className="absolute left-3 top-2.5 text-slate-400 text-xs" />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Slide-down Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-2xl border border-slate-200 rounded-3xl p-5 shadow-xl space-y-4 text-left">
            <div className="flex flex-col space-y-1 text-sm font-bold uppercase tracking-wider text-slate-700">
              <Link
                href="/"
                onClick={() => handleNavClick("All")}
                className="p-2.5 rounded-xl hover:bg-lime-50 hover:text-lime-800 transition flex items-center justify-between"
              >
                <span>Home</span>
                <FaArrowRight className="text-xs text-lime-700" />
              </Link>
              <button
                onClick={() => handleNavClick("All")}
                className="p-2.5 rounded-xl hover:bg-lime-50 hover:text-lime-800 transition flex items-center justify-between text-left uppercase"
                type="button"
              >
                <span>All Stories</span>
                <FaArrowRight className="text-xs text-lime-700" />
              </button>
              <button
                onClick={() => handleNavClick("AI & Prompts")}
                className="p-2.5 rounded-xl hover:bg-lime-50 hover:text-lime-800 transition flex items-center justify-between text-left uppercase"
                type="button"
              >
                <span>AI & Prompts</span>
                <FaArrowRight className="text-xs text-lime-700" />
              </button>
              <button
                onClick={() => handleNavClick("Web Development")}
                className="p-2.5 rounded-xl hover:bg-lime-50 hover:text-lime-800 transition flex items-center justify-between text-left uppercase"
                type="button"
              >
                <span>Web Development</span>
                <FaArrowRight className="text-xs text-lime-700" />
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              {isAdmin ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-900 font-extrabold text-xs uppercase text-center flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <FaWandMagicSparkles />
                  <span>Open AI Admin Studio</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAdminModal();
                  }}
                  className="w-full py-2.5 rounded-full bg-slate-100 hover:bg-lime-50 border border-slate-200 hover:border-lime-300 text-slate-700 hover:text-lime-800 text-xs font-bold flex items-center justify-center gap-2 transition"
                  type="button"
                >
                  <FaLock className="text-lime-700 text-xs" />
                  <span>Admin Login (Post with AI)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

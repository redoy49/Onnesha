"use client";

import React from "react";
import Link from "next/link";
import { FaDribbble, FaXTwitter, FaLinkedinIn, FaInstagram } from "react-icons/fa6";
import { useAuth } from "./auth-context";

export function Footer() {
  const { isAdmin, openAdminModal } = useAuth();

  return (
    <footer className="mt-auto border-t border-slate-200 py-10 bg-white text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-sm transition">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                ONNESHA
              </span>
              <p className="text-[11px] text-slate-500 font-mono">
                AI-Powered Personal Tech Blog & Systems Architecture
              </p>
            </div>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="https://dribbble.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition shadow-sm"
              title="Dribbble"
            >
              <FaDribbble className="text-sm" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition shadow-sm"
              title="X Social Network"
            >
              <FaXTwitter className="text-sm" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition shadow-sm"
              title="LinkedIn"
            >
              <FaLinkedinIn className="text-sm" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-lime-400 hover:text-slate-950 hover:border-lime-400 transition shadow-sm"
              title="Instagram"
            >
              <FaInstagram className="text-sm" />
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-200 gap-4">
          <p>© {new Date().getFullYear()} Onnesha. All rights reserved. High-Contrast Personal Tech Blog.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-lime-700 transition">
              Home
            </Link>
            <Link href="/about" className="hover:text-lime-700 transition">
              About Author
            </Link>
            {isAdmin ? (
              <Link href="/dashboard" className="text-lime-700 font-bold hover:underline transition">
                ⚡ Admin Dashboard
              </Link>
            ) : (
              <button
                type="button"
                onClick={openAdminModal}
                className="hover:text-lime-700 transition"
              >
                Admin Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

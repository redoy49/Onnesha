"use client";

import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { FaLock, FaUserShield, FaXmark, FaKey, FaArrowRight, FaArrowRightFromBracket, FaWandMagicSparkles } from "react-icons/fa6";
import Link from "next/link";

export function AdminLoginModal() {
  const { role, isAdmin, loginAsAdmin, logout, isAdminModalOpen, closeAdminModal } = useAuth();
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAdminModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const success = loginAsAdmin(password);
    if (!success) {
      setErrorMsg("Incorrect password. Default demo password is: admin");
    } else {
      setPassword("");
    }
  };

  const handleQuickLogin = () => {
    setErrorMsg("");
    loginAsAdmin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center text-lg shadow-sm">
              <FaUserShield />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-slate-900">
                Admin Portal Access
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Current Role: <span className="font-bold text-lime-800 uppercase">{role}</span>
              </p>
            </div>
          </div>
          <button
            onClick={closeAdminModal}
            className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition"
            type="button"
          >
            <FaXmark className="text-sm" />
          </button>
        </div>

        {isAdmin ? (
          /* Already Admin View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-lime-50 border border-lime-300 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-lime-800">
                <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse"></span>
                <span>AUTHENTICATED AS ADMIN</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                You have full access to generate, write, and publish blogs using ChatGPT, Claude, Gemini, Grok, Kimi, and DeepSeek.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                href="/dashboard"
                onClick={closeAdminModal}
                className="w-full py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
              >
                <FaWandMagicSparkles />
                <span>Go to AI Admin Dashboard</span>
                <FaArrowRight className="text-xs" />
              </Link>

              <button
                type="button"
                onClick={logout}
                className="w-full py-2.5 rounded-full border border-slate-300 text-xs text-slate-600 hover:text-rose-600 transition flex items-center justify-center gap-2"
              >
                <FaArrowRightFromBracket className="text-xs" />
                <span>Switch to Reader Mode (Read-Only)</span>
              </button>
            </div>
          </div>
        ) : (
          /* Reader Login View */
          <div className="space-y-5">
            <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-semibold text-slate-900 mb-1">
                🔒 Protected Publishing Controls
              </p>
              Only authorized Admins can generate and publish articles using the AI engines (ChatGPT, Claude, Gemini, Grok, Kimi, DeepSeek). Readers have read-only access.
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <FaKey className="text-lime-700 text-[10px]" />
                  <span>ADMIN ACCESS PASSWORD</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (e.g. admin)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-100"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 font-mono">{errorMsg}</p>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <FaLock className="text-xs" />
                  <span>Sign In as Admin</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickLogin}
                  className="w-full py-2.5 rounded-full bg-lime-50 border border-lime-300 text-lime-900 hover:bg-lime-100 transition-all text-xs font-bold flex items-center justify-center gap-2"
                >
                  <span>⚡ 1-Click Demo Admin Login</span>
                </button>
              </div>
            </form>

            <p className="text-[11px] text-center text-slate-500 font-mono">
              Tip: Default demo password is <span className="font-bold text-lime-800">admin</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

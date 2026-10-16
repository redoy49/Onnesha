"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Header } from "@/components/header";
import { FaShieldHalved, FaKey, FaLock, FaArrowLeft } from "react-icons/fa6";
import Link from "next/link";

export default function WritePageRedirect() {
  const router = useRouter();
  const { isAdmin, loginAsAdmin } = useAuth();
  const [password, setPassword] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState("");

  useEffect(() => {
    if (isAdmin) {
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = loginAsAdmin(password);
    if (!ok) {
      setErrorMsg("Incorrect password. Default demo password is: admin");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-md text-center">
          <div className="w-16 h-16 rounded-3xl bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
            <FaShieldHalved />
          </div>

          <div className="space-y-2">
            <h1 className="font-extrabold text-2xl text-slate-900">
              Admin Studio Protected
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              Only authorized Admins can generate and publish blogs using ChatGPT, Claude, Gemini, Grok, Kimi, and DeepSeek. Readers have read-only access.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-mono text-slate-600 mb-1 flex items-center gap-1.5">
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

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition"
              >
                <FaLock className="text-xs" />
                <span>Sign In as Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsAdmin();
                  router.push("/dashboard");
                }}
                className="w-full py-2.5 rounded-full bg-lime-50 border border-lime-300 text-lime-900 hover:bg-lime-100 transition-all text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>⚡ 1-Click Demo Admin Login</span>
              </button>
            </div>
          </form>

          <div className="pt-2 border-t border-slate-200">
            <Link
              href="/"
              className="text-xs text-slate-600 hover:text-lime-700 transition flex items-center justify-center gap-1.5"
            >
              <FaArrowLeft className="text-[10px]" />
              <span>Return to Public Reader Feed</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import { FaRotateRight, FaTriangleExclamation } from "react-icons/fa6";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App boundary error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-md">
        <div className="w-16 h-16 rounded-full bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center mx-auto text-2xl shadow-sm">
          <FaTriangleExclamation />
        </div>

        <div className="space-y-2">
          <h2 className="font-extrabold text-2xl text-slate-900">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-600">
            An unexpected error occurred while rendering this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm transition"
            type="button"
          >
            <FaRotateRight className="text-xs" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full border border-slate-300 text-xs text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition w-full sm:w-auto text-center"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { FaCompass, FaHouse } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-10 space-y-6 shadow-md">
        <div className="w-20 h-20 rounded-full bg-lime-100 text-lime-800 border border-lime-300 flex items-center justify-center mx-auto text-3xl shadow-sm">
          <FaCompass />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-lime-800 uppercase tracking-widest">
            ERROR 404
          </span>
          <h1 className="hero-title font-extrabold text-3xl sm:text-4xl text-slate-900">
            Dispatch Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
            The article, route, or tech dispatch you are looking for has been relocated or does not exist.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="px-8 py-3 rounded-full bg-lime-400 hover:bg-lime-500 text-slate-950 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 shadow-sm hover:scale-105 transition-all"
          >
            <FaHouse className="text-xs" />
            <span>Return to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

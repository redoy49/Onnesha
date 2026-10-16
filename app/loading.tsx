import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8 animate-pulse text-left">
      {/* Floating Header Skeleton */}
      <div className="h-14 bg-obsidian-surface/60 rounded-full border border-obsidian-border max-w-7xl mx-auto" />

      {/* Hero Skeleton */}
      <div className="space-y-4 pt-6">
        <div className="w-48 h-6 bg-obsidian-surface rounded-full" />
        <div className="w-3/4 h-12 bg-obsidian-surface rounded-2xl" />
        <div className="aspect-[21/9] w-full bg-obsidian-surface/80 rounded-[2.5rem] border border-obsidian-border" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="h-64 bg-obsidian-surface/60 rounded-3xl border border-obsidian-border" />
        </div>
        <div className="lg:col-span-9 space-y-4">
          <div className="h-40 bg-obsidian-surface/60 rounded-3xl border border-obsidian-border" />
          <div className="h-40 bg-obsidian-surface/60 rounded-3xl border border-obsidian-border" />
          <div className="h-40 bg-obsidian-surface/60 rounded-3xl border border-obsidian-border" />
        </div>
      </div>
    </div>
  );
}

import React from "react";

/**
 * High-fidelity shimmer skeleton for the Codex Detail Page.
 * Mirrors the exact layout of the page so the skeleton→content
 * transition feels seamless with zero layout shift.
 */
export default function CodexDetailLoading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-20">

      {/* ── Shimmer keyframe via Tailwind arbitrary ── */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(0,0,0,0.04) 40%,
            rgba(0,0,0,0.07) 50%,
            rgba(0,0,0,0.04) 60%,
            transparent 100%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
        .dark .shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.03) 40%,
            rgba(255,255,255,0.06) 50%,
            rgba(255,255,255,0.03) 60%,
            transparent 100%
          );
          background-size: 600px 100%;
          animation: shimmer 1.6s infinite linear;
        }
      `}</style>

      {/* ── Back link ── */}
      <div className="h-3 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-full mb-8 shimmer" />

      {/* ── Author / Meta row ── */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.06] flex-shrink-0 shimmer" />
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-28 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
          <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="h-2.5 w-16 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
          <div className="h-2.5 w-12 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
        </div>
      </div>

      {/* ── Title ── */}
      <div className="space-y-3 mb-4">
        <div className="h-9 w-full bg-slate-100 dark:bg-white/[0.06] rounded-xl shimmer" />
        <div className="h-9 w-4/5 bg-slate-100 dark:bg-white/[0.06] rounded-xl shimmer" />
      </div>

      {/* ── Subtitle ── */}
      <div className="h-5 w-3/5 bg-slate-100 dark:bg-white/[0.06] rounded-full mb-8 shimmer" />

      {/* ── Tags row ── */}
      <div className="flex items-center gap-2 mb-8">
        {[60, 80, 50, 70].map((w, i) => (
          <div
            key={i}
            className="h-6 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* ── Cover Image ── */}
      <div className="w-full aspect-[16/9] bg-slate-100 dark:bg-white/[0.06] rounded-2xl mb-10 shimmer" />

      {/* ── Prose content blocks ── */}
      <div className="space-y-3 mb-8">
        {[100, 95, 88, 100, 72, 100, 92, 80].map((w, i) => (
          <div
            key={i}
            className="h-4 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>

      {/* ── Code block placeholder ── */}
      <div className="w-full h-32 bg-slate-100 dark:bg-white/[0.06] rounded-xl mb-8 shimmer" />

      {/* ── Second prose block ── */}
      <div className="space-y-3 mb-10">
        {[100, 90, 75, 100, 85].map((w, i) => (
          <div
            key={i}
            className="h-4 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-6 py-4 border-t border-b border-slate-100 dark:border-white/[0.05] mb-10">
        {[48, 52, 44, 60].map((w, i) => (
          <div
            key={i}
            className="h-8 bg-slate-100 dark:bg-white/[0.06] rounded-lg shimmer"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>

      {/* ── Comments section header ── */}
      <div className="h-5 w-36 bg-slate-100 dark:bg-white/[0.06] rounded-full mb-6 shimmer" />

      {/* ── Comment items ── */}
      {[1, 2, 3].map((_, i) => (
        <div key={i} className="flex gap-3 mb-5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] flex-shrink-0 shimmer" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-3 w-24 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
            <div className="h-3 w-full bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
            <div className="h-3 w-4/5 bg-slate-100 dark:bg-white/[0.06] rounded-full shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import Link from "next/link";

export default function HomeArtifactCard({ _id, title, description, coverImage, category, rating, author }) {
  return (
    <div className="min-w-[260px] max-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        {coverImage && (
          <img
            src={coverImage}
            alt={title || "Artifact"}
            className="w-full h-36 object-cover rounded-lg mb-3"
          />
        )}
        <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider">
          {category || "Artifact"}
        </span>
        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mt-1">
          {title || "Untitled Artifact"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
          {description || "No description provided."}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {author?.name || "Anonymous"}
        </span>
        <Link
          href={`/blog/${_id || ''}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}

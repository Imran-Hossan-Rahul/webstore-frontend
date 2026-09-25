"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";
import { api } from "@/utils/api";

const CATEGORIES = [
  // { id: "artifacts", label: "Artifacts", placeholder: "What artifact are you looking for?" },
  { id: "codex", label: "Codex", placeholder: "What codex topic are you exploring?" },
  // { id: "engineers", label: "Engineers", placeholder: "Which engineer skill do you need?" },
];

const SUGGESTIONS = {
  artifacts: ["dashboard", "landing", "saas", "portfolio", "mobile app", "e-commerce"],
  codex: ["design trends", "javascript", "react", "ai tools", "case study", "productivity"],
  engineers: ["frontend", "react", "next.js", "node", "fullstack", "ui engineer"],
};

export default function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("codex");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        let data = [];

        if (activeCategory === "artifacts") {
          const res = await api.get(
            `/artifact?search=${encodeURIComponent(query)}&limit=6`
          );
          data = Array.isArray(res?.data)
            ? res.data
            : res?.data?.data || res?.data || [];
        } else if (activeCategory === "codex") {
          const res = await api.get(`/codex`);
          const codex = Array.isArray(res) ? res : res?.data || [];
          data = codex.filter((b) =>
            (b.title || "").toLowerCase().includes(query.toLowerCase())
          );
        } else if (activeCategory === "engineers") {
          data = [];
        }

        setResults(data || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(query)}`);
  };

  const handleResultClick = (id) => {
    if (!id) return;
    router.push(`/artifacts/${id}`);
  };

  const renderSearch = (compact = false) => (
    <form onSubmit={handleSubmit} className="relative">
      <div className={`flex flex-col gap-3 ${compact ? "" : "pt-2"}`}>
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const active = cat.id === activeCategory;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                  active
                    ? "bg-black text-white dark:bg-white dark:text-black border-black/80 dark:border-white/80"
                    : "bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-brand-slate dark:text-slate-300 hover:border-black/30 dark:hover:border-white/30"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div
          className={`flex items-center gap-3 rounded-full border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.45)] transition-all duration-300 ${
            compact ? "px-5 py-3" : "px-6 py-4"
          }`}
        >
          <Search strokeWidth={1.5} className="text-xl text-slate-500 dark:text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              CATEGORIES.find((c) => c.id === activeCategory)?.placeholder ||
              "Search..."
            }
            className="w-full bg-transparent outline-none text-base md:text-lg text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <button type="submit" className="hidden">
            Search
          </button>
        </div>

        {!compact && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-brand-slate dark:text-slate-400">
            <span className="font-semibold">Popular:</span>
            {(SUGGESTIONS[activeCategory] || []).map((tag) => (
              <button
                type="button"
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-slate-900 hover:border-black/30 dark:hover:border-white/30 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {(loading || results.length > 0 || query.trim()) && (
        <div className="absolute z-20 mt-3 w-full rounded-2xl border border-black/5 dark:border-white/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl overflow-hidden">
          {loading ? (
            <div className="px-5 py-4 text-sm text-brand-slate dark:text-slate-300">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {results.map((item) => (
                <li
                  key={item._id || item.id}
                  onClick={() => handleResultClick(item._id || item.id)}
                  className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-brand-cloud/80 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-sm md:text-base text-black dark:text-white line-clamp-1">
                      {item.title || item.name || "Untitled"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {activeCategory === "codex"
                        ? item.author?.name || item.category || "Codex"
                        : activeCategory === "engineers"
                        ? item.role || "Engineer"
                        : item.category || "Artifact"}{" "}
                      {activeCategory === "artifacts" &&
                        `· ${item.priceType === "paid" ? `$${item.price || 0}` : "Free"}`}
                    </p>
                  </div>
                  <ArrowUpRight strokeWidth={1.5} className="text-slate-500 dark:text-slate-400" />
                </li>
              ))}
              <li
                onClick={() => router.push(`/shop?q=${encodeURIComponent(query)}`)}
                className="flex items-center justify-between px-5 py-4 text-sm font-medium text-purple-600 dark:text-purple-300 cursor-pointer hover:bg-purple-50/80 dark:hover:bg-purple-900/30"
              >
                View all results
                <ArrowUpRight strokeWidth={1.5} />
              </li>
            </ul>
          ) : (
            <div className="px-5 py-4 text-sm text-brand-slate dark:text-slate-300">
              No matches found. Try another keyword.
            </div>
          )}
        </div>
      )}
    </form>
  );

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        <div className="space-y-6" id="hero-search-anchor">
          <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Craftsman community
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-left text-black dark:text-white leading-tight">
            Discover the best{" "}
            <span className="text-brand-blue dark:text-indigo-400">
              creative work
            </span>
          </h1>
          <p className="text-base md:text-lg text-left text-brand-slate dark:text-slate-400 max-w-2xl">
            Explore artifacts, codex, and connect with talented craftsmen — all in one place.
          </p>

          {renderSearch()}
        </div>

        <div className="w-full lg:justify-self-end">
          <div className="aspect-video rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur shadow-[0_25px_80px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.45)] flex items-center justify-center text-slate-500 dark:text-slate-400">
            Video placeholder — drop your launch reel here
          </div>
        </div>
      </div>
    </div>
  );
}





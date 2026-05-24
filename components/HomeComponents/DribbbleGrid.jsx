"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Image from "next/image";

export default function DribbbleGrid({
  type = "popular",
  title,
  showFilters = true,
  overlaySignup = false,
}) {
  const router = useRouter();
  const [artifacts, setArtifacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, free, paid

  useEffect(() => {
    fetchArtifacts();
  }, [type, filter]);

  const fetchArtifacts = async () => {
    setLoading(true);
    try {
      let endpoint = "/artifact";
      if (type === "popular") {
        endpoint = "/artifact/featured/popular";
      } else if (type === "trending") {
        endpoint = "/artifact/featured/trending";
      } else if (type === "editors-choice") {
        endpoint = "/artifact/featured/editors-choice";
      } else if (type === "my-artifacts") {
        endpoint = "/artifact/my-artifacts";
      }

      const res = await api.get(endpoint);
      let data = res.data || [];

      // Apply filter
      if (filter === "free") {
        data = data.filter((t) => t.priceType === "free");
      } else if (filter === "paid") {
        data = data.filter((t) => t.priceType === "paid");
      }

      setArtifacts(data.slice(0, 12)); // Show 12 items like Dribbble
    } catch (error) {
      console.error("Error fetching artifacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedArtifacts = overlaySignup ? artifacts.slice(0, 10) : artifacts;
  const showSignupButton = overlaySignup && artifacts.length >= 10;

  if (loading) {
    return (
      <div className="mb-16">
        {title && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">{title}</h2>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-2xl aspect-[4/3] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-16 relative">
      {/* Header with Filters */}
      <div className="flex justify-between items-center mb-6">
        {title && (
          <h2 className="text-2xl font-bold text-black dark:text-white">{title}</h2>
        )}
        {showFilters && (
          <div className="flex gap-2">
            {["all", "free", "paid"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dribbble-style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 relative">
        {displayedArtifacts.map((artifact) => (
          <ArtifactCard
            key={artifact._id || artifact.id}
            artifact={artifact}
            onClick={() => router.push(`/artifacts/${artifact._id || artifact.id}`)}
          />
        ))}
      </div>

      {showSignupButton && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => router.push("/auth/register")}
            className="px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black font-semibold shadow-lg hover:-translate-y-0.5 transition transform"
          >
            Sign up to continue
          </button>
        </div>
      )}

      {artifacts.length === 0 && !loading && (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No artifacts found
        </div>
      )}
    </div>
  );
}

function ArtifactCard({ artifact, onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Image/Preview */}
        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden">
          {artifact.thumbnailSource ? (
            <img
              src={artifact.thumbnailSource}
              alt={artifact.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Overlay on hover */}
          {isHovered && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity">
              <div className="text-white font-semibold">View Details</div>
            </div>
          )}

          {/* Price Badge */}
          {artifact.priceType === "paid" && (
            <div className="absolute top-3 right-3 bg-black dark:bg-white text-white dark:text-black px-3 py-1 rounded-full text-sm font-semibold">
              ${artifact.price}
            </div>
          )}
          {artifact.priceType === "free" && (
            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Free
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-black dark:text-white text-sm line-clamp-1">
              {artifact.title}
            </h3>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{artifact.viewsCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>{artifact.downloadsCount || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{artifact.likeCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



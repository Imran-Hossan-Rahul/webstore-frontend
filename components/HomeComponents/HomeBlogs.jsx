"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/utils/api";

export default function HomeCodex() {
  const [codex, setCodex] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCodex = async () => {
      setLoading(true);
      try {
        // Backend codex listing: GET /api/v1/codex
        const data = await api.get("/codex");
        // data is presumed array of codex objects
        const list = Array.isArray(data) ? data : data?.data || [];
        setCodex(list.slice(0, 6));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch codex", err);
        setError(err.message || "Failed to fetch codex");
      } finally {
        setLoading(false);
      }
    };

    fetchCodex();
  }, []);

  if (loading) {
    return (
      <section className="my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Latest Codex</h2>
        <p className="text-slate-500">Loading codex...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Latest Codex</h2>
        <p className="text-red-500">{error.message || error}</p>
      </section>
    );
  }

  if (!codex.length) return null;

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-black">Latest Codex</h2>
        <Link href="/codex" className="text-sm text-slate-600 hover:text-black">View all</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {codex.map((b) => (
          <Link key={b._id || b.slug} href={`/codex/${b.slug}`} className="group block bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="aspect-[16/9] bg-slate-100 relative">
              {b.coverImage ? (
                <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">No cover</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black group-hover:underline line-clamp-2">{b.title}</h3>
              <p className="mt-2 text-sm text-slate-600 line-clamp-3">{b.excerpt}</p>
              <div className="mt-3 text-xs text-slate-500 flex items-center justify-between">
                <span>{b.author?.name || "Unknown"}</span>
                <span>{new Date(b.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}



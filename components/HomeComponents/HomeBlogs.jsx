"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/utils/api";

export default function HomeBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        // Backend blog listing: GET /api/v1/blog
        const data = await api.get("/blog");
        // data is presumed array of blog objects
        const list = Array.isArray(data) ? data : data?.data || [];
        setBlogs(list.slice(0, 6));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
        setError(err.message || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <section className="my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Latest Blogs</h2>
        <p className="text-gray-500">Loading blogs...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="my-16">
        <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">Latest Blogs</h2>
        <p className="text-red-500">{error}</p>
      </section>
    );
  }

  if (!blogs.length) return null;

  return (
    <section className="my-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-black">Latest Blogs</h2>
        <Link href="/blog" className="text-sm text-gray-600 hover:text-black">View all</Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((b) => (
          <Link key={b._id || b.slug} href={`/blog/${b.slug}`} className="group block bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className="aspect-[16/9] bg-gray-100 relative">
              {b.coverImage ? (
                <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">No cover</div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-black group-hover:underline line-clamp-2">{b.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{b.excerpt}</p>
              <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
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

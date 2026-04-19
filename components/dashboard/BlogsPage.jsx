"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import BlogCard from "./cards/BlogCard";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/blog?limit=100");
      if (response.blogs) {
        setBlogs(response.blogs);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          All Blogs
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Discover articles and stories from our community
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-3xl p-6 animate-pulse"
            >
              <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No blogs found
          </p>
        </div>
      )}
    </div>
  );
}

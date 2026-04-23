"use client";
import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import Link from "next/link";
import AuthenticatedHome from "@/components/dashboard/AuthenticatedHome";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await api.get("/blog");
        if (response.success) {
          setBlogs(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <AuthenticatedHome hideRightSidebar={false}>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Blogs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover articles, tutorials, and insights from our community
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No blogs available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group bg-white dark:bg-black/40 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {blog.title}
                </h2>
                {blog.excerpt && (
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {blog.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                  <span>{blog.author?.name || "Anonymous"}</span>
                  <span>•</span>
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {blog.readTime && (
                    <>
                      <span>•</span>
                      <span>{blog.readTime} min read</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AuthenticatedHome>
  );
}

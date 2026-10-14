"use client";

import React, { useState } from "react";
import { createBlog } from "@/utils/blogApi";

export default function CreateBlogPage() {
  const [activeLang, setActiveLang] = useState("en");
  
  const [formData, setFormData] = useState({
    slug: "",
    status: "draft",
    coverImage: "",
    coverImageAlt: "",
    category: "", // Add categories dropdown in real impl
    tags: "",
    en: {
      title: "",
      excerpt: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      keywords: ""
    },
    bn: {
      title: "",
      excerpt: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      keywords: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLangChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [activeLang]: {
        ...prev[activeLang],
        [name]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(",").map(tag => tag.trim()),
      };
      
      const res = await createBlog(payload);
      if (res.success) {
        setMessage("Blog created successfully!");
      } else {
        setMessage(res.message || "Failed to create blog");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-[#141414] rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Write a New Blog</h1>

      {message && (
        <div className="mb-4 p-4 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Details Section */}
        <div className="p-4 border rounded-md border-gray-200 dark:border-gray-800 space-y-4">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL)</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleGeneralChange}
                placeholder="e.g. how-to-build-scalable-api"
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleGeneralChange}
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleGeneralChange}
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleGeneralChange}
                placeholder="Nodejs, Scalability, React"
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Multilingual Editor Section */}
        <div className="p-4 border rounded-md border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Content Editor</h2>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setActiveLang("en")}
                className={`px-4 py-2 rounded text-sm ${activeLang === "en" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setActiveLang("bn")}
                className={`px-4 py-2 rounded text-sm ${activeLang === "bn" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}
              >
                Bangla
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title ({activeLang.toUpperCase()})
              </label>
              <input
                type="text"
                name="title"
                value={formData[activeLang].title}
                onChange={handleLangChange}
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
                required={activeLang === "en"} // Enforce at least English
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Excerpt ({activeLang.toUpperCase()})
              </label>
              <textarea
                name="excerpt"
                value={formData[activeLang].excerpt}
                onChange={handleLangChange}
                rows="2"
                className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
                required={activeLang === "en"}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Editor ({activeLang.toUpperCase()})
              </label>
              <textarea
                name="content"
                value={formData[activeLang].content}
                onChange={handleLangChange}
                rows="15"
                placeholder="Write your amazing content here (Markdown/HTML supported)..."
                className="w-full p-4 border rounded font-mono text-sm dark:bg-[#1e1e1e] dark:border-gray-700"
                required={activeLang === "en"}
              ></textarea>
              <p className="text-xs text-gray-500 mt-1">
                * Note: In a production build, this textarea will be replaced by our custom Tiptap/Monaco rich text editor.
              </p>
            </div>

            {/* SEO Settings */}
            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">SEO Meta ({activeLang.toUpperCase()})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SEO Title</label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData[activeLang].seoTitle}
                    onChange={handleLangChange}
                    className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData[activeLang].keywords}
                    onChange={handleLangChange}
                    className="w-full p-2 border rounded dark:bg-[#1e1e1e] dark:border-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-sm disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}

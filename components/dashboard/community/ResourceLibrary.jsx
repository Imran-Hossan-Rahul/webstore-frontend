"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { X, Upload, Link as LinkIcon, Download, Eye, Star, Search, Filter, Package, Code, Palette, FileText, Zap, ExternalLink } from "lucide-react";

const categories = [
  { id: "all", label: "All Resources", icon: Package },
  { id: "design", label: "Design Files", icon: Palette },
  { id: "code", label: "Code", icon: Code },
  { id: "ui-kit", label: "UI Kits", icon: Zap },
  { id: "artifact", label: "Artifacts", icon: FileText },
  { id: "icon", label: "Icons", icon: Star },
  { id: "tutorial", label: "Tutorials", icon: FileText }
];

export default function ResourceLibrary({ isOpen, onClose }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchResources();
    }
  }, [isOpen, selectedCategory, sortBy]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/community/resources?category=${selectedCategory}&sortBy=${sortBy}&limit=50`);
      if (res.success) {
        setResources(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-white/10">
        {/* Header */}
        <div className="relative p-8 border-b border-slate-200 dark:border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Resource Library
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Discover and share valuable resources
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                <Upload className="w-4 h-4" />
                Share Resource
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="relative mt-6 flex gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="recent">Recent</option>
              <option value="popular">Most Downloaded</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
          {loading ? (
            <LoadingGrid />
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {resources.map((resource) => (
                <ResourceCard key={resource._id} resource={resource} onUpdate={fetchResources} />
              ))}
            </div>
          ) : (
            <EmptyState category={selectedCategory} />
          )}
        </div>
      </div>

      {showUpload && (
        <UploadResourceModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            fetchResources();
          }}
        />
      )}
    </div>
  );
}

const ResourceCard = ({ resource, onUpdate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(resource.likesCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/community/resources/${resource._id}/like`);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikes(res.likesCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      await api.post(`/community/resources/${resource._id}/download`);
      if (resource.type === "link") {
        window.open(resource.externalLink, "_blank");
      } else {
        window.open(resource.fileUrl, "_blank");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="group bg-white dark:bg-black/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      {/* Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-500/10 to-purple-500/10 overflow-hidden">
        {resource.previewImage ? (
          <img src={getOptimizedUrl(resource.previewImage)} alt={resource.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-300 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {resource.isPaid && (
            <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
              {resource.price} TKNS
            </span>
          )}
          <span className="px-3 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-bold rounded-full">
            {resource.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {resource.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {resource.description}
        </p>

        {/* Craftsman */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {resource.craftsman?.name?.[0]}
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {resource.craftsman?.name}
          </span>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {resource.downloads}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {resource.views}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-all ${
                isLiked
                  ? "bg-red-100 dark:bg-red-900/30 text-red-600"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
              }`}
            >
              <Star className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium text-sm"
            >
              {resource.type === "link" ? "Visit" : "Download"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UploadResourceModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "design",
    type: "link",
    externalLink: "",
    fileUrl: "",
    tags: "",
    isPaid: false,
    price: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const tags = formData.tags.split(",").map(t => t.trim()).filter(t => t);
      const res = await api.post("/community/resources", { ...formData, tags });
      if (res.success) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-black/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Share Resource</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <input
            type="text"
            placeholder="Resource title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
            >
              {categories.filter(c => c.id !== "all").map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
            >
              <option value="link">External Link</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          {formData.type === "link" ? (
            <input
              type="url"
              placeholder="Resource URL (e.g., https://example.com/resource)"
              value={formData.externalLink}
              onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
              required
            />
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-gray-300">
                Upload File
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                  required
                />
              </div>
              {selectedFile && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Selected: {selectedFile.name}
                </p>
              )}
              <input
                type="url"
                placeholder="Or paste file URL"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
              />
            </div>
          )}
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 dark:border-white/10 rounded-xl bg-white dark:bg-black/40 text-slate-900 dark:text-white"
          />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 text-slate-600 dark:text-slate-400">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Sharing..." : "Share Resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LoadingGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-white dark:bg-black/40 rounded-2xl overflow-hidden animate-pulse">
        <div className="aspect-video bg-slate-200 dark:bg-slate-800" />
        <div className="p-4 space-y-3">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ category }) => (
  <div className="text-center py-20">
    <Package className="w-20 h-20 text-gray-300 dark:text-slate-600 mx-auto mb-6" />
    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
      No resources found
    </h3>
    <p className="text-slate-600 dark:text-slate-400">
      {category === "all" ? "Be the first to share a resource!" : `No ${category} resources yet.`}
    </p>
  </div>
);



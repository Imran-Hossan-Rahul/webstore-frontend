"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { X, Upload, Highlighter, Heart, MessageCircle, Clock, FileText, Bookmark, Share2 } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import CodexCard from "../dashboard/cards/CodexCard";
import { useUser } from "@/context/UserContext";

export default function PublishModal({ isOpen, onClose, editor, existingSlug, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "uncategorized",
    tags: "",
    coverImage: "",
    cardShape: "square-medium",
    seoTitle: "",
    seoDescription: "",
    focusKeywords: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadJobId, setUploadJobId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const { showToast } = useToast();
  
  // New States for Highlights & Preview
  const { user } = useUser();
  const [excerptHtml, setExcerptHtml] = useState("");
  const excerptRef = useRef(null);

  const showError = useCallback((title, message) => {
    showToast(message, "error", title);
  }, [showToast]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        category: initialData.category || "uncategorized",
        tags: initialData.tags ? initialData.tags.join(", ") : "",
        coverImage: initialData.coverImage || "",
        cardShape: initialData.cardShape || "square-medium",
        seoTitle: initialData.seoTitle || "",
        seoDescription: initialData.seoDescription || "",
        focusKeywords: initialData.focusKeywords ? initialData.focusKeywords.join(", ") : "",
      });
      if (initialData.coverImage) {
        setCoverImagePreview(initialData.coverImage);
      }
    }
  }, [isOpen, initialData]);

  // Excerpt Initialization
  useEffect(() => {
    if (isOpen) {
        let initialExcerpt = initialData?.excerpt;
        if (!initialExcerpt) {
            const contentText = editor.getText();
            initialExcerpt = contentText ? contentText.substring(0, 300) + (contentText.length > 300 ? "..." : "") : "";
        }
        setExcerptHtml(initialExcerpt);
    }
  }, [isOpen, initialData, editor]);

  const categories = [
    "uncategorized",
    "technology",
    "design",
    "development",
    "business",
    "lifestyle",
    "tutorial",
    "news",
  ];

  const pollUploadStatus = async (jobId) => {
    const pollInterval = setInterval(async () => {
      try {
        const status = await api.get(`/codex/upload-status/${jobId}`);

        if (status.success) {
          setUploadProgress(status.progress || 0);

          if (status.status === "completed" && status.url) {
            clearInterval(pollInterval);
            setFormData(prev => ({ ...prev, coverImage: status.url }));
            setUploading(false);
            setUploadJobId(null);
          } else if (status.status === "failed") {
            clearInterval(pollInterval);
            showError("Upload Failed", "The image upload failed. Please try again.");
            setUploading(false);
            setUploadJobId(null);
            setCoverImageFile(null);
            setCoverImagePreview("");
          }
        }
      } catch (error) {
        clearInterval(pollInterval);
        console.error("❌ Status check failed:", error);
        showError("Upload Error", "Failed to check upload status. Please try again.");
        setUploading(false);
        setUploadJobId(null);
      }
    }, 1000);
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Invalid File Type", "Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", `Your image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose an image smaller than 5MB.`);
      return;
    }

    setCoverImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    setUploadProgress(0);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("coverImage", file);

      const response = await api.upload("/codex/upload-cover-image", formDataUpload);

      if (response.success && response.jobId) {
        setUploadJobId(response.jobId);
        pollUploadStatus(response.jobId);
      } else {
        throw new Error("Failed to queue upload");
      }
    } catch (error) {
      console.error("❌ Upload queue failed:", error);
      showError("Upload Failed", "Failed to upload image. Please try again.");
      setCoverImageFile(null);
      setCoverImagePreview("");
      setUploading(false);
    }
  };

  const applyHighlight = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    if (!selectedText.trim()) {
        showToast("Select some text to highlight first.", "info", "Highlighting");
        return;
    }

    if (!excerptRef.current.contains(range.commonAncestorContainer)) {
        showToast("Please select text inside the excerpt box.", "info", "Highlighting");
        return;
    }

    const mark = document.createElement("mark");
    mark.className = "bg-yellow-200 text-yellow-900 rounded px-1 font-medium";
    mark.textContent = selectedText;

    range.deleteContents();
    range.insertNode(mark);
    
    setExcerptHtml(excerptRef.current.innerHTML);
  };

  const handleExcerptInput = () => {
      // No state update here to avoid cursor jumping in contentEditable
      // excerptRef.current.innerHTML is read directly on submit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (uploading) {
      showToast("Please wait for the image to finish uploading.", "warning", "Upload In Progress");
      return;
    }

    setLoading(true);

    try {
      const titleNode = editor.state.doc.firstChild?.firstChild?.content?.firstChild;
      const titleText = titleNode && titleNode.text ? titleNode.text : formData.title || "Untitled";
      const contentHtml = editor.getHTML();

      const excerpt = (excerptRef.current ? excerptRef.current.innerHTML : excerptHtml) || undefined;

      const payload = {
        title: titleText.slice(0, 150),
        subtitle: formData.subtitle || undefined,
        content: contentHtml,
        excerpt,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        category: formData.category,
        coverImage: formData.coverImage || undefined,
        cardShape: formData.cardShape,
        seoTitle: formData.seoTitle || undefined,
        seoDescription: formData.seoDescription || undefined,
        focusKeywords: formData.focusKeywords ? formData.focusKeywords.split(",").map(k => k.trim()).filter(k => k) : undefined,
      };

      if (existingSlug) {
        await api.put(`/codex/${existingSlug}`, payload);
        await api.post(`/codex/${existingSlug}/publish`, {});
        showToast("Your codex has been updated successfully!", "success", "Updated! 🎉");
      } else {
        const codex = await api.post("/codex/create-codex", payload);
        const slug = codex?.codex?.slug || codex?.slug;
        if (!slug) throw new Error("Failed to get codex slug");
        await api.post(`/codex/${slug}/publish`, {});
        showToast("Your codex has been published successfully!", "success", "Published! 🎉");
      }
      
      onClose();
      setTimeout(() => { window.location.href = "/codex"; }, 1200);
    } catch (err) {
      console.error("Publish/Update failed:", err);
      showError("Publish Failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const previewItemMock = {
      _id: "preview-card",
      slug: existingSlug || "preview",
      title: formData.title || "Your Codex Title",
      excerpt: excerptHtml || "Your codex excerpt will appear here...",
      coverImage: coverImagePreview,
      type: "codex",
      user: user || { name: "You", profilePicture: "" },
      views: 0,
      likesCount: 0,
      comments: [],
      createdAt: new Date().toISOString()
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 transition-all duration-300">
      <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl w-[95vw] max-w-[1590px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-white dark:bg-zinc-950 px-8 py-5 flex items-center justify-between z-10 border-b border-slate-100 dark:border-zinc-900 shrink-0">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-sans">
            {existingSlug ? "Update Codex" : "Publish Codex"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body: Split into 2 columns */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            
            {/* LEFT COLUMN: Form */}
            <div className="w-full lg:w-[450px] xl:w-[500px] shrink-0 overflow-y-auto px-8 py-6 border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <form id="publishForm" onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Codex Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter codex title..."
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm"
                    />
                  </div>

                  {/* Subtitle */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subtitle <span className="opacity-50 font-normal lowercase">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      placeholder="A brief subtitle for your codex"
                      maxLength={200}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all cursor-pointer text-sm appearance-none"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat} className="bg-white dark:bg-zinc-900">
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tags
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="e.g. react, design, ux"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* SEO Details Section */}
                  <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-6">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">SEO Settings</h3>
                    
                    {/* SEO Title */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        SEO Title <span className="opacity-50 font-normal lowercase">(Optional, Max 60 chars)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.seoTitle}
                        onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                        placeholder="Optimized title for search engines..."
                        maxLength={60}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm"
                      />
                      <div className="text-xs text-slate-400 text-right">{formData.seoTitle.length}/60</div>
                    </div>

                    {/* SEO Description */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Meta Description <span className="opacity-50 font-normal lowercase">(Max 160 chars)</span>
                      </label>
                      <textarea
                        value={formData.seoDescription}
                        onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                        placeholder="A compelling description for search engine results..."
                        maxLength={160}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm resize-none"
                      />
                      <div className="text-xs text-slate-400 text-right">{formData.seoDescription.length}/160</div>
                    </div>

                    {/* Focus Keywords */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Focus Keywords <span className="opacity-50 font-normal lowercase">(Comma separated)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.focusKeywords}
                        onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                        placeholder="e.g. react hooks, state management, frontend"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg hover:border-black dark:hover:border-white focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 text-sm"
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div className="space-y-3">
                    <label className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Cover Image
                    </label>
                    <div className="relative group">
                      <div className={`relative border border-slate-200 dark:border-zinc-800 ${coverImagePreview ? 'border-transparent' : ''} rounded-lg overflow-hidden transition-all duration-300 hover:border-black dark:hover:border-white bg-slate-50 dark:bg-zinc-900/50`}>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleCoverImageChange}
                          className="hidden"
                          id="coverImageUpload"
                          disabled={uploading}
                        />
                        
                        {coverImagePreview ? (
                          <div className="relative aspect-[3/2]">
                            <img
                              src={coverImagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                               <label htmlFor="coverImageUpload" className="px-6 py-2 bg-white text-black rounded-full text-xs font-bold cursor-pointer hover:scale-105 transition-transform">
                                  Change Image
                               </label>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setCoverImageFile(null);
                                setCoverImagePreview("");
                                setFormData(prev => ({ ...prev, coverImage: "" }));
                              }}
                              className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="coverImageUpload" className="flex flex-col items-center justify-center py-10 cursor-pointer">
                            <Upload className="mb-3 text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors" size={24} />
                            <p className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wider">
                              {uploading ? `Uploading... ${uploadProgress}%` : "Click to upload cover image"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-sans">
                              High resolution recommended (Max 5MB)
                            </p>
                            {uploading && (
                              <div className="mt-3 w-40 bg-slate-200 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                                <div 
                                  className="bg-black dark:bg-white h-full transition-all duration-300"
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            )}
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
            </div>

            {/* RIGHT COLUMN: Live Preview & Highlights */}
            <div className="flex-1 bg-slate-50 dark:bg-zinc-900/30 overflow-y-auto flex flex-col">

                {/* Toolbar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-sans">Live Feed Preview</h3>
                        <p className="text-xs text-slate-400">This is how your codex will appear in the feed.</p>
                    </div>
                    <button
                        type="button"
                        onClick={applyHighlight}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0"
                    >
                        <Highlighter size={14} />
                        Highlight Selected Text
                    </button>
                </div>

                {/* Feed Container — exact same as DashboardFeed */}
                <div className="flex-1 px-4 pt-4">
                    <div className="w-full border border-slate-200 dark:border-white/10 rounded-t-2xl overflow-hidden bg-white dark:bg-slate-900/20">
                        <CodexCard
                            codex={{
                                _id: "preview-card",
                                slug: existingSlug || "preview",
                                title: formData.title || "Your Codex Title",
                                subtitle: formData.subtitle || "",
                                excerpt: excerptHtml || "Your codex excerpt will appear here...",
                                content: "",
                                coverImage: coverImagePreview,
                                author: user,
                                createdAt: new Date().toISOString(),
                                readTime: "5 min read",
                                likesCount: 0,
                                commentsCount: 0,
                                category: formData.category,
                                tags: Array.isArray(formData.tags) ? formData.tags : (formData.tags ? formData.tags.split(',').map(t => t.trim()) : [])
                            }}
                            currentUser={user}
                            isPreview={true}
                            excerptRef={excerptRef}
                            onExcerptInput={handleExcerptInput}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-zinc-950 px-8 py-4 border-t border-slate-100 dark:border-zinc-900 shrink-0 flex gap-4 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-sm font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="publishForm"
              disabled={loading || uploading}
              className="px-8 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm hover:shadow-md font-sans min-w-[160px]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : null}
              {loading ? "Publishing..." : (existingSlug ? "Update Codex" : "Publish to Codex")}
            </button>
        </div>

      </div>
    </div>
  );
}




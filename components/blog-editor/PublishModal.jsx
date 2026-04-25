"use client";

import { useState, useCallback, useEffect } from "react";
import { X, Upload, Plus, Minus } from "lucide-react";
import { api } from "@/utils/api";
import { CARD_SHAPES } from "@/constants/cardShapes";
import { useToast } from "@/components/ui/ToastProvider";

export default function PublishModal({ isOpen, onClose, editor, existingSlug, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    category: "uncategorized",
    tags: "",
    coverImage: "",
    cardShape: "square-medium",
    proTips: [""],
    keyTakeaways: [""]
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadJobId, setUploadJobId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState("");
  const { showToast } = useToast();

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
        proTips: initialData.proTips?.length > 0 ? initialData.proTips : [""],
        keyTakeaways: initialData.keyTakeaways?.length > 0 ? initialData.keyTakeaways : [""]
      });
      if (initialData.coverImage) {
        setCoverImagePreview(initialData.coverImage);
      }
    }
  }, [isOpen, initialData]);


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
        const status = await api.get(`/blog/upload-status/${jobId}`);

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
    }, 1000); // Poll every second
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showError("Invalid File Type", "Please select an image file (JPG, PNG, WebP, GIF).");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("File Too Large", `Your image is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Please choose an image smaller than 5MB.`);
      return;
    }

    setCoverImageFile(file);
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Queue upload to Cloudinary
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("coverImage", file);

      const response = await api.upload("/blog/upload-cover-image", formData);

      if (response.success && response.jobId) {
        setUploadJobId(response.jobId);
        // Start polling for status
        pollUploadStatus(response.jobId);
      } else {
        throw new Error("Failed to queue upload");
      }
    } catch (error) {
      console.error("❌ Upload queue failed:", error);
      showError("Upload Failed", "Failed to upload image. Please try again.");
      // Clear the file on error
      setCoverImageFile(null);
      setCoverImagePreview("");
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if image is still uploading
    if (uploading) {
      showToast("Please wait for the image to finish uploading.", "warning", "Upload In Progress");
      return;
    }

    setLoading(true);

    try {
      const titleNode = editor.state.doc.firstChild?.firstChild?.content?.firstChild;
      const titleText = titleNode && titleNode.text ? titleNode.text : formData.title || "Untitled";
      const contentHtml = editor.getHTML();

      const payload = {
        title: titleText.slice(0, 150),
        subtitle: formData.subtitle || undefined,
        content: contentHtml,
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
        category: formData.category,
        coverImage: formData.coverImage || undefined, // Cloudinary URL
        cardShape: formData.cardShape,
        proTips: formData.proTips.filter(tip => tip.trim()).slice(0, 10),
        keyTakeaways: formData.keyTakeaways.filter(tk => tk.trim()).slice(0, 10)
      };

      if (existingSlug) {
        // Update existing blog
        await api.put(`/blog/${existingSlug}`, payload);
        
        // If it was just a draft, we might want to ensure it's published.
        // It's safe to call publish again.
        await api.post(`/blog/${existingSlug}/publish`, {});
        
        showToast("Your blog has been updated successfully!", "success", "Updated! 🎉");
      } else {
        // Create new blog
        const blog = await api.post("/blog/create-blog", payload);
        const slug = blog?.blog?.slug || blog?.slug;
        
        if (!slug) throw new Error("Failed to get blog slug");
        
        await api.post(`/blog/${slug}/publish`, {});
        showToast("Your blog has been published successfully!", "success", "Published! 🎉");
      }
      
      onClose();
      setTimeout(() => { window.location.href = "/blogs"; }, 1200);
    } catch (err) {
      console.error("Publish/Update failed:", err);
      showError("Publish Failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {existingSlug ? "Update Blog" : "Publish Blog"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter blog title (optional - will use editor title)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Subtitle <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="A brief subtitle for your blog"
              maxLength={200}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g. react, nextjs, tutorial"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Cover Image
            </label>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleCoverImageChange}
                  className="hidden"
                  id="coverImageUpload"
                  disabled={uploading}
                />
                <label htmlFor="coverImageUpload" className={`cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                  <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {uploading ? `Uploading... ${uploadProgress}%` : "Click to upload cover image"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: JPG, JPEG, PNG, WebP, GIF (Max 5MB)
                  </p>
                  {uploading && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                </label>
              </div>
              
              {coverImagePreview && (
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={coverImagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverImageFile(null);
                      setCoverImagePreview("");
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Pro Tips */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Pro Tips <span className="text-gray-400 font-normal">(Optional - Max 10)</span>
            </label>
            <div className="space-y-2">
              {formData.proTips.map((tip, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={tip}
                    onChange={(e) => {
                      const newTips = [...formData.proTips];
                      newTips[index] = e.target.value;
                      setFormData({ ...formData, proTips: newTips });
                    }}
                    placeholder={`Pro tip ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {formData.proTips.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTips = formData.proTips.filter((_, i) => i !== index);
                        setFormData({ ...formData, proTips: newTips });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              {formData.proTips.length < 10 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, proTips: [...formData.proTips, ""] })}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Pro Tip
                </button>
              )}
            </div>
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Key Takeaways <span className="text-gray-400 font-normal">(Optional - Max 10)</span>
            </label>
            <div className="space-y-2">
              {formData.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={takeaway}
                    onChange={(e) => {
                      const newTakeaways = [...formData.keyTakeaways];
                      newTakeaways[index] = e.target.value;
                      setFormData({ ...formData, keyTakeaways: newTakeaways });
                    }}
                    placeholder={`Key takeaway ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  {formData.keyTakeaways.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newTakeaways = formData.keyTakeaways.filter((_, i) => i !== index);
                        setFormData({ ...formData, keyTakeaways: newTakeaways });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                  )}
                </div>
              ))}
              {formData.keyTakeaways.length < 10 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, keyTakeaways: [...formData.keyTakeaways, ""] })}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add Key Takeaway
                </button>
              )}
            </div>
          </div>

          {/* Card Shape - hidden for now, will be added later
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Card Display Style
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              ...
            </div>
          </div>
          */}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (existingSlug ? "Updating..." : "Publishing...") : (existingSlug ? "Update Blog" : "Publish Blog")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

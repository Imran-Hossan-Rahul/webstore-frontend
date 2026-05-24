"use client";

import { useState, useRef } from "react";
import { X, Upload, Camera, Crop } from "lucide-react";
import { api } from "@/utils/api";

export default function ImageUploadModal({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  type = "profile", // "profile" or "cover"
  uploadEndpoint, // e.g., "/upload/user/profile-picture"
  title = "Upload Image"
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const aspectRatio = type === "profile" ? "1:1" : "3:1";
  const recommendedSize = type === "profile" ? "400x400" : "1500x500";

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError("");

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      // Using the api utility which handles FormData and cookies automatically
      const resData = await api.post(uploadEndpoint, formData);

      // If response gives a job ID, we poll for status
      if (resData.data?.jobId || resData.jobId) {
        setUploading(true);
        const jobId = resData.data?.jobId || resData.jobId;
        
        // Polling function
        const checkStatus = async () => {
          try {
            const statusRes = await api.get(`/upload/status/${jobId}`);
            
            if (statusRes.success) {
              const { state, result, failedReason } = statusRes.data;
              
              if (state === "completed") {
                // Success!
                if (onUploadSuccess) {
                  onUploadSuccess(result);
                }
                handleClose();
                setUploading(false);
              } else if (state === "failed") {
                // Failed
                throw new Error(failedReason || "Processing failed");
              } else {
                // Still processing/waiting, check again in 1s
                setTimeout(checkStatus, 1000);
              }
            }
          } catch (statusErr) {
             setError(statusErr.message || "Status check failed");
             setUploading(false);
          }
        };

        // Start polling
        checkStatus();
        
      } else {
        // Fallback for immediate success
         if (onUploadSuccess) {
          onUploadSuccess(resData.data || resData);
        }
        handleClose();
        setUploading(false);
      }

    } catch (err) {
      setError(err.message || "Failed to upload image");
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Recommended: {recommendedSize} ({aspectRatio} ratio) • Max 5MB
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drag & Drop Area */}
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10"
                  : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="text-slate-900 dark:text-white font-medium">
                    Drop your image here, or click to browse
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview */}
              <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={preview}
                  alt="Preview"
                  className={`w-full ${
                    type === "profile" ? "aspect-square object-cover" : "aspect-[3/1] object-cover"
                  }`}
                />
              </div>

              {/* Change Image Button */}
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
                className="w-full py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={18} />
                Change Image
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-red-600 dark:text-red-400 text-sm">{error.message || error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

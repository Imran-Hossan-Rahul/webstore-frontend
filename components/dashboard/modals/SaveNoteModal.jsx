import React, { useState } from "react";
import { X, FolderPlus, Save, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/utils/api";

export default function SaveNoteModal({ isOpen, onClose, selectedText, codexId, url }) {
  const [title, setTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const { folders, refresh } = useFavorites();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.post("/notes", {
        highlightedText: selectedText,
        title,
        noteContent,
        codexId,
        sourceUrl: url,
        folderId: selectedFolder || null,
        isPublic
      });

      if (res.success) {
        showToast("Highlight saved successfully!", "success");
        if (refresh) refresh();
        onClose();
        setTitle("");
        setNoteContent("");
        setSelectedFolder("");
      } else {
        showToast(res.message || "Failed to save note", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 20, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Quote size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Save Highlight</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Keep track of important snippets</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Highlighted Text Preview */}
            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border-l-4 border-amber-400 rounded-r-xl">
              <p className="text-sm font-medium italic text-slate-700 dark:text-slate-300 line-clamp-4">
                "{selectedText}"
              </p>
            </div>

            {/* Note Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Great definition of React"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Add a Note (Optional)
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Why is this important to you?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                  Save to Folder
                </label>
                <div className="relative">
                  <FolderPlus size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white transition-all text-sm appearance-none"
                  >
                    <option value="">No Folder (All Items)</option>
                    {folders?.map((folder) => (
                      <option key={folder._id} value={folder._id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Public Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Make Public</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Allow others to see this highlight</p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isPublic ? "bg-indigo-500" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-opacity ${
                      isPublic ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !selectedText}
              className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Highlight"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

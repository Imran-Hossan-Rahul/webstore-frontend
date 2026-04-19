"use client";
import { useState } from "react";

export default function FolderSelector({ onFolderSelect }) {
  const [loading, setLoading] = useState(false);

  const handleSelectFolder = async () => {
    setLoading(true);
    try {
      if ('showDirectoryPicker' in window) {
        const dirHandle = await window.showDirectoryPicker();
        onFolderSelect(dirHandle.name);
      } else {
        const folderPath = prompt("Enter folder path (or leave empty for temp workspace):");
        onFolderSelect(folderPath || null);
      }
    } catch (err) {
      console.log("User cancelled folder selection");
      onFolderSelect(null); // Use temp workspace
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center text-white">
      <h2 className="text-2xl mb-4">Select Workspace Folder</h2>
      <button
        onClick={handleSelectFolder}
        disabled={loading}
        className="bg-blue-600 px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Setting up..." : "Choose Folder"}
      </button>
      <p className="text-gray-400 mt-4 text-sm">
        Select a folder to work with your files, or cancel to use temporary workspace
      </p>
    </div>
  );
}
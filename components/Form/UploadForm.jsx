"use client";
// DevlogUploadForm.jsx
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/ToastProvider";

export default function DevlogUploadForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [options, setOptions] = useState("");
  const [zipFile, setZipFile] = useState(null);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!zipFile) {
      showToast("Please select a zip file!", "warning");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append(
        "tags",
        JSON.stringify(tags.split(",").map((t) => t.trim()))
      ); // ensure array
      formData.append(
        "options",
        JSON.stringify(options.split(",").map((o) => o.trim()))
      );
      formData.append("zip", zipFile);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/devlogs/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload success:", res.data);
      showToast("Devlog uploaded successfully!", "success");
    } catch (err) {
      console.error("Upload failed:", err.response || err);
      showToast(err.response?.data?.message || err.message || "Upload failed!", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
      />
      <input
        type="text"
        placeholder="Options (comma separated)"
        value={options}
        onChange={(e) => setOptions(e.target.value)}
      />
      <input
        type="file"
        accept=".zip"
        onChange={(e) => setZipFile(e.target.files[0])}
        required
      />
      <button
        type="submit"
        className="bg-brand-blue text-white px-4 py-2 rounded"
      >
        Upload Devlog
      </button>
    </form>
  );
}


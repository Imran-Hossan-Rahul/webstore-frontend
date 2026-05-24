"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select a zip file", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("artifact", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/artifact/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message);
      const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : "http://localhost:5000";
      setIframeUrl(`${apiBase}/artifacts/${data.folderName}`);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".zip"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" style={{ marginLeft: "10px" }}>
          Upload Artifact
        </button>
      </form>

      {message && <p>{message}</p>}

      {iframeUrl && (
        <iframe
          src={iframeUrl}
          width="100%"
          height="500px"
          style={{ border: "1px solid #ccc", marginTop: "20px" }}
        ></iframe>
      )}
    </div>
  );
}


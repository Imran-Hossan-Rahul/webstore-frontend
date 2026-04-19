"use client";
import React, { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [iframeUrl, setIframeUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a zip file");

    const formData = new FormData();
    formData.append("template", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/template/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message);
      const apiBase = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '') : "http://localhost:5000";
      setIframeUrl(`${apiBase}/templates/${data.folderName}`);
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
          Upload Template
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

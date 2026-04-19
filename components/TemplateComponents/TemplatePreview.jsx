"use client";
import React from "react";

export default function TemplatePreview({ src }) {
  if (!src) return null;

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Live Preview:</h3>
      <iframe
        src={src}
        title="Template Preview"
        style={{
          width: "100%",
          height: "500px",
          border: "1px solid #ccc",
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

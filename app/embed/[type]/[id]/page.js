"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";

export default function EmbedPage() {
  const params = useParams();
  const { type, id } = params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, [type, id]);

  const fetchContent = async () => {
    try {
      if (type === "codex") {
        // TODO: Fetch codex content
        // const res = await api.get(`/codex/${id}`);
        // setContent(res.data);
      } else if (type === "artifact") {
        // TODO: Fetch artifact content
        // const res = await api.get(`/artifact/${id}`);
        // setContent(res.data);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-600">Content not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {type === "codex" ? (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
          <p className="text-slate-600 mb-4">{content.description}</p>
          {/* Render artifact preview */}
        </div>
      )}
    </div>
  );
}


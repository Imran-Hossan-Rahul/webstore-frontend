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
      if (type === "blog") {
        // TODO: Fetch blog content
        // const res = await api.get(`/blog/${id}`);
        // setContent(res.data);
      } else if (type === "template") {
        // TODO: Fetch template content
        // const res = await api.get(`/template/${id}`);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Content not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      {type === "blog" ? (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
          <p className="text-gray-600 mb-4">{content.description}</p>
          {/* Render template preview */}
        </div>
      )}
    </div>
  );
}


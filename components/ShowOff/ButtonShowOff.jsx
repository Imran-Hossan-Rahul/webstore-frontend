"use client";

import React, { useEffect, useState } from "react";

export default function ButtonShowOff({ refresh }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/template/upload`); // dev: http://localhost:3000/api/buttonTemplates/
      const text = await res.text(); // response text
      let data;
      try {
        data = JSON.parse(text); // parse JSON
      } catch {
        throw new Error("Invalid JSON response from server");
      }

      if (data.success) {
        setTemplates(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch templates");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [refresh]);

  return (
    <div className="rounded-3xl p-4 absolute top-5 w-[78%] h-[96%] left-[90px] overflow-auto">
      {loading && (
        <p className="text-gray-500 text-center">Loading templates...</p>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}
      {!loading && !error && templates.length === 0 && (
        <p className="text-gray-500 text-center">No templates found.</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((t) => (
          <div
            key={t._id}
            className="bg-white rounded-2xl p-4 h-[420px] flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="text-sm mt-2">{t.description}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {t.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              {t.priceType === "paid" ? (
                <span className="font-medium text-red-600">${t.price}</span>
              ) : (
                <span className="font-medium text-green-600">Free</span>
              )}
              <a
                href={t.liveLink || "#"}
                target="_blank"
                className="text-blue-600 underline text-sm"
              >
                Live
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

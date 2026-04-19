"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { TemplateCard } from "./TemplateCard";
import axios from "axios";

export default function TemplatesFeed({ searchQuery }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchTemplates = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL;
            const res = await axios.get(`${API_URL}/template`, { params: { page: 1, limit: 50 }, withCredentials: true });
            
            if (res.data && (res.data.success || res.data.data)) {
                 const data = res.data.data || res.data.templates || [];
                 setTemplates(data);
            }
        } catch (e) {
            console.error("Templates fetch failed", e);
        } finally {
            setLoading(false);
        }
    };
    fetchTemplates();
  }, []);

  // Filter Logic
  const filteredTemplates = templates.filter(t => {
      const matchesSearch = searchQuery 
        ? t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
          t.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      
      const matchesCategory = activeCategory === "All" 
        ? true 
        : t.category?.includes(activeCategory); // Basic logic, adjust if category is strict

      return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
        
        {/* Minimal Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
             <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                 Templates
             </h1>

             {/* Minimal Tabs */}
             <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                {["All", "Websites", "Mobile", "SaaS"].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            activeCategory === cat 
                            ? "bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm" 
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
             </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {loading ? (
                Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-gray-100 dark:bg-white/5 rounded-2xl aspect-video animate-pulse" />
                ))
            ) : filteredTemplates.length > 0 ? (
                filteredTemplates.map(t => (
                    <TemplateCard key={t._id} template={t} />
                ))
            ) : (
                <div className="col-span-full py-20 text-center text-gray-500">
                    <p className="text-lg">No templates found.</p>
                </div>
            )}
        </div>

    </div>
  );
}

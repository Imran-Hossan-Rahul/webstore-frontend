"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { api, getHasCraftsmanAccount } from "@/utils/api";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import VideoCard from "./VideoCard";

export default function HomeMain({ initialCategory = "All" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data State
  const [artifacts, setArtifacts] = useState([]);
  const [codex, setCodex] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User State
  const [user, setUser] = useState(null);
  const [hasCraftsmanAccount, setHasCraftsmanAccount] = useState(false);

  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 1. Fetch User Info (for Navbar)
  useEffect(() => {
    const fetchUser = async () => {
        try {
            const res = await api.get("/user/profile");
            if (res.success) {
                setUser(res.data);
                setHasCraftsmanAccount(res.data.hasCraftsmanAccount);
            }
        } catch (err) {
            console.error("Auth check failed", err);
            // Fallback to localStorage user if saved during login for basic UI
            const localUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (localUser.name) setUser(localUser);
            setHasCraftsmanAccount(getHasCraftsmanAccount());
        }
    };
    fetchUser();
  }, []);

  // 2. Fetch Content (Artifacts & Codex) - Reusing Logic
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [artifactsRes, codexRes] = await Promise.allSettled([
           api.get("/artifact", { params: { page: 1, limit: 100 } }),
           api.get("/codex?limit=100")
        ]);

        const fetchedArtifacts = artifactsRes.status === "fulfilled" ? (artifactsRes.value.data || artifactsRes.value.artifacts || []) : [];
        
        let fetchedCodex = [];
        if (codexRes.status === "fulfilled") {
            const bData = codexRes.value; // api.get returns body directly
            if (bData && Array.isArray(bData.codex)) {
                fetchedCodex = bData.codex;
            } else if (Array.isArray(bData)) {
                fetchedCodex = bData;
            }
        }

        // Normalize
        const normArtifacts = fetchedArtifacts.map(t => ({ ...t, type: "artifact" }));
        const normCodex = fetchedCodex.map(b => ({ 
            ...b, 
            type: "codex",
            description: b.excerpt || b.description || "No description matched." 
        }));

        setArtifacts(normArtifacts);
        setCodex(normCodex);
      } catch (error) {
         console.error("Dashboard Init Error:", error);
      } finally {
         setLoading(false);
      }
    };
    init();
  }, []);

  // 3. Filter Logic (YouTube-style Tabs)
  useEffect(() => {
     let items = [];
     
     // STRICT SEPARATION Logic
     if (activeCategory === "All") {
         // Hybrid Feed: Mix logic
         items = [...artifacts, ...codex]; 
     } else if (activeCategory === "Artifacts") {
         items = [...artifacts];
     } else if (activeCategory === "Codex") {
         items = [...codex];
     } else if (activeCategory === "Websites") {
         items = artifacts.filter(t => t.category?.toLowerCase().includes("website"));
     } else if (activeCategory === "Mobile Apps") {
         items = artifacts.filter(t => t.category?.toLowerCase().includes("mobile"));
     } else if (activeCategory === "SaaS") {
         items = artifacts.filter(t => t.category?.toLowerCase().includes("saas"));
     }

     // Sort by newest
     items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

     // Search Filter
     if(searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        items = items.filter(item => {
             const t = item.title || "";
             const d = item.description || "";
             const authorName = (item.type === 'artifact' ? item.user?.name : item.author?.name) || "";
             return t.toLowerCase().includes(lower) || d.toLowerCase().includes(lower) || authorName.toLowerCase().includes(lower);
        });
     }

     setFilteredItems(items);
  }, [activeCategory, artifacts, codex, searchQuery]);


  return (
    <div className="min-h-screen text-black dark:text-white bg-brand-main">
      {/* 1. Navbar */}
      {/* 1. Navbar */}
      <Navbar 
        toggleSidebar={toggleSidebar} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        hasCraftsmanAccount={hasCraftsmanAccount}
      />

      {/* 2. Main Layout Container */}
      <div className="flex pt-14">
         
         {/* Sidebar (Fixed width or hidden) */}
         <Sidebar 
            className={`${sidebarOpen ? "w-60" : "w-0 md:w-20"} transition-all duration-300 ease-in-out`} 
         />

         {/* Content Area */}
         <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? "ml-0 md:ml-60" : "ml-0 md:ml-0"}`}>
             


             {/* Content Grid */}
             <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {loading ? (
                    <div className="col-span-full h-96 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        Loading content...
                    </div>
                 ) : filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <VideoCard 
                            key={item._id || item.slug} 
                            item={item} 
                            type={item.type} 
                        />
                    ))
                 ) : (
                    <div className="col-span-full h-96 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                        <p className="text-lg font-medium">No content found</p>
                        <p className="text-sm">Try changing the category or search query.</p>
                    </div>
                 )}
             </div>
         </main>
      </div>
    </div>
  );
}



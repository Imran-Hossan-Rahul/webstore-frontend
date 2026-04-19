"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { api, getHasCreatorAccount } from "@/utils/api";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import VideoCard from "./VideoCard";

export default function HomeMain({ initialCategory = "All" }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data State
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // User State
  const [user, setUser] = useState(null);
  const [hasCreatorAccount, setHasCreatorAccount] = useState(false);

  // Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 1. Fetch User Info (for Navbar)
  useEffect(() => {
    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                // Get basic user info if you have an endpoint, or decode token. 
                // For now, let's just assume we have a way or rely on partial data.
                // We'll fetch 'hasCreatorAccount' at least.
                const isCreator = await getHasCreatorAccount(token);
                setHasCreatorAccount(isCreator);
                
                // Decode token for name if feasible or fetch profile (optional)
                // setUser({ name: "User" }); // Placeholder or real fetch
                
                // Let's use a quick profile fetch if available, else just 'User'
                try {
                  const res = await api.get("/auth/me"); // Assuming this exists or similar
                  setUser(res.data?.user || { name: "User" });
                } catch (e) {
                   // Fallback to localStorage user if saved during login
                   const localUser = JSON.parse(localStorage.getItem("user") || "{}");
                   if (localUser.name) setUser(localUser);
                }
            } catch (err) {
                console.error("Auth check failed", err);
            }
        }
    };
    fetchUser();
  }, []);

  // 2. Fetch Content (Templates & Blogs) - Reusing Logic
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const [templatesRes, blogsRes] = await Promise.allSettled([
           axios.get(`${process.env.NEXT_PUBLIC_API_URL}/template`, { params: { page: 1, limit: 100 }, withCredentials: true }),
           // Fallback to /blog if /blog/all fails 
           api.get("/blog?limit=100") // Using api wrapper as verified working
        ]);

        const fetchedTemplates = templatesRes.status === "fulfilled" ? (templatesRes.value.data.data || templatesRes.value.data.templates || []) : [];
        
        let fetchedBlogs = [];
        if (blogsRes.status === "fulfilled") {
            const bData = blogsRes.value; // api.get returns body directly
            if (bData && Array.isArray(bData.blogs)) {
                fetchedBlogs = bData.blogs;
            } else if (Array.isArray(bData)) {
                fetchedBlogs = bData;
            }
        }

        // Normalize
        const normTemplates = fetchedTemplates.map(t => ({ ...t, type: "template" }));
        const normBlogs = fetchedBlogs.map(b => ({ 
            ...b, 
            type: "blog",
            description: b.excerpt || b.description || "No description matched." 
        }));

        setTemplates(normTemplates);
        setBlogs(normBlogs);
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
         items = [...templates, ...blogs]; 
     } else if (activeCategory === "Templates") {
         items = [...templates];
     } else if (activeCategory === "Blogs") {
         items = [...blogs];
     } else if (activeCategory === "Websites") {
         items = templates.filter(t => t.category?.toLowerCase().includes("website"));
     } else if (activeCategory === "Mobile Apps") {
         items = templates.filter(t => t.category?.toLowerCase().includes("mobile"));
     } else if (activeCategory === "SaaS") {
         items = templates.filter(t => t.category?.toLowerCase().includes("saas"));
     }

     // Sort by newest
     items.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

     // Search Filter
     if(searchQuery.trim()) {
        const lower = searchQuery.toLowerCase();
        items = items.filter(item => {
             const t = item.title || "";
             const d = item.description || "";
             const authorName = (item.type === 'template' ? item.user?.name : item.author?.name) || "";
             return t.toLowerCase().includes(lower) || d.toLowerCase().includes(lower) || authorName.toLowerCase().includes(lower);
        });
     }

     setFilteredItems(items);
  }, [activeCategory, templates, blogs, searchQuery]);


  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* 1. Navbar */}
      {/* 1. Navbar */}
      <Navbar 
        toggleSidebar={toggleSidebar} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        hasCreatorAccount={hasCreatorAccount}
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
                    <div className="col-span-full h-96 flex items-center justify-center text-gray-500">
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
                    <div className="col-span-full h-96 flex flex-col items-center justify-center text-gray-500">
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

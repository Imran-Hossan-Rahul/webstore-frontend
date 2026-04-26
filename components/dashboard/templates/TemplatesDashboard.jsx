"use client";
import React, { useState } from "react";
import GlassNavbar from "../GlassNavbar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import TemplatesFeed from "./TemplatesFeed";

export default function TemplatesDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-x-hidden">
        
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute top-[5%] left-[10%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[160px]" />
          <div className="absolute bottom-[5%] right-[10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[160px]" />
      </div>

      <GlassNavbar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">
        
        <div className="hidden lg:block w-[240px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                <Sidebar />
             </div>
        </div>

        <main className="flex-1 w-full min-w-0 pb-20">
            <TemplatesFeed searchQuery={searchQuery} />
        </main>

        <div className="hidden xl:block w-[320px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                 <RightSidebar />
             </div>
        </div>
      </div>
    </div>
  );
}

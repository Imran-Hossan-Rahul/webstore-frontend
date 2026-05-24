"use client";
import React, { useState } from "react";
import GlassNavbar from "../GlassNavbar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import JobsFeed from "./JobsFeed";

export default function JobsDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0a0a0a] text-slate-900 dark:text-white overflow-x-hidden">
        
      {/* Background Subtle Gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20">
          <div className="absolute top-[10%] left-[20%] w-[50%] h-[50%] bg-emerald-400/20 rounded-full blur-[130px]" />
          <div className="absolute bottom-[10%] right-[20%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[130px]" />
      </div>

      <GlassNavbar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">
        
        {/* Left Sidebar */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                <Sidebar />
             </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0 pb-20">
            <JobsFeed />
        </main>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-[320px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                 <RightSidebar />
             </div>
        </div>
      </div>
    </div>
  );
}

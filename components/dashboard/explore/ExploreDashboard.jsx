"use client";
import React, { useState } from "react";
import GlassNavbar from "../GlassNavbar";
import Sidebar from "../Sidebar";
import RightSidebar from "../RightSidebar";
import ExploreRightPanel from "./ExploreRightPanel"; // Import new panel
import CreateProjectModal from "../modals/CreateProjectModal";
import ExploreFeed from "./ExploreFeed";

export default function ExploreDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-x-hidden selection:bg-pink-500/30">
        
      {/* Background Mesh Gradient (Subtle - Different hue for Explore?) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 mix-blend-screen">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <GlassNavbar 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
      />

      {/* Main Layout Container */}
      <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">
        
        {/* Left Sidebar (Floating) */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                <Sidebar />
             </div>
        </div>

        {/* Middle Content (Scrollable) */}
        <main className="flex-1 w-full min-w-0">
            <div className="pb-20">
                <ExploreFeed />
            </div>
        </main>

        {/* Right Sidebar (Floating) */}
        <div className="hidden xl:block w-[320px] flex-shrink-0">
             <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                 <ExploreRightPanel />
             </div>
        </div>
      </div>

      {/* Global Create Project Modal */}
      <CreateProjectModal 
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onProjectCreated={() => {
          setIsCreatePostOpen(false);
          // Ideally refresh feed, but reload works for now
          window.location.reload();
        }}
      />
    </div>
  );
}

"use client";
import React from "react";
import ExploreRightPanel from "./ExploreRightPanel";
import ExploreFeed from "./ExploreFeed";

export default function ExploreDashboard() {
  return (
    <>
      {/* Background Mesh Gradient (Subtle - Different hue for Explore) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20 mix-blend-screen">
          <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-pink-400/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      </div>

      <div className="flex gap-6 w-full relative z-10">
        <div className="flex-1 min-w-0">
           <ExploreFeed />
        </div>
        
        {/* Right Sidebar (Floating) */}
        <div className="hidden xl:block w-[320px] flex-shrink-0">
             <div className="fixed top-16 bottom-6 w-[320px] overflow-y-auto">
                 <ExploreRightPanel />
             </div>
        </div>
      </div>
    </>
  );
}

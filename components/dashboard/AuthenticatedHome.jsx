"use client";
import React, { useState, useEffect } from "react";
import GlassNavbar from "./GlassNavbar";
import Sidebar from "./Sidebar";
import UserOnboardingModal from "./modals/UserOnboardingModal";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import { api } from "@/utils/api";
import ChatModal from "./chat/ChatModal";

export default function AuthenticatedHome({ children, hideRightSidebar = false, isGuest = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Onboarding Logic (only for authenticated users)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);

  // Auth guard modal for guest engagement
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("engage");

  useEffect(() => {
    if (isGuest) return; // Skip auth check for guests
    const checkUserStatus = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.success) {
          setUserData(res.data);
          if (!res.data.hasCompletedOnboarding) {
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        console.error("Auth check failed", error);
      }
    };
    checkUserStatus();
  }, [isGuest]);

  // Function passed down so cards can trigger the auth modal
  const requireAuth = (reason = "engage") => {
    setAuthModalReason(reason);
    setShowAuthModal(true);
  };

  // Guest clicking create post → show auth modal
  const handleCreatePost = () => {
    if (isGuest) {
      requireAuth("engage");
      return;
    }
    // Note: Modal handled via CreateDropdown link now
  };

  return (
    <div className="min-h-screen bg-brand-cloud dark:bg-slate-900 text-slate-900 dark:text-white overflow-x-hidden selection:bg-brand-blue/20">

      {/* Background Mesh Gradient (Removed as per request) */}
      {/* 
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-400/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[120px]" />
      </div> 
      */}

      <GlassNavbar
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenCreatePost={handleCreatePost}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isGuest={isGuest}
        onRequireAuth={requireAuth}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
      />

      {/* Main Layout Container */}
      <div className="relative z-10 flex pt-16 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">

        {/* Left Sidebar (Floating) */}
        <div className="hidden lg:block w-[240px] flex-shrink-0">
             <div className="fixed top-[84px] bottom-6 w-[240px] overflow-y-auto custom-scrollbar">
                <Sidebar isGuest={isGuest} onRequireAuth={requireAuth} />
             </div>
        </div>

        {/* Middle Content (Scrollable) */}
        <main className="flex-1 w-full min-w-0">
            <div className="pb-20">
                {children || (
                  <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                    <h1 className="text-3xl font-bold mb-4">Welcome to Antigravity</h1>
                    <p className="text-slate-500">Select an option from the sidebar to get started.</p>
                  </div>
                )}
            </div>
        </main>
      </div>



      {/* Onboarding Modal (only for authenticated users) */}
      {!isGuest && (
        <UserOnboardingModal
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
        />
      )}

      {/* Auth Guard Modal for guests */}
      <AuthGuardModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        reason={authModalReason}
      />

      {/* Global Chat Modal */}
      {!isGuest && (
        <ChatModal 
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}

    </div>
  );
}


"use client";
import React, { useState, useEffect } from "react";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import CreateProjectModal from "@/components/dashboard/modals/CreateProjectModal";
import UserOnboardingModal from "@/components/dashboard/modals/UserOnboardingModal";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import { api } from "@/utils/api";
import { usePathname } from "next/navigation";

export const DashboardContext = React.createContext();

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Onboarding & Auth Logic
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isGuest, setIsGuest] = useState(true);

  // Auth guard modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("engage");

  // Determine visibility logic
  const hideRightSidebar = pathname?.startsWith('/explore') || pathname?.startsWith('/templates/') || pathname?.startsWith('/blogs/');

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const res = await api.get('/user/profile');
        if (res.success) {
          setUserData(res.data);
          setIsGuest(false);
          if (!res.data.hasCompletedOnboarding) {
            setShowOnboarding(true);
          }
        } else {
          setIsGuest(true);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setIsGuest(true);
      }
    };
    checkUserStatus();
  }, [pathname]);

  const requireAuth = (reason = "engage") => {
    setAuthModalReason(reason);
    setShowAuthModal(true);
  };

  const handleCreatePost = () => {
    if (isGuest) {
      requireAuth("engage");
      return;
    }
    setIsCreatePostOpen(true);
  };

  return (
    <DashboardContext.Provider value={{ searchQuery, isGuest, requireAuth }}>
      <div className="min-h-screen bg-[#F3F4F6] dark:bg-[#0a0a0a] text-gray-900 dark:text-white overflow-x-hidden selection:bg-pink-500/30">
        
        <GlassNavbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCreatePost={handleCreatePost}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isGuest={isGuest}
          onRequireAuth={requireAuth}
        />

        {/* Main Layout Container */}
        <div className="relative z-10 flex pt-16 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">

          {/* Left Sidebar (Floating & Persistent) */}
          <div className="hidden lg:block w-[240px] flex-shrink-0">
               <div className="fixed top-24 bottom-6 w-[240px] overflow-y-auto">
                  <Sidebar isGuest={isGuest} onRequireAuth={requireAuth} />
               </div>
          </div>

          {/* Middle Content (Scrollable) */}
          <main className="flex-1 w-full min-w-0">
              <div className="pb-20">
                  {children}
              </div>
          </main>

          {/* Right Sidebar (Floating) */}
          {!hideRightSidebar && (
            <div className="hidden xl:block w-[320px] flex-shrink-0">
                 <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto">
                     <RightSidebar />
                 </div>
            </div>
          )}
        </div>

        {/* Global Modals */}
        {!isGuest && (
          <>
            <CreateProjectModal
              isOpen={isCreatePostOpen}
              onClose={() => setIsCreatePostOpen(false)}
              onProjectCreated={() => {
                setIsCreatePostOpen(false);
                window.location.reload();
              }}
            />
            <UserOnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
            />
          </>
        )}

        <AuthGuardModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          reason={authModalReason}
        />
      </div>
    </DashboardContext.Provider>
  );
}

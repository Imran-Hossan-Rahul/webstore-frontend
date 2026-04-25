"use client";
import React, { useState, useEffect } from "react";
import GlassNavbar from "./GlassNavbar";
import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import CreateProjectModal from "./modals/CreateProjectModal";
import UserOnboardingModal from "./modals/UserOnboardingModal";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import { api } from "@/utils/api";
import { usePathname } from "next/navigation";

export const DashboardContext = React.createContext();

export default function DashboardLayoutWrapper({ children, isGuest = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pathname = usePathname();
  // Hide the layout's right sidebar on pages that render their own
  // (explore, templates list, all /blogs/* routes including detail pages)
  const hideRightSidebar = pathname?.startsWith('/explore') || pathname?.startsWith('/templates') || pathname?.startsWith('/blogs');
  // On blog detail pages (/blogs/some-slug), also hide the layout's left sidebar
  // so the page can use the full width for its own flex layout
  const isBlogDetail = /^\/blogs\/[^/]+/.test(pathname || '');

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

  // Listen to global requireAuth events
  useEffect(() => {
    const handleRequireAuthEvent = (e) => {
      requireAuth(e.detail || "engage");
    };
    window.addEventListener('requireAuth', handleRequireAuthEvent);
    return () => window.removeEventListener('requireAuth', handleRequireAuthEvent);
  }, []);

  // Guest clicking create post → show auth modal
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
        {/* Background Mesh Gradient (Subtle) */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-400/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-400/30 rounded-full blur-[120px]" />
        </div>

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
          {/* Left Sidebar (Floating) — hidden on blog detail pages since they manage their own layout */}
          {!isBlogDetail && (
            <div className="hidden lg:block w-[240px] flex-shrink-0">
                 <div className="fixed top-16 bottom-6 w-[240px] overflow-y-auto">
                    <Sidebar isGuest={isGuest} onRequireAuth={requireAuth} />
                 </div>
            </div>
          )}

          {/* Middle Content (Scrollable) */}
          <main className="flex-1 w-full min-w-0">
              <div className={isBlogDetail ? '' : 'pb-20'}>
                  {children}
              </div>
          </main>

          {/* Right Sidebar (Floating) */}
          {!hideRightSidebar && (
            <div className="hidden xl:block w-[320px] flex-shrink-0">
                 <div className="fixed top-16 bottom-6 w-[320px] overflow-y-auto">
                     <RightSidebar />
                 </div>
            </div>
          )}
        </div>

        {/* Global Create Project Modal (only for authenticated users) */}
        {!isGuest && (
          <CreateProjectModal
            isOpen={isCreatePostOpen}
            onClose={() => setIsCreatePostOpen(false)}
            onProjectCreated={() => {
              setIsCreatePostOpen(false);
              window.location.reload();
            }}
          />
        )}

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
      </div>
    </DashboardContext.Provider>
  );
}

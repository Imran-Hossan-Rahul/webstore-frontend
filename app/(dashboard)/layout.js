"use client";
import React, { useState, createContext } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import { usePathname } from "next/navigation";
import UserOnboardingModal from "@/components/dashboard/modals/UserOnboardingModal";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import ChatModal from "@/components/dashboard/chat/ChatModal";
import NotificationModal from "@/components/dashboard/notifications/NotificationModal";
import VerificationBanner from "@/components/dashboard/VerificationBanner";
import { useUser } from "@/context/UserContext";
import GlobalSocketListener from "@/components/dashboard/GlobalSocketListener";

export const DashboardContext = createContext();

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, isGuest } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("engage");

  const openChatWithUser = React.useCallback((userId) => {
    const event = new CustomEvent("open-chat", { detail: { userId } });
    window.dispatchEvent(event);
  }, []);

  // Layout logic
  const isAuthPage = pathname?.startsWith("/auth");
  const isFullWidthPage = ["/messages"].some(path => pathname?.startsWith(path));

  // Close mobile sidebar on route change
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (isAuthPage) return <>{children}</>;

  const hideRightSidebar = 
    pathname.startsWith("/chat") || 
    pathname.startsWith("/settings") || 
    (pathname.startsWith("/challenges/") && (
      pathname.split('/').filter(Boolean).length === 1 ||
      pathname.endsWith("/manage") ||
      pathname.endsWith("/submit")
    )) ||
    pathname.startsWith("/contracts");

  const requireAuth = (reason = "engage") => {
    setAuthModalReason(reason);
    setShowAuthModal(true);
  };

  return (
    <DashboardContext.Provider
      value={{
        user,
        isGuest,
        sidebarOpen,
        setSidebarOpen,
        searchQuery,
        setSearchQuery,
        isChatOpen: false,
        setIsChatOpen: () => window.dispatchEvent(new CustomEvent("toggle-chat")),
        isNotificationOpen: false,
        setIsNotificationOpen: () => window.dispatchEvent(new CustomEvent("toggle-notification")),
        requireAuth,
        openChatWithUser,
      }}
    >
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-blue-100 dark:selection:bg-indigo-500/30">
        <GlassNavbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCreatePost={() => setIsCreateModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleChat={() => window.dispatchEvent(new CustomEvent("toggle-chat"))}
          onToggleNotification={() => window.dispatchEvent(new CustomEvent("toggle-notification"))}
        />

        <div className="relative z-10 flex pt-24 px-4 lg:px-6 gap-6 min-h-screen max-w-[1800px] mx-auto">
          {/* Left Sidebar */}
          {!isFullWidthPage && (
            <div className="hidden lg:block w-[280px] flex-shrink-0">
              <div className="fixed top-24 bottom-6 w-[280px] overflow-y-auto scrollbar-hide">
                <Sidebar />
              </div>
            </div>
          )}

          {/* Mobile Sidebar Drawer Overlay */}
          {sidebarOpen && !isFullWidthPage && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Drawer Container */}
              <div className="relative flex-1 flex flex-col max-w-[300px] w-full bg-[#fafafa] dark:bg-slate-950 h-full p-4 transition-transform duration-300 z-50">
                <div className="flex items-center justify-between mb-4 px-2">
                  <span className="font-semibold text-sm uppercase tracking-wider text-slate-400">Navigation</span>
                  <button 
                    onClick={() => setSidebarOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <Sidebar />
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
              {!isFullWidthPage && <VerificationBanner user={user} />}
              <div className="pb-20">
                  {children}
              </div>
          </main>

          {/* Right Sidebar */}
          {!isFullWidthPage && !hideRightSidebar && (
            <div className="hidden xl:block w-[320px] flex-shrink-0">
                 <div className="fixed top-24 bottom-6 w-[320px] overflow-y-auto scrollbar-hide">
                     <RightSidebar />
                 </div>
            </div>
          )}
        </div>

        {/* Global Modals */}
        {!isGuest && (
          <>

            <UserOnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
            />
            <ChatModal />
            <NotificationModal />
            <GlobalSocketListener />
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


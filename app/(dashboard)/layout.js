"use client";
import React, { useState, createContext } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import RightSidebar from "@/components/dashboard/RightSidebar";
import GlassNavbar from "@/components/dashboard/GlassNavbar";
import { usePathname, useSearchParams } from "next/navigation";
import UserOnboardingModal from "@/components/dashboard/modals/UserOnboardingModal";
import AuthGuardModal from "@/components/ui/AuthGuardModal";
import ChatModal from "@/components/dashboard/chat/ChatModal";
import NotificationModal from "@/components/dashboard/notifications/NotificationModal";
import { useUser } from "@/context/UserContext";
import GlobalSocketListener from "@/components/dashboard/GlobalSocketListener";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MarketFooter from "@/components/dashboard/market/MarketFooter";

export const DashboardContext = createContext();

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isGuest } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalReason, setAuthModalReason] = useState("engage");
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

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
  }, [pathname, searchParams]);

  if (isAuthPage) return <>{children}</>;

  const hideRightSidebar = 
    pathname.startsWith("/chat") || 
    pathname.startsWith("/settings") || 
    pathname.startsWith("/u/") || 
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms") ||
    pathname.startsWith("/warranty") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/shop") ||
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
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
        <GlassNavbar 
          user={user} 
          isSidebarHovered={isSidebarHovered} 
          sidebarOpen={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenCreatePost={() => setIsCreateModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onToggleChat={() => window.dispatchEvent(new CustomEvent("toggle-chat"))}
          onToggleNotification={() => window.dispatchEvent(new CustomEvent("toggle-notification"))}
        />

        {/* Mobile Sidebar Drawer Overlay */}
        <AnimatePresence>
          {sidebarOpen && !isFullWidthPage && (
            <div className="lg:hidden fixed inset-0 z-[60] flex">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Drawer Container */}
              <motion.div 
                initial={{ x: "-100%", opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "-100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="relative flex-1 flex flex-col max-w-[240px] w-full bg-white/40 dark:bg-[#0a0a0a]/60 backdrop-blur-xl h-full p-4 pt-4 z-[60] border-r border-white/60 dark:border-white/10 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-6 pl-2">
                  <div className="flex items-center gap-2">
                     <img src="/logo.png" alt="Codalina" className="w-6 h-6 object-contain" />
                     <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">Codalina</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white transition-all bg-white/50 dark:bg-white/5 border border-white/60 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10">
                    <X strokeWidth={1.5} className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden pb-6">
                  <Sidebar isHovered={true} isCollapsed={false} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex pt-[44px] md:pt-20 px-0 sm:px-4 lg:px-6 gap-[30px] min-h-screen max-w-[1800px] mx-auto">
          {/* Left Sidebar - fixed overlay; doesn't shift main content */}
          {!isFullWidthPage && (
            <div className={`hidden lg:block flex-shrink-0 w-[72px] z-50`}>
              <div 
                className={`fixed top-16 bottom-6 z-50 transition-all duration-300 ${
                  isSidebarHovered ? 'w-[260px]' : 'w-[72px]'
                } overflow-x-hidden overflow-y-auto scrollbar-hide`}
                style={{ background: 'transparent' }}
                onMouseEnter={() => setIsSidebarHovered(true)}
                onMouseLeave={() => setIsSidebarHovered(false)}
              >
                <Sidebar isHovered={isSidebarHovered} isCollapsed={!isSidebarHovered} />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 transition-all duration-300 ${!isFullWidthPage ? 'w-full lg:w-[calc(100%-72px-30px)] xl:w-[calc(100%-240px-72px-60px)]' : 'w-full'} flex flex-col`}>
            <div className="flex-1">
              {children}
            </div>
            <MarketFooter />
          </main>

          {/* Right Sidebar */}
          {!isFullWidthPage && !hideRightSidebar && (
            <div className="hidden xl:block w-[240px] flex-shrink-0">
                 <div className="fixed top-16 bottom-6 w-[240px] overflow-y-auto scrollbar-hide">
                     <RightSidebar />
                 </div>
            </div>
          )}
        </div>

        {/* Global Modals */}
        <ChatModal />
        {!isGuest && (
          <>
            <UserOnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
            />
            <NotificationModal />
            <GlobalSocketListener />
          </>
        )}

        <AuthGuardModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          reason={authModalReason}
        />
        
        <MobileBottomNav />
      </div>
    </DashboardContext.Provider>
  );
}


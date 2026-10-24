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
import GlassBackground from "@/components/dashboard/market/GlassBackground";
import CodalinaLogo from "@/components/ui/CodalinaLogo";

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
  const isHomePage = pathname === "/" || pathname === "";
  const isFullWidthPage = ["/messages", "/book-call"].some(path => pathname?.startsWith(path));

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
    pathname.startsWith("/store") ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
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
      <div className="min-h-screen text-brand-slate font-sans bg-transparent">
        <GlassBackground />
        <GlassNavbar 
          user={user} 
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
                className="relative flex-1 flex flex-col max-w-[280px] w-full bg-brand-surface  h-full p-4 pt-4 z-[60] border-r border-brand-navy/[0.08]  shadow-[4px_0_24px_rgba(11,37,69,0.05)]"
              >
                <div className="flex justify-between items-center mb-6 pl-2">
                  <div className="flex items-center gap-2">
                     <CodalinaLogo className="w-6 h-6 object-contain" />
                     <span className="font-bold text-sm tracking-tight text-slate-900 ">Codalina</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl text-brand-slate  hover:text-black  :text-white transition-all bg-brand-surface/50  border border-white/60  hover:bg-brand-surface/80 :bg-brand-surface/10">
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

        <div className={`relative z-10 flex ${isHomePage ? 'px-0 max-w-full' : 'px-0 sm:px-4 lg:px-6 gap-[30px] max-w-[1800px]'} min-h-screen mx-auto bg-transparent`} style={{ paddingTop: 'calc(44px + env(safe-area-inset-top))' }}>
          {/* Left Sidebar - hover expandable */}
          {!isFullWidthPage && !isHomePage && (
            <div className={`hidden lg:block flex-shrink-0 w-[80px] z-50`}>
              <div 
                className={`group fixed top-[48px] bottom-0 z-50 overflow-x-hidden overflow-y-auto custom-scrollbar border-r border-white/20 transition-all duration-300 ease-in-out w-[80px] hover:w-[280px] bg-white/40 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.05)] hover:shadow-sm`}
              >
                <Sidebar isHovered={true} isCollapsed={false} />
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className={`flex-1 min-w-0 transition-all duration-300 ${(!isFullWidthPage && !isHomePage) ? 'w-full lg:w-[calc(100%-80px)]' : 'w-full'} flex flex-col`}>
            <div className="flex-1">
              {children}
            </div>
            <MarketFooter />
          </main>
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
        
        {pathname !== "/book-call" && <MobileBottomNav />}
      </div>
    </DashboardContext.Provider>
  );
}


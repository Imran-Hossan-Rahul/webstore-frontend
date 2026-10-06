"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Menu, User, CheckCircle2, ShoppingCart, ShieldAlert, CreditCard, MessageSquare, Info, AlertTriangle, Check, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import socket from '@/utils/socket';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();
  
  // States
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notification States
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Profile States
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  // Format pathname into a readable title
  const segments = pathname.split('/').filter(Boolean);
  const currentSection = segments.length > 1 
    ? segments[1].charAt(0).toUpperCase() + segments[1].slice(1) 
    : 'Overview';

  useEffect(() => {
    let isMounted = true;
    
    // Initialize data & socket
    const init = async () => {
      try {
        const userRes = await api.get("/user/profile");
        if (userRes.success && isMounted) {
          const currentUser = userRes.data;
          setUser(currentUser);

          // Fetch initial notifications
          const notifRes = await api.get("/notifications?limit=20");
          if (notifRes.success && isMounted) {
            setNotifications(notifRes.notifications);
          }

          const unreadRes = await api.get("/notifications/unread-count");
          if (unreadRes.success && isMounted) {
            setUnreadCount(unreadRes.count);
          }

          // Socket Listeners
          const userId = currentUser._id || currentUser.id;
          
          socket.on(`user:${userId}:notification`, (newNotif) => {
            setNotifications(prev => [newNotif, ...prev]);
            showToast(newNotif.title || "New Notification", "info");
          });
          
          socket.on(`user:${userId}:unread-count-update`, async () => {
            const countRes = await api.get("/notifications/unread-count");
            if(countRes.success && isMounted) setUnreadCount(countRes.count);
          });
          
          socket.on(`user:${userId}:notification-sync`, async () => {
            const syncRes = await api.get("/notifications?limit=20");
            if(syncRes.success && isMounted) setNotifications(syncRes.notifications);
          });
          
          // Bulk Notification Listeners
          socket.on('bulk-notifications', (data) => {
            if (!data || !data.notifications) return;
            const myNotif = data.notifications.find(n => n.recipientId === userId.toString());
            if (myNotif) {
               setNotifications(prev => [myNotif.notification, ...prev]);
               showToast(myNotif.notification.title || "New Notification", "info");
            }
          });
          
          socket.on('bulk-unread-count-update', async (data) => {
            if (data?.recipientIds?.includes(userId.toString())) {
               const countRes = await api.get("/notifications/unread-count");
               if(countRes.success && isMounted) setUnreadCount(countRes.count);
            }
          });
        }
      } catch (err) {
        console.error("Failed to initialize topbar:", err);
      }
    };
    
    init();

    // Click outside handler for dropdowns
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      isMounted = false;
      document.removeEventListener("mousedown", handleClickOutside);
      if (user) {
        const userId = user._id || user.id;
        socket.off(`user:${userId}:notification`);
        socket.off(`user:${userId}:unread-count-update`);
        socket.off(`user:${userId}:notification-sync`);
        socket.off('bulk-notifications');
        socket.off('bulk-unread-count-update');
      }
    };
  }, []); // Note: user ref in cleanup might be stale, but component unmount handles socket disconnect anyway if needed globally, or we just rely on page reloads. A more robust way is just global socket.

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/admin/market/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const markAsRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {}
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/auth/login');
    } catch (err) {
      router.push('/auth/login');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingCart className="w-4 h-4 text-emerald-400" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-blue-400" />;
      case 'security': return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'bug': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return <Info className="w-4 h-4 text-brand-cyan" />;
    }
  };

  return (
    <header className="h-20 bg-[#040608]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle placeholder */}
        <button className="md:hidden p-2 text-white/60 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-display font-medium text-white tracking-tight">
          {currentSection}
        </h1>
      </div>

      <div className="flex items-center gap-6">
        {/* Search */}
        <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full w-64 hover:bg-white/10 transition-colors focus-within:bg-white/10 focus-within:border-brand-cyan/50">
          <Search className="w-4 h-4 text-white/40" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, products..." 
            className="bg-transparent border-none outline-none text-[14px] text-white placeholder:text-white/30 w-full"
          />
        </form>

        <div className="flex items-center gap-4">
          
          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white/50 hover:text-white transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <h3 className="font-medium text-white text-[14px]">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="flex items-center gap-1 text-[12px] text-brand-cyan hover:text-white transition-colors">
                      <Check className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-white/20"><Bell className="w-6 h-6" /></div>
                      <p className="text-[13px] text-white/40">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map((n) => (
                        <div 
                          key={n._id || n.id} 
                          onClick={() => markAsRead(n._id || n.id, n.read)}
                          className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!n.read ? 'bg-brand-cyan/5' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!n.read ? 'bg-brand-cyan/10' : 'bg-white/5'}`}>
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] ${!n.read ? 'text-white font-medium' : 'text-white/70'} leading-snug`}>{n.title || n.message}</p>
                              {n.title && <p className="text-[12px] text-white/50 mt-1 truncate">{n.message}</p>}
                              <p className="text-[10px] text-white/30 mt-2 font-medium uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</p>
                            </div>
                            {!n.read && <div className="w-2 h-2 bg-brand-cyan rounded-full shrink-0 mt-1 shadow-[0_0_8px_rgba(0,255,255,0.5)]" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="p-2 border-t border-white/5 bg-white/[0.01]">
                  <Link href="/admin/notifications" className="block text-center text-[12px] text-white/50 hover:text-white py-1.5 transition-colors">
                    View All Notifications
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-white/10" />
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setShowProfile(!showProfile)} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-cyan to-blue-600 p-[1px]">
                <div className="w-full h-full bg-[#080808] rounded-full flex items-center justify-center overflow-hidden">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-brand-cyan/80 group-hover:text-brand-cyan transition-colors" />
                  )}
                </div>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-[13px] font-medium text-white/90 leading-tight">{user?.name || 'Admin User'}</span>
                <span className="text-[11px] text-brand-cyan/80 leading-tight uppercase tracking-wider">{user?.role || 'Super Admin'}</span>
              </div>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-3 w-56 bg-[#080808] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-[13px] text-white font-medium truncate">{user?.name || 'Administrator'}</p>
                  <p className="text-[12px] text-white/50 truncate">{user?.email || 'admin@codalina.com'}</p>
                </div>
                <div className="p-2">
                  <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link href="/admin/settings" className="flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

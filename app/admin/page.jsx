"use client";

import UnifiedAdminDashboard from "@/components/AdminComponents/UnifiedAdminDashboard";
import Background from "@/components/Background";
import TrackerPatron from "@/components/TrackerPatron";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { LoadingState } from "@/components/ui/States";
;

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.success) {
          const userData = res.data;
          if (userData.role === 'admin' || userData.role === 'superadmin') {
            setUser(userData);
            setIsAuthorized(true);
          } else {
            router.push('/dashboard');
          }
        } else {
          router.push('/auth/login');
        }
      } catch (err) {
        console.error("Admin Auth Check Failed", err);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center ] bg-brand-main">
        <AppleSpinner className="animate-spin text-brand-blue mb-4" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Verifying Admin Privileges</p>
      </div>
    );
  }

  return (
    <Background>
      <TrackerPatron />
      
      <div className="min-h-screen overflow-hidden bg-brand-main">
        <UnifiedAdminDashboard />
      </div>
    </Background>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  ShieldAlert, 
  ArrowUpRight,
  Activity
} from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Basic auth check (simulated for UI demonstration)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/user/profile");
        if (res.success && (res.data.role === 'admin' || res.data.role === 'superadmin')) {
          setUser(res.data);
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue", value: "$124,500", trend: "+14.5%", icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Active Subscriptions", value: "842", trend: "+5.2%", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Pending Orders", value: "14", trend: "-2.1%", icon: ShoppingCart, color: "text-brand-cyan", bg: "bg-brand-cyan/10" },
    { label: "Security Alerts", value: "3", trend: "+1", icon: ShieldAlert, color: "text-red-400", bg: "bg-red-400/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-brand-cyan/10 to-blue-600/10 border border-white/5 overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-display font-medium text-white mb-2">
            Welcome back, {user?.name || 'Admin'}
          </h2>
          <p className="text-white/60 text-[15px] max-w-xl">
            Here&apos;s what&apos;s happening with your platform today. You have 14 pending orders and 3 security alerts that need your attention.
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-cyan/20 to-transparent blur-3xl opacity-50" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="flex items-center gap-1 text-[13px] font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                {stat.trend} <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <h3 className="text-white/50 text-[14px] font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-display font-semibold text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Recent Activity</h3>
            <button className="text-[13px] text-brand-cyan hover:text-white transition-colors">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] text-white">New order <span className="font-medium text-brand-cyan">#ORD-{9823 + i}</span> placed for Custom E-Commerce.</p>
                  <p className="text-[12px] text-white/40">2 minutes ago</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-white/10 text-[12px] font-medium text-white hover:bg-white/20 transition-colors">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl">
          <h3 className="text-lg font-medium text-white mb-6">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <button className="p-4 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 hover:bg-brand-cyan/20 transition-colors text-left flex flex-col gap-1">
              <span className="font-medium text-brand-cyan text-[14px]">Create New Product</span>
              <span className="text-[12px] text-brand-cyan/60">Upload new source code or script</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left flex flex-col gap-1">
              <span className="font-medium text-white text-[14px]">Generate License</span>
              <span className="text-[12px] text-white/40">Manually issue a domain license</span>
            </button>
            <button className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors text-left flex flex-col gap-1">
              <span className="font-medium text-white text-[14px]">Review Alerts</span>
              <span className="text-[12px] text-white/40">Check 3 unresolved security flags</span>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}

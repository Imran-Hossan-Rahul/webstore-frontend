"use client";
import { getOptimizedUrl } from "@/utils/optimizeImage";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { ViewsWidget, DownloadsWidget, CountryWidget, EarningsWidget } from "./DashboardWidgets";
import { DashboardModal, ViewsTable, DownloadsTable, DetailedCountryTable, EarningsTable } from "./DashboardModals";
import OnboardingWizard from "@/components/Onboarding/OnboardingWizard";
import CraftsmanProfileModal from "@/components/DashboardComponents/CraftsmanProfileModal";
import { LayoutGrid, Mail, CheckSquare, Send, Clock, Headphones, Settings, ChevronDown, Plus, BookOpen, FileText } from "lucide-react";
import axios from "axios";

export default function CraftsmanDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null); // 'views', 'downloads', 'country', 'earnings', 'profile'
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [data, setData] = useState({
      totalViews: 0,
      totalDownloads: 0,
      totalEarnings: 0,
      viewsData: [],
      downloadsData: [],
      countryData: [],
      earningsData: [],
      artifacts: [] // Store raw artifacts for detailed tables
  });

  useEffect(() => {
    fetchDashboardData();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
        const res = await api.get("/user/profile");
        if (res.success && !res.data.hasCompletedOnboarding) {
            setShowOnboarding(true);
        }
    } catch (err) {
        console.error("Failed to check onboarding status", err);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch My Artifacts (for Views & Downloads)
      const artifactsRes = await api.get("/artifact/my-artifacts");
      const artifacts = artifactsRes.data || [];

      // Process for Total Views & Views Graph
      const totalViews = artifacts.reduce((sum, t) => sum + (t.viewsCount || 0), 0);
      const totalDownloads = artifacts.reduce((sum, t) => sum + (t.downloadsCount || 0), 0);
      
      let viewsData = [];
      try {
          const historyRes = await api.get("/stats/craftsman/views-history");
          if (historyRes.success && historyRes.data && historyRes.data.length > 0) {
              viewsData = historyRes.data.map(item => ({
                  date: item.date,
                  views: item.views || 0
              }));
          } else {
          }
      } catch (err) {
          console.error('❌ Error:', err);
      }

      const downloadsData = []; // Real tracking will start from now

      // 2. Fetch Earnings
      const payoutRes = await api.get("/payout/summary");
      const payout = payoutRes.summary || {};
      const totalEarnings = payout.totalEarnings || 0;
      const earningsData = []; // Real tracking will start from now

      // 3. Fetch Country Stats
      let countryData = [];
      try {
        const countryRes = await api.get("/stats/countries/top5");
        if (countryRes.success) {
            countryData = (countryRes.data || []).map(item => ({
                country: item.country,
                visitors: item.count
            }));
        }
      } catch (err) {
          console.error("Failed to fetch country stats", err);
      }

      setData({
          totalViews,
          totalDownloads,
          totalEarnings,
          viewsData,
          downloadsData,
          countryData,
          earningsData,
          artifacts
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#F3F6F8]">
              <div className="text-xl font-semibold text-slate-500">Loading Dashboard...</div>
          </div>
      )
  }

  // Generic modal close handler
  const closeModal = () => setActiveModal(null);

  return (
    <div className="flex min-h-screen bg-[#F3F6F8] font-sans antialiased text-slate-800">
      
      {/* --- MODALS --- */}
      
      {/* 1. Views Modal */}
      <DashboardModal 
        isOpen={activeModal === 'views'} 
        onClose={closeModal} 
        title="Artifact Views Analytics"
      >
        <ViewsTable artifacts={data.artifacts} />
      </DashboardModal>

      {/* 2. Downloads Modal */}
      <DashboardModal 
        isOpen={activeModal === 'downloads'} 
        onClose={closeModal} 
        title="Download History & Revenue"
      >
        <DownloadsTable artifacts={data.artifacts} />
      </DashboardModal>

       {/* 3. Country Modal */}
       <DashboardModal 
        isOpen={activeModal === 'country'} 
        onClose={closeModal} 
        title="Visitor Geography"
      >
        <DetailedCountryTable data={data.countryData} />
      </DashboardModal>

      {/* 4. Earnings Modal */}
      <DashboardModal 
        isOpen={activeModal === 'earnings'} 
        onClose={closeModal} 
        title="Earnings & Payouts"
      >
        <EarningsTable earnings={`${data.totalEarnings.toFixed(2)}`} />
      </DashboardModal>


       <CraftsmanProfileModal 
        isOpen={activeModal === 'profile'} 
        onClose={closeModal} 
      />

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard onComplete={() => setShowOnboarding(false)} />
      )}


      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 gap-8 bg-white/50 backdrop-blur-md z-40">
        <div className="mb-4">
             <div className="w-8 h-8 bg-black rounded-lg transform rotate-45 flex items-center justify-center cursor-pointer" onClick={() => router.push('/')}>
                 <div className="w-3 h-3 bg-white rounded-full transform -rotate-45"></div>
             </div>
        </div>
        <nav className="flex flex-col gap-6 w-full items-center">
           <NavItem icon={<LayoutGrid size={20} />} active onClick={() => {}} />
           <NavItem icon={<Mail size={20} />} onClick={() => router.push('/messages')} />
           <NavItem icon={<CheckSquare size={20} />} onClick={() => router.push('/tasks')} />
           <NavItem icon={<Send size={20} />} onClick={() => router.push('/user/craftsman/chat')} />
           <NavItem icon={<Clock size={20} />} onClick={() => router.push('/history')} />
           <NavItem icon={<FileText size={20} />} onClick={() => router.push('/user/craftsman/posts')} />
           {/* Artifacts and Devlogs hidden for now
           <NavItem icon={null} onClick={() => router.push('/user/craftsman/devlog-posts')} />
           <NavItem icon={<LayoutGrid size={20} />} onClick={() => router.push('/user/craftsman/artifacts')} />
           */}

           <NavItem icon={<Settings size={20} />} onClick={() => router.push('/settings')} />
        </nav>
        <div className="mt-auto">
             <div className="w-10 h-10 rounded-full bg-slate-300 border-2 border-white shadow-sm overflow-hidden cursor-pointer" onClick={() => setActiveModal('profile')}>
                 <img src={getOptimizedUrl("https://ui-avatars.com/api/?name=User")} alt="User" />
             </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-20 p-8 md:p-12 overflow-y-auto w-full">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
          <div>
            <h1 className="text-5xl font-bold text-black tracking-tight mb-2">Dashboard</h1>
            <div className="flex items-center text-slate-500 font-medium cursor-pointer hover:text-brand-slate">
              <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <ChevronDown size={16} className="ml-1" />
            </div>
          </div>
          
          <div className="flex gap-12 mt-6 md:mt-0">
             <HeadStat value={`${data.totalEarnings}`} label="Total Earnings" />
             <HeadStat value={data.totalDownloads} label="Total Downloads" />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 h-auto lg:h-[800px]">
             {/* 
             1. Views Widget (Hidden Temporarily)
             <div className="lg:h-[380px]">
                <ViewsWidget 
                    title="Total Views" 
                    totalViews={data.totalViews.toLocaleString()}
                    data={data.viewsData}
                    onClick={() => setActiveModal('views')}
                />
             </div>

             2. Downloads Widget (Hidden Temporarily)
             <div className="lg:h-[380px]">
                <DownloadsWidget 
                    title="Download History"
                    totalDownloads={data.totalDownloads.toLocaleString()}
                    data={data.downloadsData}
                    onClick={() => setActiveModal('downloads')}
                />
             </div>
             */}

             {/* 3. Country Widget */}
             <div className="lg:h-[380px]">
                <CountryWidget 
                    title="Top Countries" 
                    data={data.countryData}
                    onClick={() => setActiveModal('country')}
                />
             </div>

             {/* 4. Earnings Widget */}
             <div className="lg:h-[380px]">
                <EarningsWidget 
                    title="Earnings Overview"
                    totalEarnings={`${data.totalEarnings.toFixed(2)}`}
                    data={data.earningsData}
                    onClick={() => setActiveModal('earnings')}
                />
             </div>
        </div>

      </main>
    </div>
  );
}

function NavItem({ icon, active, onClick }) {
    return (
        <div 
            onClick={onClick}
            className={`p-3 rounded-full cursor-pointer transition-all duration-200 ${active ? 'bg-black text-white shadow-lg' : 'text-slate-400 hover:bg-white hover:text-brand-slate'}`}
        >
            {icon}
        </div>
    )
}

function HeadStat({ value, label }) {
    return (
        <div className="text-right">
             <div className="flex items-center justify-end gap-3 mb-1">
                 <span className="text-5xl font-bold text-black">{value}</span>
             </div>
             <p className="text-slate-500 text-sm font-medium">{label}</p>
        </div>
    )
}

function generateEmptyHistory() {
    const now = new Date();
    const data = [];
    
    // Generate last 30 days with 0 values
    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        data.push({
            date: date.toISOString(),
            views: 0
        });
    }
    
    return data;
}

function generateMockHistory(total, keyName, days = 30) {
    const now = new Date();
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const baseValue = Math.floor(total / days);
        const variance = Math.floor(Math.random() * (baseValue * 0.3));
        const value = i === 0 ? total - data.reduce((sum, d) => sum + d[keyName], 0) : baseValue + variance;
        
        data.push({
            date: date.toISOString(),
            [keyName]: Math.max(0, value)
        });
    }
    
    return data;
}




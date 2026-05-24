"use client";
import React, { useState, useEffect, useContext } from "react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";
import { DashboardContext } from "@/app/(dashboard)/layout";
import { 
   CheckCircle, FileText, ArrowRight, 
   Search, Filter, Clock, User, ShieldCheck,
   ChevronRight, Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "../ui/EmptyState";
import CraftsmanHoverCard from "./cards/CraftsmanHoverCard";

export default function WorkspacePage() {
  const router = useRouter();
  const { user } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchContracts();
    }
  }, [user]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/contracts");
      if (res.success && res.data) {
        setContracts(res.data);
      }
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch contracts", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;


  const filteredContracts = contracts.filter(c => 
    (c.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full max-w-[1112px] pb-20 animate-in fade-in duration-500 mx-auto">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Active Devlogs</h1>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-48 bg-slate-50 dark:bg-white/5 rounded-2xl animate-pulse" />
           ))}
        </div>
      ) : filteredContracts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {filteredContracts.map(contract => {
              const isHired = contract.status === "active" || contract.status === "hired";
              const partner = contract.patron?._id === user._id ? contract.craftsman : contract.patron;
              
              return (
                <div 
                  key={contract._id}
                  onClick={() => router.push(`/contracts/${contract._id}`)}
                  className="group bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                >
                   <div className="flex justify-between items-start mb-3 gap-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                         {contract.job?.title || contract.title}
                      </h3>
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest border shrink-0 ${
                        contract.status === 'active' || contract.status === 'hired'
                          ? 'bg-white text-slate-900 border-slate-200 shadow-sm' 
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                         {contract.status}
                      </span>
                   </div>

                   <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1.5">
                         <User size={12} className="text-slate-400" />
                         <CraftsmanHoverCard
                            userId={partner?._id}
                            displayName={partner?.name}
                            username={partner?.username}
                            avatarUrl={partner?.profilePicture}
                         >
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter hover:text-slate-900 dark:hover:text-white transition-colors">
                               {partner?.name}
                            </span>
                         </CraftsmanHoverCard>
                      </div>
                      <span className="text-gray-300 dark:text-white/10 text-xs">•</span>
                      <div className="flex items-center gap-1.5">
                         <Calendar size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                            Started {new Date(contract.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                      <div>
                         <p className="text-xs font-bold text-slate-900 dark:text-white">{contract.agreedBudget} TKNS</p>
                         <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{contract.budgetType}</p>
                      </div>
                      <button className="flex items-center gap-2 text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest group-hover:gap-3 transition-all">
                         Open Devlog <ChevronRight size={14} />
                      </button>
                   </div>
                </div>
              );
           })}
        </div>
      ) : (
        <EmptyState 
          title="No Active Devlogs" 
          description="Your global workspace is currently empty. Explore jobs to find your next professional challenge." 
        />
      )}
    </div>
  );
}



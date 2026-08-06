"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { Search, Calendar, ChevronLeft, ChevronRight, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import { getOptimizedUrl } from "@/utils/optimizeImage";

const UserDirectory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/stats/users?page=${page}&search=${search}&role=${role}`);
      if (res.success) {
        setUsers(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUserClick = (id) => {
    router.push(`/admin/users/${id}`);
  };

  return (
    <div className="relative min-h-[600px] space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-[#0A0A0A] p-6 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Search directory..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[20px] outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600/50 transition-all text-sm font-medium"
          />
        </form>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200/50 dark:border-white/5">
          {['', 'patron', 'craftsman', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRole(r); setPage(1); }}
              className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                role === r 
                  ? 'bg-white dark:bg-[#111] text-blue-600 shadow-xl shadow-blue-500/5 border border-slate-200/50 dark:border-white/10' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              {r || 'All Entities'}
            </button>
          ))}
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="bg-white dark:bg-[#0A0A0A] rounded-[40px] border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-white/[0.01]">
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Entity</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Access Level</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compliance</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registry Date</th>
                <th className="px-8 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10" />
                  </tr>
                ))
              ) : users.map((user) => (
                <tr 
                  key={user._id} 
                  onClick={() => handleUserClick(user._id)}
                  className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-all duration-300"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md group-hover:-translate-y-0.5 transition-opacity duration-500">
                        <img 
                          src={user.profilePicture ? getOptimizedUrl(user.profilePicture) : 'https://ui-avatars.com/api/?name=User&background=random'} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors tracking-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-widest mt-1 opacity-70">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest ${
                      user.role === 'admin' || user.role === 'superadmin'
                        ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        : user.role === 'craftsman'
                        ? 'bg-indigo-600/10 text-blue-600 border border-indigo-600/20'
                        : user.role === 'patron'
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                       {user.isVerified ? (
                         <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                            <ShieldCheck size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Authorized</span>
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-slate-400 bg-slate-400/10 px-3 py-1.5 rounded-xl border border-slate-400/20">
                            <Clock size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Registry Pending</span>
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                       <Calendar size={12} className="opacity-40" />
                       {new Date(user.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="w-12 h-12 ml-auto rounded-[20px] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-500">
                       <ArrowUpRight size={18} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Minimal Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-6 px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Registry Page {page} <span className="opacity-30">/</span> {pagination.pages}
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 disabled:opacity-20 hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={page === pagination.pages}
              onClick={() => setPage(p => p + 1)}
              className="px-8 h-12 rounded-2xl bg-slate-900 dark:bg-white text-[10px] font-bold uppercase tracking-widest text-white dark:text-slate-900 disabled:opacity-20 hover:opacity-90 transition-all shadow-lg"
            >
              Next Registry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDirectory;


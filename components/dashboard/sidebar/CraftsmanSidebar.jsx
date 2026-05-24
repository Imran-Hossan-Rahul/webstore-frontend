"use client";
import React from "react";
import useSWR from "swr";
import { api } from "@/utils/api";
import { usePathname } from "next/navigation";
import { 
  ArrowRight, Briefcase, DollarSign, Github, CheckCircle, ShieldCheck, Linkedin
} from "lucide-react";
import { DashboardContext } from "@/app/(dashboard)/layout";
import BecomePatronModal from "../../DashboardComponents/BecomePatronModal";
import CraftsmanAccountModal from "../../DashboardComponents/CraftsmanAccountModal";
import MentorshipBookingModal from "../modals/MentorshipBookingModal";

const fetcher = (url) => api.get(url).then((res) => res.data);

export default function CraftsmanSidebar() {
  const pathname = usePathname();
  const usernameFromUrl = pathname?.split("/")[2];
  const { user, isGuest, requireAuth } = React.useContext(DashboardContext) || {};
  const [showCraftsmanModal, setShowCraftsmanModal] = React.useState(false);
  const [showPatronModal, setShowPatronModal] = React.useState(false);
  const [showMentorshipModal, setShowMentorshipModal] = React.useState(false);
  
  const isOwnProfile = user?.username?.toLowerCase() === usernameFromUrl?.toLowerCase();
  const endpoint = usernameFromUrl 
    ? (isOwnProfile ? "/user/profile" : `/user/profile/${usernameFromUrl}`)
    : null;

  const { data: response, error } = useSWR(endpoint, fetcher);
  const profile = response;

  if (!profile && !error) return null;
  if (error) return null;

  const isOwner = isOwnProfile;


  return (
    <aside className="h-full flex flex-col gap-6 pb-10 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* 0. Identity Trust Panel */}
      {(profile.connectedAccounts?.github?.connected || profile.connectedAccounts?.google?.connected || profile.isVerified) && (
        <div className="bg-indigo-50/50 dark:bg-slate-900 border border-indigo-100 dark:border-white/5 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-indigo-600/10 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Trust & Verification</h3>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Verified identity signals</p>
                 </div>
              </div>

              <div className="flex flex-col gap-2">
                {profile.connectedAccounts?.google?.connected && (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-2">
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                       </svg>
                       <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Verified by Google</span>
                    </div>
                    <CheckCircle size={12} className="text-emerald-500" />
                  </div>
                )}
                {profile.connectedAccounts?.github?.connected && (
                  <div className="flex items-center justify-between p-3 bg-slate-900 text-white rounded-xl shadow-lg shadow-black/10">
                    <div className="flex items-center gap-2">
                       <Github size={14} />
                       <span className="text-[10px] font-bold">GitHub Verified</span>
                    </div>
                    <CheckCircle size={12} className="text-emerald-400" />
                  </div>
                )}
                {profile.connectedAccounts?.linkedin?.connected && (
                  <div className="flex items-center justify-between p-3 bg-[#0077b5] text-white rounded-xl shadow-lg shadow-blue-500/10">
                    <div className="flex items-center gap-2">
                       <Linkedin size={14} />
                       <span className="text-[10px] font-bold">LinkedIn Verified</span>
                    </div>
                    <CheckCircle size={12} className="text-white/80" />
                  </div>
                )}
                {profile.isVerified && (
                   <div className="flex items-center justify-between p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20">
                     <div className="flex items-center gap-2">
                        <CheckCircle size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Platform Certified</span>
                     </div>
                   </div>
                )}
              </div>
            </div>
        </div>
      )}

      {/* 1. Financials Card (Owner Only) */}
      {(isOwner && !profile?.privacy?.isRestricted) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-7 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {(profile.walletBalance || 0).toLocaleString()} 
                    <span className="text-xs ml-1 text-slate-400 font-medium">TKNS</span>
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50 dark:border-white/5">
               <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Total Earned</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{(profile.totalEarnings || 0).toLocaleString()}</p>
               </div>
               {profile.pendingPayout > 0 && (
                 <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pending</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{(profile.pendingPayout || 0).toLocaleString()}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Stats Card */}
      {!profile?.privacy?.isRestricted && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-7 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{(profile.followersCount || 0).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Followers</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{(profile.followingCount || 0).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Following</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{(profile.completedDevlogs || 0).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Devlogs</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
              <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{((profile.totalViews || 0) + (profile.totalLikes || 0)).toLocaleString()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Reach</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01] col-span-2">
              <div className="flex items-center justify-between mb-4">
                 <div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mb-1">{profile.gamification?.level || 1}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Current Level</p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{(Number(profile.gamification?.xp) || 0).toLocaleString()} XP</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Earned</p>
                 </div>
              </div>
              
              {/* XP Progress Bar */}
              {(() => {
                 const currentXP = Number(profile.gamification?.xp) || 0;
                 const currentLevel = Number(profile.gamification?.level) || 1;
                 const xpForCurrentLevel = Math.pow((currentLevel - 1) * 10, 2);
                 const xpForNextLevel = Math.pow(currentLevel * 10, 2);
                 const xpProgress = currentXP - xpForCurrentLevel;
                 const xpRequiredForNext = xpForNextLevel - xpForCurrentLevel;
                 const progressPercent = Math.min((xpProgress / xpRequiredForNext) * 100, 100);

                 return (
                   <div className="space-y-2">
                      <div 
                        className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden cursor-help"
                        title={`Current: ${currentXP.toLocaleString()} XP`}
                      >
                         <div 
                           className="h-full bg-slate-900 dark:bg-white transition-all duration-1000" 
                           style={{ width: `${progressPercent}%` }}
                         />
                      </div>
                      <div className="flex justify-between items-center">
                         <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">Next Level at</p>
                         <p className="text-[8px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">
                           {xpForNextLevel.toLocaleString()} XP
                         </p>
                      </div>
                   </div>
                 );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 3. Expertise Focus */}
      {(!profile?.privacy?.isRestricted && profile.skills?.length > 0) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-7 shadow-sm">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-5">Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.slice(0, 6).map((skill, i) => (
              <span 
                key={i} 
                className="px-3.5 py-1.5 border border-slate-200 dark:border-white/10 rounded-xl text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Professional Status & Availability */}
      {(!profile?.privacy?.isRestricted && (profile.availabilityStatus || profile.hourlyRate || profile.workType || profile.openToWork)) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl p-7 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Professional</h3>
            {profile.openToWork && (
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">Open to Work</span>
            )}
          </div>
          
          <div className="space-y-4">
            {profile.availabilityStatus && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    profile.availabilityStatus === 'available' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    profile.availabilityStatus === 'busy' ? 'bg-amber-500' :
                    profile.availabilityStatus === 'vacation' ? 'bg-blue-500' : 'bg-red-500'
                  }`} />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                </div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                  {profile.availabilityStatus}
                </p>
              </div>
            )}

            {profile.hourlyRate > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate</p>
                </div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                  ${profile.hourlyRate}/hr
                </p>
              </div>
            )}

            {profile.workType && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Style</p>
                </div>
                <p className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight capitalize">
                  {profile.workType}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4.5. Mentorship Booking CTA (For Visitors) */}
      {!isOwner && (profile.isVerified || profile.gamification?.level >= 3) && (
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-lg shadow-indigo-500/20 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <CheckCircle size={100} className="transform rotate-12" />
           </div>
           <div className="relative z-10">
              <h3 className="text-sm font-black uppercase tracking-widest mb-1">Elite Mentorship</h3>
              <p className="text-xs font-medium text-white/80 mb-4 line-clamp-2">
                Book a 1-on-1 session with {profile.name} to accelerate your growth.
              </p>
              <button 
                onClick={() => isGuest ? requireAuth("engage") : setShowMentorshipModal(true)}
                className="w-full py-3 bg-white text-indigo-600 hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md"
              >
                Book Session ({profile.mentorshipRate || 50} TKNS)
              </button>
           </div>
        </div>
      )}


      {/* 5. Role Conversion CTAs */}
      {isOwner && (
        <div className="space-y-3">
            {!user?.hasCraftsmanAccount && (
              <button 
                onClick={() => isGuest ? requireAuth("engage") : setShowCraftsmanModal(true)}
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 p-5 rounded-2xl transition-all hover:opacity-90"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Become Craftsman</p>
                  <ArrowRight size={14} />
                </div>
              </button>
            )}

            {user?.role !== 'patron' && (
              <button 
                onClick={() => isGuest ? requireAuth("engage") : setShowPatronModal(true)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-5 rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-white/5 text-slate-900 dark:text-white"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em]">become a patron</p>
                  <ArrowRight size={14} />
                </div>
              </button>
            )}
        </div>
      )}

      <CraftsmanAccountModal isOpen={showCraftsmanModal} onClose={() => setShowCraftsmanModal(false)} />
      <BecomePatronModal isOpen={showPatronModal} onClose={() => setShowPatronModal(false)} />
      <MentorshipBookingModal isOpen={showMentorshipModal} onClose={() => setShowMentorshipModal(false)} mentor={profile} />
    </aside>
  );
}


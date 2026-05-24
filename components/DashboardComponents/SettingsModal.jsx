"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, User, CreditCard, Shield, Settings as SettingsIcon, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/components/ui/ToastProvider";

export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("general");
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [craftsmanProfile, setCraftsmanProfile] = useState(null);
  const { showToast } = useToast();
  
  // Detect if we're on a craftsman route
  const isCraftsmanRoute = pathname?.startsWith("/user/craftsman");

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const res = await api.get("/user/profile");
        if (res.success) {
            setUser(res.data);
            
            // If on craftsman route or user is a craftsman, try to load craftsman profile
            if (res.data.hasCraftsmanAccount) {
                 const craftsmanRes = await api.get("/craftsman/profile");
                 if (craftsmanRes.success) setCraftsmanProfile(craftsmanRes.data);
            }
        }
    } catch (error) {
        console.error("Failed to fetch settings", error);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  const displayContext = isCraftsmanRoute ? "Craftsman" : "Account";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" style={{ position: 'fixed' }}>
      <div className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-2xl w-full max-w-4xl h-[85vh] shadow-2xl shadow-black/20 flex overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50/50 dark:bg-white/5 p-6 flex flex-col border-r border-slate-200/50 dark:border-white/10">
          <h2 className="text-2xl font-bold mb-8 pl-2 text-slate-900 dark:text-white">
            {isCraftsmanRoute ? "Craftsman Settings" : "Settings"}
          </h2>
          <nav className="space-y-2">
            <TabButton id="general" label="General" icon={<User size={18}/>} active={activeTab} onClick={setActiveTab} />
            {(isCraftsmanRoute || user?.hasCraftsmanAccount) && (
              <TabButton id="payout" label="Payouts" icon={<CreditCard size={18}/>} active={activeTab} onClick={setActiveTab} />
            )}
            <TabButton id="security" label="Security" icon={<Shield size={18}/>} active={activeTab} onClick={setActiveTab} />
            <TabButton id="account" label="Account" icon={<SettingsIcon size={18}/>} active={activeTab} onClick={setActiveTab} />
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col h-full bg-transparent relative">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors z-10"
            >
                <X size={20} className="text-slate-500 dark:text-slate-400" />
            </button>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col gap-3">
                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                        <p className="text-slate-400 text-sm">Loading settings...</p>
                    </div>
                ) : user ? (
                    <>
                        {activeTab === 'general' && (
                            <GeneralSettings 
                                user={user} 
                                craftsmanProfile={craftsmanProfile}
                                isCraftsmanMode={isCraftsmanRoute && !!craftsmanProfile}
                                refreshData={fetchData}
                                showToast={showToast}
                            />
                        )}
                        {activeTab === 'payout' && <PayoutSettings user={user} refreshUser={fetchData} showToast={showToast} />}
                        {activeTab === 'security' && <SecuritySettings user={user} showToast={showToast} />}
                        {activeTab === 'account' && <AccountSettings user={user} refreshUser={fetchData} showToast={showToast} />}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-red-500 font-medium">Failed to load user data</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );

  // Use portal to render at body level
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  
  return null;
}

function TabButton({ id, label, icon, active, onClick }) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm ${
                isActive 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-md shadow-black/10 dark:shadow-white/10" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

function GeneralSettings({ user, craftsmanProfile, isCraftsmanMode, refreshData, showToast }) {
    // Initial state depends on mode
    const [form, setForm] = useState({
        // Common / Swapped fields
        name: isCraftsmanMode ? (craftsmanProfile?.displayName || "") : (user.name || ""),
        bio: isCraftsmanMode ? (craftsmanProfile?.bio || "") : (user.bio || ""),
        skills: isCraftsmanMode 
            ? (craftsmanProfile?.skills ? craftsmanProfile.skills.join(", ") : "") 
            : (user.skills ? user.skills.join(", ") : ""),
        
        // Mode specific fields
        workType: isCraftsmanMode ? (craftsmanProfile?.workType || "solo") : (user.workType || "solo"),
        profilePicture: isCraftsmanMode ? (craftsmanProfile?.profilePicture || "") : (user.profilePicture || ""),
        portfolio: isCraftsmanMode ? JSON.stringify(craftsmanProfile?.portfolio || []) : "" // simplified for now
    });

    const [saving, setSaving] = useState(false);

    // Update form when mode or data changes
    useEffect(() => {
         setForm({
            name: isCraftsmanMode ? (craftsmanProfile?.displayName || "") : (user.name || ""),
            bio: isCraftsmanMode ? (craftsmanProfile?.bio || "") : (user.bio || ""),
            skills: isCraftsmanMode 
                ? (craftsmanProfile?.skills ? craftsmanProfile.skills.join(", ") : "") 
                : (user.skills ? user.skills.join(", ") : ""),
            workType: isCraftsmanMode ? (craftsmanProfile?.workType || "solo") : (user.workType || "solo"),
            profilePicture: isCraftsmanMode ? (craftsmanProfile?.profilePicture || "") : (user.profilePicture || ""),
        });
    }, [isCraftsmanMode, user, craftsmanProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s);
            
            if (isCraftsmanMode) {
                 // Update CRAFTSMAN Profile
                 await api.patch("/craftsman/profile", {
                    displayName: form.name,
                    bio: form.bio,
                    skills: skillsArray,
                    workType: form.workType,
                 });
                 showToast("Craftsman profile updated successfully!", "success", "Saved!");
            } else {
                 await api.patch("/user/profile", {
                    name: form.name,
                    bio: form.bio,
                    skills: skillsArray,
                    workType: form.workType,
                    profilePicture: form.profilePicture
                 });
                 showToast("User profile updated successfully!", "success", "Saved!");
            }
           
            await refreshData();
        } catch (err) {
            console.error(err);
            showToast("Failed to update profile. Please try again.", "error", "Error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-xl space-y-6">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
                {isCraftsmanMode ? "Craftsman Information" : "General Information"}
            </h3>
            
            <div className="space-y-5">
                {!isCraftsmanMode && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Avatar URL</label>
                        <input 
                            type="text" 
                            value={form.profilePicture}
                            onChange={e => setForm({...form, profilePicture: e.target.value})}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all shadow-sm"
                            placeholder="https://..."
                        />
                         <p className="text-xs text-slate-500 mt-1.5">Or use the upload feature in the Profile.</p>
                    </div>
                )}
                
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">
                        {isCraftsmanMode ? "Display Name" : "Full Name"}
                   </label>
                   <input 
                      type="text" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all shadow-sm"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Bio</label>
                   <textarea 
                      value={form.bio}
                      onChange={e => setForm({...form, bio: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all resize-none h-32 shadow-sm"
                      placeholder="Tell us about yourself..."
                   />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Skills (comma separated)</label>
                   <input 
                      type="text" 
                      value={form.skills}
                      onChange={e => setForm({...form, skills: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all shadow-sm"
                      placeholder="React, Node.js, Design..."
                   />
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Work Type</label>
                   <div className="flex gap-4">
                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all shadow-sm ${form.workType === 'solo' ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/10 ring-1 ring-pink-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}>
                            <input type="radio" name="workType" value="solo" checked={form.workType === 'solo'} onChange={() => setForm({...form, workType: 'solo'})} className="hidden" />
                            <div className="font-bold text-sm text-slate-900 dark:text-white">Solo Craftsman</div>
                            <div className="text-xs text-slate-500 mt-1">I work by myself</div>
                        </label>
                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all shadow-sm ${form.workType === 'team' ? 'border-pink-500 bg-pink-50/50 dark:bg-pink-500/10 ring-1 ring-pink-500' : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'}`}>
                            <input type="radio" name="workType" value="team" checked={form.workType === 'team'} onChange={() => setForm({...form, workType: 'team'})} className="hidden" />
                            <div className="font-bold text-sm text-slate-900 dark:text-white">Agency / Team</div>
                            <div className="text-xs text-slate-500 mt-1">I manage a team</div>
                        </label>
                   </div>
                </div>
            </div>

            <div className="pt-6">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    )
}

function PayoutSettings({ user, refreshUser, showToast }) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.patch("/user/profile", { payoutMethod: 'internal_wallet' });
            await refreshUser();
            showToast("Payout settings updated successfully!", "success", "Saved!");
        } catch(err) {
            console.error(err);
            showToast("Failed to update payout settings.", "error", "Error");
        } finally {
            setSaving(false);
        }
    }

    return (
         <div className="max-w-xl space-y-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Payout Preferences</h3>
            
            <div className="p-6 bg-blue-50 dark:bg-indigo-600/10 border border-blue-100 dark:border-indigo-600/20 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <CheckCircle size={20} />
                    <h4 className="font-bold uppercase tracking-widest text-xs">Token-Native Architecture Active</h4>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    All earnings on the platform are processed exclusively in <span className="font-bold text-slate-900 dark:text-white">TKNS</span> tokens. 
                    Payouts are automatically routed to your <span className="font-bold text-slate-900 dark:text-white">Internal Wallet</span> for maximum security and zero-fee transactions.
                </p>
                <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white dark:bg-white/10 rounded-lg border border-blue-200 dark:border-indigo-600/30 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                        Active Payout Method: Internal Wallet
                    </div>
                </div>
            </div>

            <div className="pt-6">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 w-full sm:w-auto"
                >
                    {saving ? "Saving..." : "Confirm Settings"}
                </button>
            </div>
         </div>
    )
}

function SecuritySettings({ user, showToast }) {
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
    const [twoFactor, setTwoFactor] = useState(user.twoFactorEnabled || false);

    const handlePasswordChange = async () => {
         if (passwords.new !== passwords.confirm) {
            showToast("New passwords do not match. Please check and try again.", "warning", "Passwords Don't Match");
            return;
         }
         try {
             const res = await api.patch("/user/profile", { 
                 password: passwords.new, 
             });
             if (res.success) {
                 showToast("Password updated successfully!", "success", "Password Changed");
                 setPasswords({ current: "", new: "", confirm: "" });
             }
         } catch(err) {
             console.error(err);
             showToast("Failed to update password. Please try again.", "error", "Error");
         }
    };

    return (
        <div className="max-w-xl space-y-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Security & Login</h3>

            {/* Password */}
            <div className="space-y-4 p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Shield size={18} className="text-indigo-600" /> 
                    Change Password
                </h4>
                <div className="space-y-3">
                     <input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm" />
                     <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm" />
                     <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/50 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-sm" />
                </div>
                <button onClick={handlePasswordChange} className="px-6 py-2.5 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-white/20 transition-all shadow-sm"> Update Password </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/10">
                <div>
                     <h4 className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication</h4>
                     <p className="text-sm text-slate-500 mt-1">Add an extra layer of security to your account</p>
                </div>
                <div 
                    onClick={() => { setTwoFactor(!twoFactor); /* Call API */ }}
                    className={`w-14 h-7 rounded-full p-1 cursor-pointer transition-colors flex items-center ${twoFactor ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                >
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform ${twoFactor ? 'translate-x-7' : 'translate-x-0'}`} />
                </div>
            </div>
        </div>
    )
}

function AccountSettings({ user, refreshUser, showToast }) {
    const [upgrading, setUpgrading] = useState(false);

    const handleUpgradeToPatron = async () => {
        setUpgrading(true);
        try {
            const res = await api.patch("/user/profile", { role: "patron" });
            if (res.success || res.status === 200) {
                showToast("Account successfully upgraded to patron!", "success");
                await refreshUser();
                // Reload to update the sidebar
                window.location.reload();
            } else {
                showToast(res.message || "Failed to upgrade account.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to upgrade. Please try again.", "error");
        } finally {
            setUpgrading(false);
        }
    };

    return (
        <div className="max-w-xl space-y-8">
            <h3 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">Account Management</h3>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Email Address</label>
                   <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 shadow-sm">
                        {user.email}
                        {user.emailVerified && <CheckCircle size={16} className="text-green-500" />}
                   </div>
                   <p className="text-xs text-slate-500 mt-1.5">Email cannot be changed directly.</p>
                </div>

                <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-gray-300 mb-1.5">Current Role</label>
                   <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 shadow-sm uppercase font-bold text-xs">
                        {user.role}
                   </div>
                </div>
            </div>

            {user.role === "user" && (
                <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-6">
                    <h4 className="text-indigo-600 font-bold mb-2">Want to hire talent?</h4>
                    <p className="text-sm text-slate-500 mb-4">Upgrade your account to a patron Account to post jobs and manage hires.</p>
                    <button 
                        onClick={handleUpgradeToPatron}
                        disabled={upgrading}
                        className="px-6 py-3 border border-blue-200 dark:border-indigo-600/30 bg-blue-50 dark:bg-indigo-600/10 text-blue-600 dark:text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-100 dark:hover:bg-indigo-600/20 transition-colors"
                    >
                        {upgrading ? "Upgrading..." : "Upgrade to patron"}
                    </button>
                </div>
            )}

            <div className="pt-8 border-t border-slate-200 dark:border-white/10 mt-8">
                <h4 className="text-red-500 font-bold mb-2">Danger Zone</h4>
                <p className="text-sm text-slate-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-6 py-3 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    Delete Account
                </button>
            </div>
        </div>
    )
}



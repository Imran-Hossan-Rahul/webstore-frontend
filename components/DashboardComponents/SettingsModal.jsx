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
  const [creatorProfile, setCreatorProfile] = useState(null);
  const { showToast } = useToast();
  
  // Detect if we're on a creator route
  const isCreatorRoute = pathname?.startsWith("/user/creator");

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
            
            // If on creator route or user is a creator, try to load creator profile
            if (res.data.hasCreatorAccount) {
                 const creatorRes = await api.get("/creator/profile");
                 if (creatorRes.success) setCreatorProfile(creatorRes.data);
            }
        }
    } catch (error) {
        console.error("Failed to fetch settings", error);
    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;
  
  const displayContext = isCreatorRoute ? "Creator" : "Account";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" style={{ position: 'fixed' }}>
      <div className="bg-white rounded-[32px] w-full max-w-4xl h-[85vh] shadow-2xl flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 p-6 flex flex-col border-r border-gray-100">
          <h2 className="text-2xl font-bold mb-8 pl-2">
            {isCreatorRoute ? "Creator Settings" : "Settings"}
          </h2>
          <nav className="space-y-2">
            <TabButton id="general" label="General" icon={<User size={18}/>} active={activeTab} onClick={setActiveTab} />
            {(isCreatorRoute || user?.hasCreatorAccount) && (
              <TabButton id="payout" label="Payouts" icon={<CreditCard size={18}/>} active={activeTab} onClick={setActiveTab} />
            )}
            <TabButton id="security" label="Security" icon={<Shield size={18}/>} active={activeTab} onClick={setActiveTab} />
            <TabButton id="account" label="Account" icon={<SettingsIcon size={18}/>} active={activeTab} onClick={setActiveTab} />
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col h-full bg-white relative">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
            >
                <X size={20} className="text-gray-500" />
            </button>
            
            <div className="flex-1 overflow-y-auto p-10">
            <div className="flex-1 overflow-y-auto p-10">
                {loading ? (
                    <div className="h-full flex items-center justify-center flex-col gap-3">
                        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
                        <p className="text-gray-400 text-sm">Loading settings...</p>
                    </div>
                ) : user ? (
                    <>
                        {activeTab === 'general' && (
                            <GeneralSettings 
                                user={user} 
                                creatorProfile={creatorProfile}
                                isCreatorMode={isCreatorRoute && !!creatorProfile}
                                refreshData={fetchData}
                                showToast={showToast}
                            />
                        )}
                        {activeTab === 'payout' && <PayoutSettings user={user} refreshUser={fetchData} showToast={showToast} />}
                        {activeTab === 'security' && <SecuritySettings user={user} showToast={showToast} />}
                        {activeTab === 'account' && <AccountSettings user={user} />}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-red-500">Failed to load user data</p>
                    </div>
                )}
            </div>
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive ? "bg-black text-white shadow-md" : "text-gray-500 hover:bg-white hover:text-black hover:shadow-sm"
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

function GeneralSettings({ user, creatorProfile, isCreatorMode, refreshData, showToast }) {
    // Initial state depends on mode
    const [form, setForm] = useState({
        // Common / Swapped fields
        name: isCreatorMode ? (creatorProfile?.displayName || "") : (user.name || ""),
        bio: isCreatorMode ? (creatorProfile?.bio || "") : (user.bio || ""),
        skills: isCreatorMode 
            ? (creatorProfile?.skills ? creatorProfile.skills.join(", ") : "") 
            : (user.skills ? user.skills.join(", ") : ""),
        
        // Mode specific fields
        workType: isCreatorMode ? (creatorProfile?.workType || "solo") : (user.workType || "solo"),
        profilePicture: isCreatorMode ? (creatorProfile?.profilePicture || "") : (user.profilePicture || ""),
        portfolio: isCreatorMode ? JSON.stringify(creatorProfile?.portfolio || []) : "" // simplified for now
    });

    const [saving, setSaving] = useState(false);

    // Update form when mode or data changes
    useEffect(() => {
         setForm({
            name: isCreatorMode ? (creatorProfile?.displayName || "") : (user.name || ""),
            bio: isCreatorMode ? (creatorProfile?.bio || "") : (user.bio || ""),
            skills: isCreatorMode 
                ? (creatorProfile?.skills ? creatorProfile.skills.join(", ") : "") 
                : (user.skills ? user.skills.join(", ") : ""),
            workType: isCreatorMode ? (creatorProfile?.workType || "solo") : (user.workType || "solo"),
            profilePicture: isCreatorMode ? (creatorProfile?.profilePicture || "") : (user.profilePicture || ""),
        });
    }, [isCreatorMode, user, creatorProfile]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const skillsArray = form.skills.split(',').map(s => s.trim()).filter(s => s);
            
            if (isCreatorMode) {
                 // Update CREATOR Profile
                 await api.patch("/creator/profile", {
                    displayName: form.name,
                    bio: form.bio,
                    skills: skillsArray,
                    workType: form.workType,
                 });
                 showToast("Creator profile updated successfully!", "success", "Saved!");
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
            <h3 className="text-xl font-bold mb-6">
                {isCreatorMode ? "Creator Information" : "General Information"}
            </h3>
            
            <div className="space-y-4">
                {!isCreatorMode && (
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Avatar URL</label>
                        <input 
                            type="text" 
                            value={form.profilePicture}
                            onChange={e => setForm({...form, profilePicture: e.target.value})}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                            placeholder="https://..."
                        />
                         <p className="text-xs text-gray-400 mt-1">Or use the upload feature in the Profile.</p>
                    </div>
                )}
                
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        {isCreatorMode ? "Display Name" : "Full Name"}
                   </label>
                   <input 
                      type="text" 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                   />
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bio</label>
                   <textarea 
                      value={form.bio}
                      onChange={e => setForm({...form, bio: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all resize-none h-32"
                      placeholder="Tell us about yourself..."
                   />
                </div>
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skills (comma separated)</label>
                   <input 
                      type="text" 
                      value={form.skills}
                      onChange={e => setForm({...form, skills: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                      placeholder="React, Node.js, Design..."
                   />
                </div>
                 <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Type</label>
                   <div className="flex gap-4">
                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${form.workType === 'solo' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="workType" value="solo" checked={form.workType === 'solo'} onChange={() => setForm({...form, workType: 'solo'})} className="hidden" />
                            <div className="font-semibold text-sm">Solo Creator</div>
                            <div className="text-xs text-gray-500 mt-1">I work by myself</div>
                        </label>
                        <label className={`flex-1 border p-4 rounded-xl cursor-pointer transition-all ${form.workType === 'team' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <input type="radio" name="workType" value="team" checked={form.workType === 'team'} onChange={() => setForm({...form, workType: 'team'})} className="hidden" />
                            <div className="font-semibold text-sm">Agency / Team</div>
                            <div className="text-xs text-gray-500 mt-1">I manage a team</div>
                        </label>
                   </div>
                </div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </div>
    )
}

function PayoutSettings({ user, refreshUser, showToast }) {
    const [method, setMethod] = useState(user.payoutMethod || "payoneer");
    const [payoneerEmail, setPayoneerEmail] = useState(user.payoneerEmail || "");
    const [bankDetails, setBankDetails] = useState(user.bankDetails || {
        accountNumber: "", bankName: "", swiftCode: "", accountHolderName: "", country: ""
    });
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const data = { payoutMethod: method };
            if (method === 'payoneer') data.payoneerEmail = payoneerEmail;
            if (method === 'bank_transfer') data.bankDetails = bankDetails;

            await api.patch("/user/profile", data);
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
         <div className="max-w-xl space-y-6">
            <h3 className="text-xl font-bold mb-6">Payout Preferences</h3>
            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Payout Method</label>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setMethod('payoneer')}
                        className={`p-4 rounded-xl border text-left transition-all ${method === 'payoneer' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="font-bold text-sm">Payoneer</div>
                        <div className="text-xs text-gray-500 mt-1">Direct deposit</div>
                    </button>
                    <button 
                        onClick={() => setMethod('bank_transfer')}
                        className={`p-4 rounded-xl border text-left transition-all ${method === 'bank_transfer' ? 'border-black bg-gray-50 ring-1 ring-black' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="font-bold text-sm">Bank Transfer</div>
                         <div className="text-xs text-gray-500 mt-1">SWIFT / IBAN</div>
                    </button>
                </div>
            </div>

            {method === 'payoneer' && (
                 <div className="animate-in fade-in slide-in-from-top-2">
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Payoneer Email</label>
                   <input 
                      type="email" 
                      value={payoneerEmail}
                      onChange={e => setPayoneerEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-black focus:ring-0 outline-none transition-all"
                      placeholder="email@example.com"
                   />
                </div>
            )}

            {method === 'bank_transfer' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Bank Name</label>
                             <input type="text" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black" />
                        </div>
                         <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">SWIFT Code</label>
                             <input type="text" value={bankDetails.swiftCode} onChange={e => setBankDetails({...bankDetails, swiftCode: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black" />
                        </div>
                     </div>
                      <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Account Number / IBAN</label>
                             <input type="text" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black" />
                        </div>
                         <div>
                             <label className="block text-xs font-semibold text-gray-500 mb-1">Account Holder Name</label>
                             <input type="text" value={bankDetails.accountHolderName} onChange={e => setBankDetails({...bankDetails, accountHolderName: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black" />
                        </div>
                </div>
            )}

            <div className="pt-4">
                <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Update Payout Method"}
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
            <h3 className="text-xl font-bold">Security & Login</h3>

            {/* Password */}
            <div className="space-y-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                    <Shield size={16} /> 
                    Change Password
                </h4>
                <div className="space-y-3">
                     <input type="password" placeholder="Current Password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black bg-white" />
                     <input type="password" placeholder="New Password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black bg-white" />
                     <input type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-2.5 rounded-lg border border-gray-200 outline-none focus:border-black bg-white" />
                </div>
                <button onClick={handlePasswordChange} className="px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50"> Update Password </button>
            </div>

            {/* 2FA */}
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-100">
                <div>
                     <h4 className="font-semibold text-sm text-gray-900">Two-Factor Authentication</h4>
                     <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account</p>
                </div>
                <div 
                    onClick={() => { setTwoFactor(!twoFactor); /* Call API */ }}
                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${twoFactor ? 'bg-black' : 'bg-gray-300'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${twoFactor ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
            </div>
        </div>
    )
}

function AccountSettings({ user }) {
    return (
        <div className="max-w-xl space-y-8">
            <h3 className="text-xl font-bold">Account Management</h3>

             <div className="space-y-4">
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                   <div className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
                        {user.email}
                        {user.emailVerified && <CheckCircle size={14} className="text-green-500" />}
                   </div>
                   <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                </div>
            </div>

            <div className="pt-8 border-t border-gray-100">
                <h4 className="text-red-600 font-bold mb-2">Danger Zone</h4>
                <p className="text-sm text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                    Delete Account
                </button>
            </div>
        </div>
    )
}

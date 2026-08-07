"use client";
import React, { useState, useEffect, useContext } from 'react';
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Link as LinkIcon, Bookmark, CheckCircle2, Settings as SettingsIcon, Camera, Key, Map, Save, X, Plus, Trash2, LogOut, ShieldCheck, Mail, Send, AlertCircle, BadgeCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { api } from '@/utils/api';
import { DashboardContext } from '@/app/(dashboard)/layout';
import { useUser } from '@/context/UserContext';
import { format } from "date-fns";
import { useToast } from "@/components/ui/ToastProvider";
import OrdersList from '@/components/orders/OrdersList';
import AppleSpinner from "@/components/ui/AppleSpinner";
import VerifyEmailTab from "@/components/ProfileComponents/VerifyEmailTab";

export default function PublicProfile({ username }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || "about";
  const { user: currentUser } = useContext(DashboardContext) || {};
  const { logout } = useUser();
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [settingsSubTab, setSettingsSubTab] = useState("profile"); // profile, password, addresses

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const tabsScrollRef = React.useRef(null);

  const handleTabScroll = (e) => {
    const { scrollLeft, scrollWidth, clientWidth } = e.target;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
  };

  const pathname = usePathname();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const isOwner = currentUser?.username === username || (profile && currentUser?._id === profile._id);

  // Edit states
  const [editData, setEditData] = useState({ name: '', bio: '', location: '', skills: [] });
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '' });
  const [addresses, setAddresses] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    setIsLoggingOut(true);
    await logout();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const endpoint = (currentUser?.username === username) ? "/user/profile" : `/user/profile/${username}`;
        const res = await api.get(endpoint);
        if (res.success) {
          setProfile(res.data);
          setEditData({
            name: res.data.name || '',
            bio: res.data.bio || '',
            location: res.data.location?.city || '',
            skills: res.data.skills || []
          });
          setAddresses(res.data.addresses || []);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
        setError('Could not load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username, currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: editData.name,
        bio: editData.bio,
        location: { city: editData.location, country: '' }
      };
      const res = await api.patch('/user/profile', payload);
      if (res.success) {
        setProfile(res.data);
        showToast('Profile updated successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post('/user/change-password', passData);
      if (res.success) {
        showToast('Password updated successfully', 'success');
        setPassData({ currentPassword: '', newPassword: '' });
      } else {
        showToast(res.message || 'Failed to change password', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateAddresses = async () => {
    setIsSaving(true);
    try {
      const res = await api.patch('/user/profile', { addresses });
      if (res.success) {
        setProfile(res.data);
        showToast('Addresses saved successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to save addresses', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addNewAddress = () => {
    setAddresses([...addresses, { title: 'New Address', addressLine: '', city: '', zipCode: '', exactLocation: '', deliveryNote: '' }]);
  };

  const updateAddress = (index, field, value) => {
    const newAddresses = [...addresses];
    newAddresses[index][field] = value;
    setAddresses(newAddresses);
  };

  const removeAddress = (index) => {
    const newAddresses = [...addresses];
    newAddresses.splice(index, 1);
    setAddresses(newAddresses);
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Uploading profile picture...', 'info');
      
      const formData = new FormData();
      formData.append('image', file);
      
      // 1. Upload image to get URL
      const uploadRes = await api.upload('/upload/image', formData);
      
      if (uploadRes.success && uploadRes.url) {
        // 2. Update user profile with new URL
        const profileRes = await api.patch('/user/profile', { profilePicture: uploadRes.url });
        
        if (profileRes.success) {
          // 3. Update local state
          setProfile(prev => ({ ...prev, profilePicture: uploadRes.url }));
          showToast('Profile picture updated successfully!', 'success');
        } else {
          showToast('Failed to save profile picture', 'error');
        }
      } else {
        showToast('Image upload failed', 'error');
      }
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      showToast('Error uploading profile picture', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] font-sans">
        <AppleSpinner className="w-8 h-8 animate-spin text-[#0071e3]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] font-sans antialiased">
        <h2 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Profile Not Found</h2>
        <p className="text-[15px] text-[#86868b] mt-2">The user you are looking for does not exist.</p>
        <Link href="/" className="mt-6 text-[#0071e3] hover:underline text-[15px] font-medium">Go back home</Link>
      </div>
    );
  }

  const joinDate = profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently';

  const renderSettingsTab = () => {
    return (
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button onClick={() => setSettingsSubTab('profile')} className={`text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${settingsSubTab === 'profile' ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black shadow-sm' : 'text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'}`}>
            Profile Details
          </button>
          <button onClick={() => setSettingsSubTab('password')} className={`text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${settingsSubTab === 'password' ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black shadow-sm' : 'text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'}`}>
            Password
          </button>
          <button onClick={() => setSettingsSubTab('addresses')} className={`text-left px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${settingsSubTab === 'addresses' ? 'bg-[#1d1d1f] text-white dark:bg-white dark:text-black shadow-sm' : 'text-[#86868b] hover:bg-[#f5f5f7] dark:hover:bg-[#2c2c2e]'}`}>
            Delivery Addresses
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-[#f5f5f7] dark:bg-black/40 rounded-[24px] p-8 border border-slate-100 dark:border-[#2c2c2e]">
          {settingsSubTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">Edit Profile</h3>
              
              <div className="flex items-center gap-6">
                 <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 dark:border-[#2c2c2e]">
                    <img src={profile.profilePicture ? getOptimizedUrl(profile.profilePicture) : "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                    </label>
                 </div>
                 <div className="text-[13px] text-[#86868b]">Click on the avatar to upload a new picture.</div>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-[13px] font-medium text-[#86868b] mb-1">Full Name</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-[#2c2c2e] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0071e3] transition-colors text-black dark:text-white" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#86868b] mb-1">Location</label>
                  <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-[#2c2c2e] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0071e3] transition-colors text-black dark:text-white" />
                </div>
              </div>
              
              <button type="submit" disabled={isSaving} className="mt-8 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors flex items-center gap-2">
                {isSaving ? <AppleSpinner className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          )}

          {settingsSubTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#86868b] mb-1">Current Password</label>
                  <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-[#2c2c2e] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0071e3] transition-colors text-black dark:text-white" required />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#86868b] mb-1">New Password</label>
                  <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-white dark:bg-black border border-slate-200 dark:border-[#2c2c2e] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none focus:border-[#0071e3] transition-colors text-black dark:text-white" required minLength="8" />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="mt-8 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors flex items-center gap-2">
                {isSaving ? <AppleSpinner className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Update Password
              </button>
            </form>
          )}

          {settingsSubTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Delivery Addresses</h3>
                <button onClick={addNewAddress} className="px-4 py-2 bg-[#1d1d1f] text-white dark:bg-white dark:text-black rounded-full text-[13px] font-medium hover:opacity-80 flex items-center gap-1 transition-all">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-300 dark:border-[#2c2c2e] rounded-2xl bg-white dark:bg-black/50">
                  <Map className="w-8 h-8 text-[#86868b] mx-auto mb-3 opacity-50" />
                  <p className="text-[14px] text-[#86868b]">No addresses saved yet.</p>
                  <button onClick={addNewAddress} className="mt-4 text-[#0071e3] hover:underline text-[14px] font-medium">Add your first address</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr, i) => (
                    <div key={i} className="p-6 bg-white dark:bg-[#151515] rounded-[18px] border border-slate-200 dark:border-[#2c2c2e] relative group shadow-sm transition-all hover:shadow-md">
                      <button onClick={() => removeAddress(i)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
                        <div>
                          <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Title (e.g. Home, Work)</label>
                          <input type="text" value={addr.title} onChange={e => updateAddress(i, 'title', e.target.value)} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="Home" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Address Line</label>
                          <input type="text" value={addr.addressLine || ''} onChange={e => updateAddress(i, 'addressLine', e.target.value)} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="123 Main St" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">City</label>
                          <input type="text" value={addr.city || ''} onChange={e => updateAddress(i, 'city', e.target.value)} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="New York" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Zip / Postal Code</label>
                          <input type="text" value={addr.zipCode || ''} onChange={e => updateAddress(i, 'zipCode', e.target.value)} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="10001" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {addresses.length > 0 && (
                <button onClick={handleUpdateAddresses} disabled={isSaving} className="mt-6 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors flex items-center gap-2 shadow-sm">
                  {isSaving ? <AppleSpinner className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save All Addresses
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f5f7] dark:bg-black font-sans antialiased pb-24 pt-6 md:pt-10">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Profile Header Card */}
        <div className="py-4 px-2 md:py-10 md:px-4 border-transparent relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left relative z-10">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border-[4px] border-white/50 dark:border-[#2c2c2e]/50 shadow-xl bg-slate-100 flex-shrink-0 group relative cursor-pointer">
              {profile.profilePicture ? (
                <img src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-semibold text-[#86868b]">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwner && (
                <label className="absolute inset-0 cursor-pointer group/label">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity z-10 rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {/* Mobile Camera Badge */}
                  <div className="md:hidden absolute bottom-1 right-1 bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-md p-2.5 rounded-full shadow-sm z-20 border border-black/5 dark:border-white/10">
                     <Camera className="w-4 h-4 text-[#1d1d1f] dark:text-white" />
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 flex flex-col justify-center pt-2 md:pt-4">
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap mb-1">
                <h1 className="text-[28px] md:text-[34px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white leading-tight">
                  {profile.name}
                </h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-[#0071e3]" />}
                {profile.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[11px] font-semibold ml-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-[14px] text-[#86868b] font-medium">
                {profile.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {typeof profile.location === 'object' ? `${profile.location.city || ''}` : profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {joinDate}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full md:w-auto mt-4 md:mt-4 flex justify-center md:justify-end min-w-[140px]">
              {isLoggingOut ? (
                <div className="h-10 flex items-center justify-center">
                  <AppleSpinner className="w-5 h-5 text-slate-500" />
                </div>
              ) : isOwner ? (
                <button 
                  onClick={handleLogout} 
                  className={`w-full md:w-auto py-2.5 px-6 rounded-full text-[14px] font-medium transition-all flex items-center justify-center gap-2 ${confirmLogout ? 'bg-red-500 text-white shadow-md hover:bg-red-600' : 'text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20'}`}
                >
                  <LogOut className="w-4 h-4" />
                  {confirmLogout ? 'Confirm?' : 'Logout'}
                </button>
              ) : (
                <button className="w-full md:w-auto py-2.5 px-8 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors shadow-sm">
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Apple Style Segmented Control (Tabs) */}
        <div className="relative mt-4 md:mt-8">
          {canScrollLeft && (
            <div className="absolute left-[-16px] top-0 bottom-4 w-12 bg-gradient-to-r from-[#f5f5f7] dark:from-black to-transparent pointer-events-none md:hidden flex items-center justify-start pl-1 z-10">
               <ChevronLeft className="w-5 h-5 text-[#86868b] opacity-80" />
            </div>
          )}
          <div 
            ref={tabsScrollRef}
            onScroll={handleTabScroll}
            className="flex justify-start md:justify-center overflow-x-auto scrollbar-hide px-4 pb-4 -mx-4 md:mx-0 relative z-0"
          >
            <div className="bg-black/5 dark:bg-white/10 p-1.5 rounded-full flex gap-1 min-w-max mx-auto md:mx-0 shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
              <button onClick={() => handleTabChange('about')} className={`px-6 py-2 rounded-full text-[14px] md:text-[15px] font-medium transition-all duration-300 ${activeTab === 'about' ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                About
              </button>
              {isOwner && (
                <>
                  <button onClick={() => handleTabChange('orders')} className={`px-6 py-2 rounded-full text-[14px] md:text-[15px] font-medium transition-all duration-300 ${activeTab === 'orders' ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                    Orders
                  </button>
                  <button onClick={() => handleTabChange('addresses')} className={`px-6 py-2 rounded-full text-[14px] md:text-[15px] font-medium transition-all duration-300 ${activeTab === 'addresses' ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                    Addresses
                  </button>
                  <button onClick={() => handleTabChange('password')} className={`px-6 py-2 rounded-full text-[14px] md:text-[15px] font-medium transition-all duration-300 ${activeTab === 'password' ? 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                    Password
                  </button>
                </>
              )}
            </div>
          </div>
          {canScrollRight && (
            <div className="absolute right-[-16px] top-0 bottom-4 w-12 bg-gradient-to-l from-[#f5f5f7] dark:from-black to-transparent pointer-events-none md:hidden flex items-center justify-end pr-1 z-10">
               <ChevronRight className="w-5 h-5 text-[#86868b] opacity-80" />
            </div>
          )}
        </div>

        {/* Tab Content Cards */}
        <div className="mt-2 md:mt-4">
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="py-2 px-1 md:py-4 md:px-0 border-transparent">
              <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6 px-2">Account Details</h3>
              <div className="bg-[#f5f5f7] dark:bg-black/40 rounded-[20px] overflow-hidden border border-black/[0.02] dark:border-white/[0.05]">
                <div className="flex justify-between items-center px-6 py-4 border-b border-black/[0.05] dark:border-white/[0.05]">
                  <span className="text-[15px] text-[#86868b] font-medium">Member Since</span>
                  <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-white">{joinDate}</span>
                </div>
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-[15px] text-[#86868b] font-medium">Account Status</span>
                  <span className="text-[15px] font-medium text-[#1d1d1f] dark:text-white">{profile.isVerified ? 'Verified' : 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && isOwner && (
            <div className="py-2 px-1 md:py-4 md:px-0 border-transparent max-w-2xl mx-auto">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#86868b] mb-1.5 ml-1">Current Password</label>
                    <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-4 py-3 text-[15px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#86868b] mb-1.5 ml-1">New Password</label>
                    <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-4 py-3 text-[15px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" required minLength="8" />
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="mt-8 w-full md:w-auto px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[15px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                  {isSaving ? <AppleSpinner className="w-4 h-4 animate-spin text-white" /> : <Key className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && isOwner && (
            <div className="py-2 px-1 md:py-4 md:px-0 border-transparent">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">Delivery Addresses</h3>
                  <button onClick={addNewAddress} className="px-5 py-2.5 bg-[#1d1d1f] text-white dark:bg-white dark:text-black rounded-full text-[14px] font-medium hover:opacity-80 flex items-center gap-1.5 transition-all shadow-sm">
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </div>
                
                {addresses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-300 dark:border-[#2c2c2e] rounded-[24px] bg-[#f5f5f7]/50 dark:bg-black/30">
                    <Map className="w-10 h-10 text-[#86868b] mx-auto mb-4 opacity-50" />
                    <p className="text-[15px] text-[#86868b]">No addresses saved yet.</p>
                    <button onClick={addNewAddress} className="mt-4 text-[#0071e3] hover:underline text-[15px] font-medium">Add your first address</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {addresses.map((addr, i) => (
                      <div key={i} className="p-6 md:p-8 bg-[#f5f5f7] dark:bg-[#151515] rounded-[24px] border border-gray-200 dark:border-[#2c2c2e] relative group shadow-sm transition-all hover:shadow-md">
                        <button onClick={() => removeAddress(i)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full bg-white dark:bg-black shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-5 pr-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">Title</label>
                              <input type="text" value={addr.title} onChange={e => updateAddress(i, 'title', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" placeholder="Home" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">Address Line</label>
                              <input type="text" value={addr.addressLine || ''} onChange={e => updateAddress(i, 'addressLine', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" placeholder="123 Main St" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">City</label>
                              <input type="text" value={addr.city || ''} onChange={e => updateAddress(i, 'city', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" placeholder="New York" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">Zip Code</label>
                              <input type="text" value={addr.zipCode || ''} onChange={e => updateAddress(i, 'zipCode', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" placeholder="10001" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">Exact Location / Map Link</label>
                            <textarea rows="2" value={addr.exactLocation || ''} onChange={e => updateAddress(i, 'exactLocation', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white resize-none shadow-sm" placeholder="E.g. Next to the blue gate..."></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider ml-1">Delivery Note</label>
                            <input type="text" value={addr.deliveryNote || ''} onChange={e => updateAddress(i, 'deliveryNote', e.target.value)} className="w-full bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[14px] px-3.5 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white shadow-sm" placeholder="E.g. Call upon arrival" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {addresses.length > 0 && (
                  <div className="pt-4">
                    <button onClick={handleUpdateAddresses} disabled={isSaving} className="w-full md:w-auto px-8 py-3 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[15px] font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
                      {isSaving ? <AppleSpinner className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4" />}
                      Save All Addresses
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && isOwner && (
            <div className="py-2 px-1 md:py-4 md:px-0 border-transparent">
              <h3 className="text-[22px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-4 px-2 md:px-0">Order History</h3>
              <div className="mt-2">
                 <OrdersList isEmbedded={true} />
              </div>
            </div>
          )}

          

        </div>
      </div>
    </div>
  );
}

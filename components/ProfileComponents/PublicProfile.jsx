"use client";
import React, { useState, useEffect, useContext } from 'react';
import { getOptimizedUrl } from "@/utils/optimizeImage";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Link as LinkIcon, Loader2, Bookmark, CheckCircle2, Settings as SettingsIcon, Camera, Key, Map, Save, X, Plus, Trash2, LogOut } from "lucide-react";
import { api } from '@/utils/api';
import { DashboardContext } from '@/app/(dashboard)/layout';
import { format } from "date-fns";
import { useToast } from "@/components/ui/ToastProvider";
import OrdersList from '@/components/orders/OrdersList';

export default function PublicProfile({ username }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || "about";
  const { user: currentUser } = useContext(DashboardContext) || {};
  const { showToast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [settingsSubTab, setSettingsSubTab] = useState("profile"); // profile, password, addresses

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

  const handleLogout = async () => {
    if (!confirmLogout) {
      setConfirmLogout(true);
      setTimeout(() => setConfirmLogout(false), 3000);
      return;
    }
    try {
      await api.post("/auth/logout");
      window.location.href = '/login';
    } catch (e) {
      console.error("Logout error", e);
      window.location.href = '/login';
    }
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
    showToast('Profile picture upload feature coming soon', 'info');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh] font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#0071e3]" />
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
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
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
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
    <div className="w-full font-sans antialiased pb-20 pt-4 md:-mt-4">
      <div className="w-full px-2 md:px-3">
        <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-[#2c2c2e]">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="relative group cursor-pointer">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#1c1c1e] shadow-sm bg-slate-100 relative">
                {profile.profilePicture ? (
                  <img src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-[#86868b]">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOwner && (
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-[28px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
                  {profile.name}
                </h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-[#0071e3]" />}
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-5">
                {profile.location && (
                  <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868b]">
                    <MapPin className="w-4 h-4" />
                    {typeof profile.location === 'object' ? `${profile.location.city || ''}` : profile.location}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-[#86868b]">
                  <Calendar className="w-4 h-4" />
                  Joined {joinDate}
                </div>
              </div>
            </div>

            {!isOwner && (
              <div className="flex flex-col gap-3 min-w-[140px]">
                <button className="w-full py-2.5 px-4 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors">
                  Follow
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="bg-[#e5e5ea] dark:bg-[#1c1c1e] p-1 rounded-full flex gap-1">
            <button onClick={() => handleTabChange('about')} className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${activeTab === 'about' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
              About
            </button>
            {isOwner && (
              <>
                <button onClick={() => handleTabChange('orders')} className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                  Orders
                </button>
                <button onClick={() => handleTabChange('addresses')} className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${activeTab === 'addresses' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                  Saved Addresses
                </button>
                <button onClick={() => handleTabChange('password')} className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all ${activeTab === 'password' ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white'}`}>
                  Password
                </button>
                <div className="w-[1px] h-6 bg-gray-300 dark:bg-gray-700 my-auto mx-1"></div>
                <button 
                  onClick={handleLogout} 
                  className={`px-6 py-2 rounded-full text-[14px] font-medium transition-all flex items-center gap-1.5 ${confirmLogout ? 'bg-red-500 text-white' : 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                >
                  <LogOut className="w-4 h-4" />
                  {confirmLogout ? 'Confirm?' : 'Logout'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8">
          {activeTab === 'password' && isOwner && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-[#2c2c2e] max-w-2xl mx-auto">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-[#86868b] mb-1">Current Password</label>
                    <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none transition-colors text-black dark:text-white" required />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#86868b] mb-1">New Password</label>
                    <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] rounded-xl px-4 py-2.5 text-[15px] focus:outline-none transition-colors text-black dark:text-white" required minLength="8" />
                  </div>
                </div>
                <button type="submit" disabled={isSaving} className="mt-8 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors flex items-center gap-2">
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'addresses' && isOwner && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-[#2c2c2e]">
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[28px] font-semibold tracking-[-0.003em] text-[#1d1d1f] dark:text-white">Delivery Addresses</h3>
                  <button onClick={addNewAddress} className="px-4 py-2 bg-[#1d1d1f] text-white dark:bg-white dark:text-black rounded-full text-[13px] font-medium hover:opacity-80 flex items-center gap-1 transition-all">
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-300 dark:border-[#2c2c2e] rounded-2xl bg-[#f5f5f7] dark:bg-black/50">
                    <Map className="w-8 h-8 text-[#86868b] mx-auto mb-3 opacity-50" />
                    <p className="text-[14px] text-[#86868b]">No addresses saved yet.</p>
                    <button onClick={addNewAddress} className="mt-4 text-[#0071e3] hover:underline text-[14px] font-medium">Add your first address</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((addr, i) => (
                      <div key={i} className="p-6 bg-[#f5f5f7] dark:bg-[#151515] rounded-[18px] border border-slate-200 dark:border-[#2c2c2e] relative group shadow-sm transition-all hover:shadow-md">
                        <button onClick={() => removeAddress(i)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-4 pr-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Title (e.g. Home, Work)</label>
                              <input type="text" value={addr.title} onChange={e => updateAddress(i, 'title', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="Home" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Address Line</label>
                              <input type="text" value={addr.addressLine || ''} onChange={e => updateAddress(i, 'addressLine', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="123 Main St" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">City</label>
                              <input type="text" value={addr.city || ''} onChange={e => updateAddress(i, 'city', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="New York" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Zip / Postal Code</label>
                              <input type="text" value={addr.zipCode || ''} onChange={e => updateAddress(i, 'zipCode', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="10001" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Exact Location (Directions/Map Link)</label>
                            <textarea rows="2" value={addr.exactLocation || ''} onChange={e => updateAddress(i, 'exactLocation', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white resize-none" placeholder="E.g. Next to the blue gate, 2nd floor..."></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-[#86868b] mb-1.5 uppercase tracking-wider">Delivery Note (Optional)</label>
                            <input type="text" value={addr.deliveryNote || ''} onChange={e => updateAddress(i, 'deliveryNote', e.target.value)} className="w-full bg-white dark:bg-black border border-transparent focus:border-[#0071e3] rounded-lg px-3 py-2 text-[14px] focus:outline-none transition-colors text-black dark:text-white" placeholder="E.g. Call upon arrival" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {addresses.length > 0 && (
                  <button onClick={handleUpdateAddresses} disabled={isSaving} className="mt-6 px-6 py-2.5 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[14px] font-medium transition-colors flex items-center gap-2 shadow-sm">
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save All Addresses
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && isOwner && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-4 md:p-8 shadow-sm border border-slate-100 dark:border-[#2c2c2e]">
              <h3 className="text-[28px] font-semibold tracking-[-0.003em] text-[#1d1d1f] dark:text-white mb-6">Order History</h3>
              <div className="mt-[-16px]">
                 <OrdersList isEmbedded={true} />
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-sm border border-slate-100 dark:border-[#2c2c2e]">
              <h3 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-white mb-6">About {profile.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider mb-2">Account Details</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-center text-[15px]">
                      <span className="text-[#86868b]">Member Since</span>
                      <span className="font-medium text-[#1d1d1f] dark:text-white">{joinDate}</span>
                    </li>
                    <li className="flex justify-between items-center text-[15px]">
                      <span className="text-[#86868b]">Account Status</span>
                      <span className="font-medium text-[#1d1d1f] dark:text-white">{profile.isVerified ? 'Verified' : 'Standard'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

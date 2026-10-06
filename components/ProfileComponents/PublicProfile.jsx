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
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/ui/PageContainer";

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
      showToast(err.data?.message || err.message || 'Failed to change password', 'error');
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
        <AppleSpinner className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] font-sans">
        <h2 className="text-[24px] font-display font-medium text-brand-navy ">Profile Not Found</h2>
        <p className="text-[15px] font-sans text-slate-500  mt-2">The user you are looking for does not exist.</p>
        <Link href="/" className="mt-6 text-brand-blue hover:underline text-[15px] font-medium">Go back home</Link>
      </div>
    );
  }

  const joinDate = profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'Recently';

  const renderSettingsTab = () => {
    return (
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Settings Sidebar */}
        <div className="w-full md:w-52 flex flex-col gap-1">
          <button onClick={() => setSettingsSubTab('profile')} className={`text-left px-4 py-2.5 rounded-[20px] text-[14px] font-sans font-medium transition-all ${settingsSubTab === 'profile' ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-500  hover:bg-slate-100  :bg-white/40 backdrop-blur-md/5 hover:text-brand-navy '}`}>
            Profile Details
          </button>
          <button onClick={() => setSettingsSubTab('password')} className={`text-left px-4 py-2.5 rounded-[20px] text-[14px] font-sans font-medium transition-all ${settingsSubTab === 'password' ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-500  hover:bg-slate-100  :bg-white/40 backdrop-blur-md/5 hover:text-brand-navy '}`}>
            Password
          </button>
          <button onClick={() => setSettingsSubTab('addresses')} className={`text-left px-4 py-2.5 rounded-[20px] text-[14px] font-sans font-medium transition-all ${settingsSubTab === 'addresses' ? 'bg-brand-blue/10 text-brand-blue' : 'text-slate-500  hover:bg-slate-100  :bg-white/40 backdrop-blur-md/5 hover:text-brand-navy '}`}>
            Delivery Addresses
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white/40 backdrop-blur-md  rounded-[20px] p-6 md:p-8 border border-brand-navy/[0.08]  shadow-sm ">
          {settingsSubTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-6">Edit Profile</h3>
              
              <div className="flex items-center gap-6">
                 <div className="relative w-20 h-20 rounded-[20px] overflow-hidden border border-brand-navy/[0.08]  bg-white/40 backdrop-blur-md ">
                    <img src={profile.profilePicture ? getOptimizedUrl(profile.profilePicture) : "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                    </label>
                 </div>
                 <div className="text-[13px] font-sans text-slate-500 ">Click on the avatar to upload a new picture.</div>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1">Full Name</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  rounded-[20px] px-4 py-2.5 text-[14px] font-sans focus:outline-none focus:border-brand-navy transition-colors text-brand-navy " />
                </div>
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1">Location</label>
                  <input type="text" value={editData.location} onChange={e => setEditData({...editData, location: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  rounded-[20px] px-4 py-2.5 text-[14px] font-sans focus:outline-none focus:border-brand-navy transition-colors text-brand-navy " />
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSaving} 
                variant="primary"
                className="mt-8 px-6 py-2.5"
                leftIcon={isSaving ? <AppleSpinner className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                Save Changes
              </Button>
            </form>
          )}

          {settingsSubTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-6">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1">Current Password</label>
                  <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  rounded-[20px] px-4 py-2.5 text-[14px] font-sans focus:outline-none focus:border-brand-navy transition-colors text-brand-navy " required />
                </div>
                <div>
                  <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1">New Password</label>
                  <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  rounded-[20px] px-4 py-2.5 text-[14px] font-sans focus:outline-none focus:border-brand-navy transition-colors text-brand-navy " required minLength="8" />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={isSaving} 
                variant="primary"
                className="mt-8 px-6 py-2.5"
                leftIcon={isSaving ? <AppleSpinner className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              >
                Update Password
              </Button>
            </form>
          )}

          {settingsSubTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[20px] font-display font-medium text-brand-navy ">Delivery Addresses</h3>
                <button onClick={addNewAddress} className="px-4 py-2 bg-brand-navy text-white   rounded-[20px] text-[13px] font-medium hover:opacity-80 flex items-center gap-1 transition-all">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-brand-navy/[0.08]  rounded-[20px] bg-white/40 backdrop-blur-md ">
                  <Map className="w-8 h-8 text-slate-400 mx-auto mb-3 opacity-50" />
                  <p className="text-[14px] font-sans text-slate-500 ">No addresses saved yet.</p>
                  <button onClick={addNewAddress} className="mt-4 text-brand-blue hover:underline text-[14px] font-medium">Add your first address</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr, i) => (
                    <div key={i} className="p-6 bg-white/40 backdrop-blur-md  rounded-[20px] border border-brand-navy/[0.08]  relative group shadow-sm">
                      <button onClick={() => removeAddress(i)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-50  rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pr-8">
                        <div>
                          <label className="block text-[11px] font-mono tracking-widest text-slate-500  mb-1.5 uppercase">Title (e.g. Home, Work)</label>
                          <input type="text" value={addr.title} onChange={e => updateAddress(i, 'title', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3 py-2 text-[14px] focus:outline-none transition-colors text-brand-navy " placeholder="Home" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono tracking-widest text-slate-500  mb-1.5 uppercase">Address Line</label>
                          <input type="text" value={addr.addressLine || ''} onChange={e => updateAddress(i, 'addressLine', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3 py-2 text-[14px] focus:outline-none transition-colors text-brand-navy " placeholder="123 Main St" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono tracking-widest text-slate-500  mb-1.5 uppercase">City</label>
                          <input type="text" value={addr.city || ''} onChange={e => updateAddress(i, 'city', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3 py-2 text-[14px] focus:outline-none transition-colors text-brand-navy " placeholder="New York" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-mono tracking-widest text-slate-500  mb-1.5 uppercase">Zip / Postal Code</label>
                          <input type="text" value={addr.zipCode || ''} onChange={e => updateAddress(i, 'zipCode', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3 py-2 text-[14px] focus:outline-none transition-colors text-brand-navy " placeholder="10001" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {addresses.length > 0 && (
                <button onClick={handleUpdateAddresses} disabled={isSaving} className="mt-6 px-6 py-2.5 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-[20px] text-[14px] font-medium transition-colors flex items-center gap-2 shadow-sm">
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
    <PageContainer maxWidth="max-w-[1400px]" className="bg-transparent pb-24 pt-6 md:pt-10">
        
        {/* Profile Header Card */}
        <div className="py-4 md:py-10 border-transparent relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left relative z-10">
            {/* Avatar */}
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden border border-brand-navy/[0.08]  bg-white/40 backdrop-blur-md  flex-shrink-0 group relative cursor-pointer shadow-sm ">
              {profile.profilePicture ? (
                <img src={getOptimizedUrl(profile.profilePicture)} alt={profile.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[40px] font-display font-medium text-slate-400">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwner && (
                <label className="absolute inset-0 cursor-pointer group/label">
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 md:group-hover:opacity-100 transition-opacity z-10 rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  {/* Mobile Camera Badge */}
                  <div className="md:hidden absolute bottom-1 right-1 bg-white/40 backdrop-blur-md  border border-brand-navy/[0.08]  p-2.5 rounded-full shadow-sm z-20">
                     <Camera className="w-4 h-4 text-brand-navy " />
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleProfilePicChange} />
                </label>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 flex flex-col justify-center pt-2 md:pt-4">
              <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap mb-2">
                <h1 className="text-[28px] md:text-[34px] font-display font-medium text-brand-navy  leading-tight">
                  {profile.name}
                </h1>
                {profile.isVerified && <CheckCircle2 className="w-6 h-6 text-brand-blue" />}
                {profile.emailVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-teal/10 text-brand-teal rounded-[20px] text-[11px] font-mono tracking-widest uppercase ml-1">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    Verified
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-[13px] font-mono tracking-widest uppercase text-slate-500 ">
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
                  <AppleSpinner className="w-5 h-5 text-slate-500 " />
                </div>
              ) : isOwner ? (
                <Button 
                  onClick={handleLogout}
                  variant={confirmLogout ? 'primary' : 'outline'}
                  className={`w-full md:w-auto ${confirmLogout ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white' : 'text-red-500 border-red-500/30 hover:bg-red-500/10'}`}
                  leftIcon={<LogOut className="w-4 h-4" />}
                >
                  {confirmLogout ? 'Confirm?' : 'Logout'}
                </Button>
              ) : (
                <Button variant="primary" className="w-full md:w-auto px-8">
                  Follow
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-4 md:mt-8 border-b border-brand-navy/[0.08] ">
          <div 
            ref={tabsScrollRef}
            onScroll={handleTabScroll}
            className="flex justify-start overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-6 min-w-max">
              <button onClick={() => handleTabChange('about')} className={`pb-3 text-[14px] font-sans font-medium transition-colors border-b-2 ${activeTab === 'about' ? 'border-brand-blue text-brand-navy ' : 'border-transparent text-slate-500  hover:text-brand-navy '}`}>
                About
              </button>
              {isOwner && (
                <>
                  <button onClick={() => handleTabChange('orders')} className={`pb-3 text-[14px] font-sans font-medium transition-colors border-b-2 ${activeTab === 'orders' ? 'border-brand-blue text-brand-navy ' : 'border-transparent text-slate-500  hover:text-brand-navy '}`}>
                    Orders
                  </button>
                  <button onClick={() => handleTabChange('projects')} className={`pb-3 text-[14px] font-sans font-medium transition-colors border-b-2 ${activeTab === 'projects' ? 'border-brand-blue text-brand-navy ' : 'border-transparent text-slate-500  hover:text-brand-navy '}`}>
                    Projects
                  </button>
                  <button onClick={() => handleTabChange('addresses')} className={`pb-3 text-[14px] font-sans font-medium transition-colors border-b-2 ${activeTab === 'addresses' ? 'border-brand-blue text-brand-navy ' : 'border-transparent text-slate-500  hover:text-brand-navy '}`}>
                    Addresses
                  </button>
                  <button onClick={() => handleTabChange('password')} className={`pb-3 text-[14px] font-sans font-medium transition-colors border-b-2 ${activeTab === 'password' ? 'border-brand-blue text-brand-navy ' : 'border-transparent text-slate-500  hover:text-brand-navy '}`}>
                    Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="mt-8">
          
          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="border-transparent">
              <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-6">Account Details</h3>
              <div className="bg-white/40 backdrop-blur-md  rounded-[20px] border border-brand-navy/[0.08] ">
                <div className="flex justify-between items-center px-6 py-4 border-b border-brand-navy/[0.08] ">
                  <span className="text-[13px] font-mono tracking-widest uppercase text-slate-500 ">Member Since</span>
                  <span className="text-[14px] font-sans font-medium text-brand-navy ">{joinDate}</span>
                </div>
                <div className="flex justify-between items-center px-6 py-4">
                  <span className="text-[13px] font-mono tracking-widest uppercase text-slate-500 ">Account Status</span>
                  <span className="text-[14px] font-sans font-medium text-brand-navy ">{profile.isVerified ? 'Verified' : 'Standard'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && isOwner && (
            <div className="py-2 px-1 md:py-4 md:px-0 border-transparent max-w-2xl">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest uppercase text-slate-500  mb-1">Current Password</label>
                    <input type="password" value={passData.currentPassword} onChange={e => setPassData({...passData, currentPassword: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy focus:outline-none rounded-[20px] px-4 h-10 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono tracking-widest uppercase text-slate-500  mb-1">New Password</label>
                    <input type="password" value={passData.newPassword} onChange={e => setPassData({...passData, newPassword: e.target.value})} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy focus:outline-none rounded-[20px] px-4 h-10 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " required minLength="8" />
                  </div>
                </div>
                <Button type="submit" disabled={isSaving} variant="primary" className="mt-8 px-8" leftIcon={isSaving ? <AppleSpinner className="w-4 h-4 text-white" /> : <Key className="w-4 h-4" />}>
                  Update Password
                </Button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && isOwner && (
            <div className="border-transparent">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <h3 className="text-[20px] font-display font-medium text-brand-navy ">Delivery Addresses</h3>
                  <button onClick={addNewAddress} className="px-4 py-2 bg-brand-navy text-white rounded-[20px] text-[13px] font-medium hover:opacity-80 flex items-center gap-1 transition-all">
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </div>
                
                {addresses.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-brand-navy/[0.08]  rounded-[20px] bg-white/40 backdrop-blur-md ">
                    <Map className="w-10 h-10 text-slate-400 mx-auto mb-4 opacity-50" />
                    <p className="text-[14px] font-sans text-slate-500 ">No addresses saved yet.</p>
                    <button onClick={addNewAddress} className="mt-4 text-brand-blue hover:underline text-[14px] font-medium">Add your first address</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {addresses.map((addr, i) => (
                      <div key={i} className="p-6 md:p-8 bg-white/40 backdrop-blur-md  rounded-[20px] border border-brand-navy/[0.08]  relative group shadow-sm transition-all">
                        <button onClick={() => removeAddress(i)} className="absolute top-4 right-4 text-red-500 opacity-50 hover:opacity-100 transition-opacity p-2 hover:bg-red-50  rounded-full bg-white/40 backdrop-blur-md  shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="space-y-5 pr-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">Title</label>
                              <input type="text" value={addr.title} onChange={e => updateAddress(i, 'title', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " placeholder="Home" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">Address Line</label>
                              <input type="text" value={addr.addressLine || ''} onChange={e => updateAddress(i, 'addressLine', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " placeholder="123 Main St" />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">City</label>
                              <input type="text" value={addr.city || ''} onChange={e => updateAddress(i, 'city', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " placeholder="New York" />
                            </div>
                            <div>
                              <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">Zip Code</label>
                              <input type="text" value={addr.zipCode || ''} onChange={e => updateAddress(i, 'zipCode', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " placeholder="10001" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">Exact Location / Map Link</label>
                            <textarea rows="2" value={addr.exactLocation || ''} onChange={e => updateAddress(i, 'exactLocation', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy  resize-none" placeholder="E.g. Next to the blue gate..."></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] font-mono tracking-widest text-slate-500  uppercase mb-1.5 ml-1">Delivery Note</label>
                            <input type="text" value={addr.deliveryNote || ''} onChange={e => updateAddress(i, 'deliveryNote', e.target.value)} className="w-full bg-white/80  border border-brand-navy/[0.08]  focus:border-brand-navy rounded-[20px] px-3.5 py-2.5 text-[14px] font-sans focus:outline-none transition-colors text-brand-navy " placeholder="E.g. Call upon arrival" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {addresses.length > 0 && (
                  <div className="pt-4">
                    <Button onClick={handleUpdateAddresses} disabled={isSaving} variant="primary" className="w-full md:w-auto px-8" leftIcon={isSaving ? <AppleSpinner className="w-4 h-4 text-white" /> : <Save className="w-4 h-4" />}>
                      Save All Addresses
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && isOwner && (
            <div className="border-transparent">
              <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-4">Order History</h3>
              <div className="mt-2">
                 <OrdersList isEmbedded={true} />
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && isOwner && (
            <div className="border-transparent">
              <h3 className="text-[20px] font-display font-medium text-brand-navy  mb-4">My Projects</h3>
              <div className="mt-2">
                 <OrdersList isEmbedded={true} isProjectsMode={true} />
              </div>
            </div>
          )}

          

        </div>
    </PageContainer>
  );
}





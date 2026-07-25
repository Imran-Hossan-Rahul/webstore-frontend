"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminBannersPage() {
  const { showToast } = useToast();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titleTop: '',
    titleBottom: '',
    link: '',
    isActive: true,
    order: 0,
    image: null
  });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get('/market/banners/all');
      setBanners(res.data || res || []);
    } catch (err) {
      showToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      titleTop: '',
      titleBottom: '',
      link: '',
      isActive: true,
      order: banners.length,
      image: null
    });
    setShowModal(true);
  };

  const openEditModal = (banner) => {
    setEditId(banner._id);
    setFormData({
      titleTop: banner.titleTop,
      titleBottom: banner.titleBottom,
      link: banner.link || '',
      isActive: banner.isActive,
      order: banner.order,
      image: null // We don't load the file here, it's just an optional update
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editId && !formData.image) {
      showToast('Image is required for new banners', 'error');
      return;
    }
    
    setSaving(true);
    const data = new FormData();
    data.append('titleTop', formData.titleTop);
    data.append('titleBottom', formData.titleBottom);
    data.append('link', formData.link);
    data.append('isActive', formData.isActive);
    data.append('order', formData.order);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editId) {
        await api.put(`/market/banners/${editId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Banner updated', 'success');
      } else {
        await api.post('/market/banners', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        showToast('Banner created', 'success');
      }
      setShowModal(false);
      fetchBanners();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving banner', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/market/banners/${id}`);
      showToast('Banner deleted', 'success');
      fetchBanners();
    } catch (err) {
      showToast('Error deleting banner', 'error');
    }
  };

  const toggleActive = async (banner) => {
    try {
      await api.put(`/market/banners/${banner._id}`, { isActive: !banner.isActive });
      fetchBanners();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Market Banners</h1>
        <button 
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : banners.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center text-gray-400">
          No banners found. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden relative group">
              <div className="h-40 bg-gray-800 relative">
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL}${banner.image}`} 
                  alt={banner.titleBottom}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 p-4 flex flex-col justify-center bg-black/40">
                  <span className="text-sm text-gray-300">{banner.titleTop}</span>
                  <span className="text-xl font-bold text-yellow-500 uppercase">{banner.titleBottom}</span>
                </div>
              </div>
              <div className="p-4 flex items-center justify-between bg-gray-900">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded">Order: {banner.order}</span>
                  <button 
                    onClick={() => toggleActive(banner)}
                    className={`text-xs px-2 py-1 rounded ${banner.isActive ? 'bg-green-600/20 text-green-500' : 'bg-red-600/20 text-red-500'}`}
                  >
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(banner)} className="p-2 hover:bg-gray-800 rounded text-blue-400">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(banner._id)} className="p-2 hover:bg-gray-800 rounded text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-lg font-bold">{editId ? 'Edit Banner' : 'Create Banner'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title Top (e.g., Best Deals on)</label>
                <input 
                  type="text" name="titleTop" value={formData.titleTop} onChange={handleInputChange} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title Bottom (e.g., WINDOWS LAPTOPS)</label>
                <input 
                  type="text" name="titleBottom" value={formData.titleBottom} onChange={handleInputChange} required
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Banner Image (PNG, JPG, WEBP)</label>
                <input 
                  type="file" name="image" onChange={handleInputChange} accept="image/*"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                />
                {!formData.image && editId && <p className="text-xs text-gray-500 mt-1">Leave empty to keep existing image</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-gray-400 mb-1">Link (Optional)</label>
                  <input 
                    type="text" name="link" value={formData.link} onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-400 mb-1">Order</label>
                  <input 
                    type="number" name="order" value={formData.order} onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input 
                  type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={handleInputChange}
                  className="w-4 h-4 rounded bg-gray-800 border-gray-700"
                />
                <label htmlFor="isActive" className="text-sm">Is Active</label>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

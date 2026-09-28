"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { Plus, Trash2, Edit2, Check, X, Folder, CornerDownRight } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/components/ui/ToastProvider';

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    isSubcategory: false,
    parentCategory: '',
    isActive: true,
  });
  const [editId, setEditId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/market/categories/all');
      setCategories(res.data || res || []);
    } catch (err) {
      showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (category) => {
    setEditId(category._id);
    setFormData({
      name: category.name,
      isSubcategory: category.isSubcategory,
      parentCategory: category.parentCategory?._id || '',
      isActive: category.isActive,
      image: null
    });
    setImagePreview(category.image || null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.isSubcategory && !formData.parentCategory) {
      showToast('Please select a parent category', 'error');
      return;
    }
    
    setSaving(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('isSubcategory', formData.isSubcategory);
    if (formData.isSubcategory && formData.parentCategory) {
      data.append('parentCategory', formData.parentCategory);
    }
    data.append('isActive', formData.isActive);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editId) {
        await api.put(`/market/categories/${editId}`, data);
        showToast('Category updated', 'success');
      } else {
        await api.post('/market/categories', data);
        showToast('Category created', 'success');
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving category', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, isSub) => {
    if (!confirm(`Are you sure you want to delete this ${isSub ? 'sub-category' : 'category'}? ${!isSub ? 'All its sub-categories will also be deleted!' : ''}`)) return;
    try {
      await api.delete(`/market/categories/${id}`);
      showToast('Category deleted', 'success');
      fetchCategories();
    } catch (err) {
      showToast('Error deleting category', 'error');
    }
  };

  const toggleStatus = async (category) => {
    try {
      await api.put(`/market/categories/${category._id}`, { isActive: !category.isActive });
      fetchCategories();
    } catch (err) {
      showToast('Error updating status', 'error');
    }
  };

  // We don't filter into parentCategories and subCategories anymore. 
  // We'll build a flat tree representation for display
  const buildFlatTree = (cats, parentId = null, level = 0) => {
    let result = [];
    const children = cats.filter(c => (c.parentCategory?._id || c.parentCategory) === parentId || (parentId === null && !c.parentCategory));
    for (const child of children) {
      result.push({ ...child, level });
      result = result.concat(buildFlatTree(cats, child._id, level + 1));
    }
    return result;
  };
  
  const displayCategories = buildFlatTree(categories);
  const potentialParents = categories.filter(c => c._id !== editId);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-brand-navy dark:text-white">Market Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage categories and sub-categories for the marketplace.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ name: '', image: null, isSubcategory: false, parentCategory: '', isActive: true });
            setImagePreview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-brand-blue hover:bg-[#0055BB] text-white px-4 py-2 rounded-[4px] font-medium transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cloud dark:bg-zinc-800/50 border-b border-brand-navy/[0.08] dark:border-zinc-800">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Category Structure</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {displayCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">No categories found</td>
                </tr>
              ) : (
                displayCategories.map(cat => (
                  <tr key={cat._id} className="hover:bg-brand-cloud dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3" style={{ paddingLeft: `${cat.level * 24}px` }}>
                        {cat.level > 0 && <CornerDownRight size={16} className="text-slate-500 dark:text-slate-400" />}
                        <div className="w-10 h-10 rounded-[4px] bg-brand-cloud dark:bg-brand-surface/5 overflow-hidden flex items-center justify-center shrink-0 border border-brand-navy/[0.08] dark:border-white/10">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                          ) : (
                            <Folder size={18} className="text-slate-500 dark:text-slate-400" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 dark:text-brand-navy dark:text-white">{cat.name}</span>
                          {cat.level === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">Root</span>}
                          {cat.level === 1 && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">Sub</span>}
                          {cat.level > 1 && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Child</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        cat.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-slate-100 dark:bg-brand-surface/[0.05] text-slate-800 dark:text-slate-100 dark:bg-brand-surface/5 dark:text-slate-500 dark:text-slate-400'
                      }`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(cat)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-blue transition-colors rounded-[4px] hover:bg-brand-sky dark:hover:bg-blue-900/20">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(cat._id, cat.level > 0)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors rounded-[4px] hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-brand-surface dark:bg-zinc-900 rounded-[4px] w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-brand-navy dark:text-white">
                {editId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-brand-slate dark:text-slate-300"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-slate dark:text-brand-navy dark:text-slate-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-brand-navy/[0.08] dark:border-zinc-700 rounded-[4px] bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isSubcategory"
                  checked={formData.isSubcategory}
                  onChange={e => setFormData({...formData, isSubcategory: e.target.checked})}
                  className="rounded text-brand-blue"
                />
                <label htmlFor="isSubcategory" className="text-sm font-medium text-brand-slate dark:text-brand-navy dark:text-slate-300">
                  This is a sub-category
                </label>
              </div>

              {formData.isSubcategory && (
                <div>
                  <label className="block text-sm font-medium text-brand-slate dark:text-brand-navy dark:text-slate-300 mb-1">Parent Category</label>
                  <select
                    value={formData.parentCategory}
                    onChange={e => setFormData({...formData, parentCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-brand-navy/[0.08] dark:border-zinc-700 rounded-[4px] bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required={formData.isSubcategory}
                  >
                    <option value="">Select Parent</option>
                    {potentialParents.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-slate dark:text-brand-navy dark:text-slate-300 mb-1">Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-sky file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="mt-2 h-20 rounded object-cover" />
                )}
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded text-brand-blue"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-brand-slate dark:text-brand-navy dark:text-slate-300">
                  Active
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-brand-slate dark:text-slate-300 bg-slate-100 dark:bg-brand-surface/[0.05] hover:bg-slate-200 dark:bg-brand-surface/5 dark:hover:bg-brand-surface/10 dark:text-white rounded-[4px] font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-brand-blue hover:bg-blue-700 text-white rounded-[4px] font-medium disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

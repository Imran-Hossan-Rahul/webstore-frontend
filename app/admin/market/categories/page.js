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

  // Group categories for display
  const parentCategories = categories.filter(c => !c.isSubcategory);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Market Categories</h1>
          <p className="text-sm text-gray-500">Manage categories and sub-categories for the marketplace.</p>
        </div>
        <button
          onClick={() => {
            setEditId(null);
            setFormData({ name: '', image: null, isSubcategory: false, parentCategory: '', isActive: true });
            setImagePreview(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-[#0066CC] hover:bg-[#0055BB] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Folder size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">No categories found</p>
            <p className="mb-4">Get started by creating your first category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-zinc-800 border-b border-gray-100 dark:border-zinc-700">
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Name</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Image</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-600 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parentCategories.map(parent => (
                  <React.Fragment key={parent._id}>
                    {/* Parent Row */}
                    <tr className="border-b border-gray-50 dark:border-zinc-800 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                      <td className="p-4 font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Folder size={16} className="text-blue-500" /> {parent.name}
                      </td>
                      <td className="p-4">
                        {parent.image ? (
                          <img src={parent.image} alt={parent.name} className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleStatus(parent)}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${parent.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {parent.isActive ? <Check size={12} /> : <X size={12} />}
                          {parent.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEdit(parent)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(parent._id, false)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                    {/* Subcategory Rows */}
                    {categories.filter(c => c.isSubcategory && c.parentCategory?._id === parent._id).map(sub => (
                      <tr key={sub._id} className="border-b border-gray-50 dark:border-zinc-800 bg-gray-50/30 dark:bg-zinc-900/50 hover:bg-gray-50/80">
                        <td className="p-4 pl-10 text-gray-700 dark:text-gray-300 flex items-center gap-2 text-sm">
                          <CornerDownRight size={16} className="text-gray-400" /> {sub.name}
                        </td>
                        <td className="p-4">
                          {sub.image ? (
                            <img src={sub.image} alt={sub.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400"></span>
                          )}
                        </td>
                        <td className="p-4">
                          <button 
                            onClick={() => toggleStatus(sub)}
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {sub.isActive ? <Check size={12} /> : <X size={12} />}
                            {sub.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEdit(sub)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                            <button onClick={() => handleDelete(sub._id, true)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isSubcategory"
                  checked={formData.isSubcategory}
                  onChange={e => setFormData({...formData, isSubcategory: e.target.checked})}
                  className="rounded text-blue-600"
                />
                <label htmlFor="isSubcategory" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  This is a sub-category
                </label>
              </div>

              {formData.isSubcategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Category</label>
                  <select
                    value={formData.parentCategory}
                    onChange={e => setFormData({...formData, parentCategory: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg bg-transparent text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    required={formData.isSubcategory}
                  >
                    <option value="">Select Parent</option>
                    {parentCategories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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
                  className="rounded text-blue-600"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50">
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

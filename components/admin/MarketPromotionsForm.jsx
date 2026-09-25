"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useToast } from '@/components/ui/ToastProvider';
import { Save, Image as ImageIcon, Search, Plus, X } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function MarketPromotionsForm() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('flash');

  const [config, setConfig] = useState({
    flashDeals: [],
    trendingNow: [],
    todaysOffer: { title: "Get 20% OFF\non Audio Gear", code: "AUDIO20", link: "#", isActive: true, discountPercentage: 20, applicableProducts: [] },
    brandSpotlight: { brandName: "Brand Spotlight", subtitle: "GEEOO Premium Gear", logoUrl: "/logo.png", bgUrl: "/geeoo-banner.jpg", link: "#", isActive: true }
  });

  const getOptimizedUrl = (url) => {
    if (!url) return '';
    if (url.includes('cloudinary') && !url.includes('f_auto')) {
      return url.replace('/upload/', '/upload/f_auto,q_auto,w_200/');
    }
    return url;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, productsRes] = await Promise.all([
        api.get('/market/config'),
        api.get('/market/products?limit=1000')
      ]);
      
      const actualConfig = configRes.data || (configRes.singletonKey ? configRes : null);
      if (actualConfig) {
        // Map objects to IDs for state management
        setConfig({
          ...actualConfig,
          flashDeals: actualConfig.flashDeals.map(p => typeof p === 'object' ? p._id : p),
          trendingNow: actualConfig.trendingNow.map(p => typeof p === 'object' ? p._id : p),
          todaysOffer: {
            ...actualConfig.todaysOffer,
            applicableProducts: (actualConfig.todaysOffer?.applicableProducts || []).map(p => typeof p === 'object' ? p._id : p)
          }
        });
      }
      setProducts(productsRes.data.filter(p => p.status === 'Live'));
    } catch (err) {
      console.error(err);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/market/config', config);
      showToast('Promotions updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleProduct = (listName, productId) => {
    setConfig(prev => {
      if (listName.includes('.')) {
        const [parent, child] = listName.split('.');
        const list = prev[parent][child] || [];
        if (list.includes(productId)) {
          return { ...prev, [parent]: { ...prev[parent], [child]: list.filter(id => id !== productId) } };
        } else {
          return { ...prev, [parent]: { ...prev[parent], [child]: [...list, productId] } };
        }
      }
      
      const list = prev[listName] || [];
      if (list.includes(productId)) {
        return { ...prev, [listName]: list.filter(id => id !== productId) };
      } else {
        return { ...prev, [listName]: [...list, productId] };
      }
    });
  };

  const updateOffer = (field, value) => {
    setConfig(prev => ({ ...prev, todaysOffer: { ...prev.todaysOffer, [field]: value } }));
  };

  const updateBrand = (field, value) => {
    setConfig(prev => ({ ...prev, brandSpotlight: { ...prev.brandSpotlight, [field]: value } }));
  };

  const handleImageUpload = async (e, section, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    try {
      showToast('Uploading image...', 'info');
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (section === 'brandSpotlight') {
        updateBrand(field, res.data.url);
      }
      showToast('Image uploaded', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to upload image', 'error');
    }
  };

  // filtering is moved inside ProductSelector to handle selected state
  if (loading) {
    return <div className="flex items-center justify-center p-12"><AppleSpinner className="animate-spin text-slate-400" /></div>;
  }

  const renderProductSelector = (listName, label) => {
    const list = listName.includes('.') ? config[listName.split('.')[0]][listName.split('.')[1]] : config[listName];
    
    const displayProducts = searchQuery 
      ? products.filter(p => {
          const searchTerms = searchQuery.toLowerCase().split(' ').filter(Boolean);
          const title = (p.title || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          return searchTerms.every(term => title.includes(term) || sku.includes(term));
        })
      : products.filter(p => list?.includes(p._id));

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold dark:text-white">{label}</h3>
          <span className="text-sm text-slate-500">{list?.length || 0} selected</span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search to add products..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-slate-500"
          />
        </div>

        {displayProducts.length === 0 && !searchQuery && (
          <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            No products selected. Search above to add products.
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2">
          {displayProducts.map(product => {
            const isSelected = list?.includes(product._id);
            const photo = product.photos && JSON.parse(product.photos)[0];
            return (
              <div 
                key={product._id} 
                onClick={() => toggleProduct(listName, product._id)}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-brand-blue bg-blue-900/20' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
              >
                <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0">
                  {photo ? <img src={getOptimizedUrl(photo)} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-3 text-slate-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>{product.title || 'No Title'}</p>
                  <p className="text-xs text-slate-400">{product.selling_price} BDT</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm text-slate-200">
      <div className="flex border-b border-slate-800 overflow-x-auto">
        {['flash', 'trending', 'offer', 'brand'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition-colors ${activeTab === tab ? 'text-brand-blue border-b-2 border-brand-blue bg-slate-800/50' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
          >
            {tab === 'flash' && 'Flash Deals'}
            {tab === 'trending' && 'Trending Now'}
            {tab === 'offer' && 'Grand Opening Offer'}
            {tab === 'brand' && 'Brand Spotlight'}
          </button>
        ))}
      </div>

      <div className="p-6">
        {activeTab === 'flash' && renderProductSelector("flashDeals", "Select Flash Deal Products")}
        {activeTab === 'trending' && renderProductSelector("trendingNow", "Select Trending Products")}
        
        {activeTab === 'offer' && (
          <div className="max-w-4xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Offer Title (Use \n for new line)</label>
                <textarea 
                  value={config.todaysOffer.title} 
                  onChange={e => updateOffer('title', e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue text-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Destination Link</label>
                <input 
                  type="text" 
                  value={config.todaysOffer.link} 
                  onChange={e => updateOffer('link', e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Promo Code</label>
                <input 
                  type="text" 
                  value={config.todaysOffer.code} 
                  onChange={e => updateOffer('code', e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue font-mono text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Discount Percentage (%)</label>
                <input 
                  type="number" 
                  value={config.todaysOffer.discountPercentage || 0} 
                  onChange={e => updateOffer('discountPercentage', Number(e.target.value))}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue font-mono text-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              {renderProductSelector("todaysOffer.applicableProducts", "Select Applicable Products for Promo Code")}
            </div>
          </div>
        )}

        {activeTab === 'brand' && (
          <div className="max-w-2xl space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Brand Name</label>
              <input 
                type="text" 
                value={config.brandSpotlight.brandName} 
                onChange={e => updateBrand('brandName', e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Subtitle</label>
              <input 
                type="text" 
                value={config.brandSpotlight.subtitle} 
                onChange={e => updateBrand('subtitle', e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Logo Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    {config.brandSpotlight.logoUrl ? <img src={config.brandSpotlight.logoUrl} className="w-full h-full object-contain" /> : <ImageIcon className="m-auto mt-4 text-brand-slate" />}
                  </div>
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'brandSpotlight', 'logoUrl')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Background Image</label>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-slate-800">
                    {config.brandSpotlight.bgUrl ? <img src={config.brandSpotlight.bgUrl} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto mt-4 text-brand-slate" />}
                  </div>
                  <label className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer text-sm font-medium transition-colors">
                    Upload
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'brandSpotlight', 'bgUrl')} />
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Destination Link</label>
              <input 
                type="text" 
                value={config.brandSpotlight.link} 
                onChange={e => updateBrand('link', e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl outline-none focus:border-brand-blue text-white"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-blue hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
        >
          {saving ? <AppleSpinner size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

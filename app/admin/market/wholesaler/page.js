"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/utils/api'; // using secure api client for CSRF/tokens
import { Plus, X, Image as ImageIcon, Upload, BadgeCheck, Search, Filter, ShieldCheck, MapPin, Clock, Phone, DollarSign, Package, Facebook, Instagram, Linkedin, Mail, MessageCircle, Globe, Link2 } from "lucide-react";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function WholesalerLedger() {
  const [wholesalers, setWholesalers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedWholesaler, setSelectedWholesaler] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [exactLocation, setExactLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [nidOrTradeLicense, setNidOrTradeLicense] = useState('');
  const [supplierCategory, setSupplierCategory] = useState('Wholesaler');
  const [minOrderQuantity, setMinOrderQuantity] = useState(1);
  const [contacts, setContacts] = useState([{ type: 'Phone', value: '' }]);
  const [notes, setNotes] = useState('');
  const [paymentArrangement, setPaymentArrangement] = useState('pay_on_collection');
  
  // New operational states
  const [productCategories, setProductCategories] = useState('');
  const [shopHours, setShopHours] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [paymentMethods, setPaymentMethods] = useState(['Cash']);
  const [paymentDetails, setPaymentDetails] = useState({});
  
  // File states
  const [shopPhotos, setShopPhotos] = useState(null);
  const [idPhotos, setIdPhotos] = useState(null);

  useEffect(() => {
    fetchWholesalers();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/market/categories/all');
      setCategories(res.data || res || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchWholesalers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/market/wholesalers');
      if (res.success || Array.isArray(res)) {
        setWholesalers(res.data || res);
      } else {
        setWholesalers(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWholesaler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('location', location);
      formData.append('exactLocation', exactLocation);
      formData.append('website', website);
      formData.append('nidOrTradeLicense', nidOrTradeLicense);
      formData.append('supplierCategory', supplierCategory);
      formData.append('minOrderQuantity', minOrderQuantity);
      formData.append('contact', JSON.stringify(contacts));
      formData.append('notes', notes);
      formData.append('payment_arrangement', paymentArrangement);
      formData.append('productCategories', productCategories);
      formData.append('shopHours', shopHours);
      formData.append('googleMapsLink', googleMapsLink);
      formData.append('paymentMethods', paymentMethods.join(', '));
      formData.append('paymentDetails', JSON.stringify(paymentDetails));
      
      if (shopPhotos) {
        Array.from(shopPhotos).forEach(file => {
          formData.append('shopPhotos', file);
        });
      }
      
      if (idPhotos) {
        Array.from(idPhotos).forEach(file => {
          formData.append('idPhotos', file);
        });
      }

      const res = await api.post('/market/wholesalers', formData);
      
      if (res) {
        setShowModal(false);
        // Reset form
        setName(''); setLocation(''); setWebsite(''); setNidOrTradeLicense(''); setSupplierCategory('Wholesaler'); setMinOrderQuantity(1); setContacts([{ type: 'Phone', value: '' }]); setNotes(''); setPaymentArrangement('pay_on_collection'); setExactLocation(''); setProductCategories(''); setShopHours(''); setGoogleMapsLink(''); setPaymentMethods(['Cash']); setPaymentDetails({}); setShopPhotos(null); setIdPhotos(null);
        fetchWholesalers();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.response?.data?.error || err.message || 'Failed to add wholesaler');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-brand-navy dark:text-white">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-green-400">Wholesaler Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage wholesaler relationships and outstanding balances.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-[4px] font-medium transition shrink-0"
        >
          <Plus size={18} /> Add Wholesaler
        </button>
      </div>
      
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-brand-surface dark:bg-brand-surface text-slate-500 dark:text-slate-400 text-sm uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Name</th>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Payment Arrangement</th>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Products Listed</th>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Total Runs</th>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Outstanding Balance</th>
              <th className="p-4 font-medium border-b border-brand-navy/[0.08] dark:border-white/10">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500 dark:text-slate-400"><AppleSpinner className="animate-spin mx-auto mb-2" />Loading...</td></tr>
            ) : wholesalers.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-500 dark:text-slate-400">No wholesalers found. Add one to get started.</td></tr>
            ) : wholesalers.map(w => (
              <tr key={w.id} className="border-b border-brand-navy/[0.08] dark:border-white/10/50 hover:bg-brand-cloud dark:bg-brand-surface/30 transition">
                <td className="p-4 font-medium text-slate-200">
                  <div className="flex items-center gap-1.5">
                    {w.name}
                    {w.isVerified && <BadgeCheck size={16} className="text-blue-400" title="Verified Wholesaler" />}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${w.payment_arrangement === 'pay_after_cod' ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' : 'bg-green-900/30 text-green-400 border border-green-900/50'}`}>
                    {w.payment_arrangement.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{w._count?.products || 0}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400">{w._count?.runs || 0}</td>
                <td className="p-4 font-bold text-red-400">BDT {w.running_balance?.toLocaleString() || 0}</td>
                <td className="p-4">
                  <button 
                    onClick={() => setSelectedWholesaler(w)}
                    className="text-blue-400 hover:text-blue-300 font-medium text-sm transition px-3 py-1 bg-brand-blue/10 rounded-[4px] hover:bg-brand-blue/20 border border-brand-blue/20"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-slate-500 dark:text-slate-400">
            <AppleSpinner className="animate-spin mb-2" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : wholesalers.length === 0 ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm">No wholesalers found. Add one to get started.</div>
        ) : wholesalers.map(w => (
          <div key={w.id} className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <p className="font-semibold text-slate-100 truncate">{w.name}</p>
                  {w.isVerified && <BadgeCheck size={15} className="text-blue-400 shrink-0" />}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    w.payment_arrangement === 'pay_after_cod' 
                      ? 'bg-orange-900/30 text-orange-400 border border-orange-900/50' 
                      : 'bg-green-900/30 text-green-400 border border-green-900/50'
                  }`}>
                    {w.payment_arrangement.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-2 text-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Products</p>
                    <p className="text-white font-bold text-sm mt-0.5">{w._count?.products || 0}</p>
                  </div>
                  <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-2 text-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Runs</p>
                    <p className="text-white font-bold text-sm mt-0.5">{w._count?.runs || 0}</p>
                  </div>
                  <div className="bg-brand-cloud dark:bg-brand-surface rounded-[4px] p-2 text-center">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</p>
                    <p className="text-red-400 font-bold text-sm mt-0.5">{w.running_balance?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWholesaler(w)}
                className="shrink-0 text-blue-400 text-xs font-medium px-3 py-1.5 bg-brand-blue/10 rounded-[4px] border border-brand-blue/20"
              >
                Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Wholesaler Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-navy/[0.08] dark:border-white/10 shrink-0">
              <h3 className="text-xl font-bold text-brand-navy dark:text-white">Add New Wholesaler / Supplier</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 dark:text-slate-400 hover:text-white transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {errorMsg && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-[4px] text-red-500 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
              <form id="wholesalerForm" onSubmit={handleAddWholesaler} className="space-y-6">
                
                {/* SECTION: Basic Info */}
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Basic Company Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Company / Supplier Name *</label>
                      <input 
                        required
                        type="text" 
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="e.g. Acme Tech Ltd."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Supplier Category *</label>
                      <div className="relative">
                        <select 
                          value={supplierCategory} onChange={(e) => setSupplierCategory(e.target.value)}
                          className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition appearance-none"
                        >
                          <option value="Wholesaler">Wholesaler</option>
                          <option value="Manufacturer">Manufacturer</option>
                          <option value="Distributor">Distributor</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">NID / Trade License No. (Optional)</label>
                      <input 
                        type="text" 
                        value={nidOrTradeLicense} onChange={(e) => setNidOrTradeLicense(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="NID or Business Registration"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Website / Portal (Optional)</label>
                      <input 
                        type="url" 
                        value={website} onChange={(e) => setWebsite(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Product Categories *</label>
                    <div className="relative">
                      <select 
                        required
                        value={productCategories} onChange={(e) => setProductCategories(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition appearance-none"
                      >
                        <option value="" disabled>Select a category</option>
                        {categories.filter(c => !c.isSubcategory).map(c => (
                          <option key={c._id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION: Logistics & Contact */}
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Logistics & Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">City / Region (Short) *</label>
                      <input 
                        required
                        type="text" 
                        value={location} onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="e.g. Dhaka, Gulshan"
                      />
                    </div>
                    <div className="md:col-span-2 mt-4 border-t border-brand-navy/[0.08] dark:border-white/10 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400">Contact Information *</label>
                        <button 
                          type="button"
                          onClick={() => setContacts([...contacts, { type: 'Phone', value: '' }])}
                          className="text-xs text-brand-teal hover:text-green-400 font-medium bg-brand-teal/10 px-3 py-1.5 rounded-md transition"
                        >
                          + Add Contact
                        </button>
                      </div>
                      <div className="space-y-3">
                        {contacts.map((c, index) => (
                          <div key={index} className="flex gap-2 items-start">
                            <div className="w-1/3">
                              <div className="relative">
                                <select 
                                  value={c.type}
                                  onChange={(e) => {
                                    const newContacts = [...contacts];
                                    newContacts[index].type = e.target.value;
                                    setContacts(newContacts);
                                  }}
                                  className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-3 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition appearance-none text-sm"
                                >
                                  <option value="Phone">Phone</option>
                                  <option value="WhatsApp">WhatsApp</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="LinkedIn">LinkedIn</option>
                                  <option value="Email">Email</option>
                                  <option value="Other">Other</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <input 
                                required={index === 0}
                                type="text" 
                                value={c.value}
                                onChange={(e) => {
                                  const newContacts = [...contacts];
                                  newContacts[index].value = e.target.value;
                                  setContacts(newContacts);
                                }}
                                className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-sm"
                                placeholder={index === 0 ? "Primary Contact (Required) *" : index === 1 ? "Secondary Contact" : `Contact #${index + 1}`}
                              />
                            </div>
                            {index > 0 && (
                              <button 
                                type="button"
                                onClick={() => {
                                  const newContacts = contacts.filter((_, i) => i !== index);
                                  setContacts(newContacts);
                                }}
                                className="p-2.5 bg-brand-surface dark:bg-brand-surface hover:bg-red-500/10 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 hover:border-red-500/20 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Shop Hours / Collection Time *</label>
                      <input 
                        required
                        type="text" 
                        value={shopHours} onChange={(e) => setShopHours(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="e.g. 10 AM - 8 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Google Maps Link *</label>
                      <input 
                        required
                        type="url" 
                        value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Exact Store / Warehouse Location *</label>
                    <textarea 
                      required 
                      value={exactLocation} onChange={(e) => setExactLocation(e.target.value)}
                      className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition h-16 resize-none"
                      placeholder="Full exact address for logistics pickup..."
                    ></textarea>
                  </div>
                </div>

                {/* SECTION: Terms & Agreements */}
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Terms & Agreements</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Payment Arrangement *</label>
                      <select 
                        value={paymentArrangement} onChange={(e) => setPaymentArrangement(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition appearance-none"
                      >
                        <option value="pay_after_cod">Pay After COD (Consignment)</option>
                        <option value="pay_on_collection">Pay on Collection (Upfront)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Minimum Order Quantity (MOQ)</label>
                      <input 
                        type="number" 
                        min="1"
                        value={minOrderQuantity} onChange={(e) => setMinOrderQuantity(e.target.value)}
                        className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Payment Methods *</label>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {['Cash', 'bKash', 'Nagad', 'Rocket'].map(method => (
                          <label key={method} className="flex items-center gap-2 cursor-pointer bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 px-3 py-2 rounded-[4px] hover:border-green-500 transition">
                            <input 
                              type="checkbox" 
                              checked={paymentMethods.includes(method)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPaymentMethods([...paymentMethods, method]);
                                } else {
                                  setPaymentMethods(paymentMethods.filter(m => m !== method));
                                  if (method !== 'Cash') {
                                    const newDetails = { ...paymentDetails };
                                    delete newDetails[method];
                                    setPaymentDetails(newDetails);
                                  }
                                }
                              }}
                              className="w-4 h-4 text-brand-teal bg-brand-cloud dark:bg-brand-surface border-slate-600 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <span className="text-sm text-brand-navy dark:text-slate-300">{method}</span>
                          </label>
                        ))}
                      </div>
                      
                      {/* Render inputs for selected digital methods */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paymentMethods.filter(m => m !== 'Cash').map(method => (
                          <div key={method}>
                            <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">{method} Number *</label>
                            <input 
                              required
                              type="text" 
                              value={paymentDetails[method] || ''} 
                              onChange={(e) => setPaymentDetails({ ...paymentDetails, [method]: e.target.value })}
                              className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                              placeholder={`e.g. 017... (${method} Personal/Agent)`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Private Negotiation Notes (Optional)</label>
                    <textarea 
                      value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] px-4 py-2.5 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition h-20 resize-none"
                      placeholder="Any specific deals, return policies, or verbal agreements..."
                    ></textarea>
                  </div>
                </div>

                {/* SECTION: Verification Uploads */}
                <div>
                  <h4 className="text-lg font-semibold text-green-400 mb-3 border-b border-brand-navy/[0.08] dark:border-white/10 pb-2">Verification Uploads</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">Shop / Warehouse Photos (Optional)</label>
                      <div className="relative w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 border-dashed rounded-[4px] p-4 text-center hover:border-green-500 transition cursor-pointer">
                        <input 
                          type="file" 
                          multiple
                          accept="image/*,video/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              setShopPhotos(prev => prev ? [...prev, ...newFiles] : newFiles);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                          <Upload size={20} className="mb-2 text-green-400" />
                          <span className="text-xs">Upload Shop Photos</span>
                        </div>
                      </div>
                      
                      {shopPhotos && shopPhotos.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{shopPhotos.length} file(s) selected</span>
                            <button type="button" onClick={() => setShopPhotos(null)} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(shopPhotos).map((file, i) => (
                              <div key={i} className="flex items-center gap-1 bg-brand-cloud dark:bg-brand-surface text-xs px-2 py-1 rounded text-brand-navy dark:text-slate-300">
                                <ImageIcon size={12} />
                                <span className="truncate max-w-[100px]">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5">NID / License Document (Optional)</label>
                      <div className="relative w-full bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 border-dashed rounded-[4px] p-4 text-center hover:border-green-500 transition cursor-pointer">
                        <input 
                          type="file" 
                          multiple
                          accept="image/*,application/pdf"
                          onChange={(e) => {
                            if (e.target.files) {
                              const newFiles = Array.from(e.target.files);
                              setIdPhotos(prev => prev ? [...prev, ...newFiles] : newFiles);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                          <Upload size={20} className="mb-2 text-green-400" />
                          <span className="text-xs">Upload Document</span>
                        </div>
                      </div>
                      
                      {idPhotos && idPhotos.length > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-slate-500 dark:text-slate-400">{idPhotos.length} file(s) selected</span>
                            <button type="button" onClick={() => setIdPhotos(null)} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(idPhotos).map((file, i) => (
                              <div key={i} className="flex items-center gap-1 bg-brand-cloud dark:bg-brand-surface text-xs px-2 py-1 rounded text-brand-navy dark:text-slate-300">
                                <ImageIcon size={12} />
                                <span className="truncate max-w-[100px]">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-brand-navy/[0.08] dark:border-white/10 shrink-0 flex gap-3 bg-brand-surface dark:bg-brand-surface">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-white rounded-[4px] font-medium transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  form="wholesalerForm"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-[4px] font-medium transition flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <AppleSpinner size={16} className="animate-spin" />}
                  Save Wholesaler
                </button>
              </div>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {selectedWholesaler && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-brand-navy/[0.08] dark:border-white/10 shrink-0 bg-brand-surface dark:bg-brand-surface/50">
              <div className="flex items-center gap-3">
                <h3 className="text-[24px] font-display font-medium text-brand-navy dark:text-white">{selectedWholesaler.name}</h3>
                {selectedWholesaler.isVerified && (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-brand-teal/10 px-2.5 py-1 rounded-full border border-green-500/20">
                    <ShieldCheck size={14} /> VERIFIED
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedWholesaler(null)} className="text-slate-500 dark:text-slate-400 hover:text-white transition bg-brand-cloud dark:bg-brand-surface p-2 rounded-[4px] hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
              
              {/* Top Meta Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-brand-surface dark:bg-brand-surface p-4 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Supplier Type</p>
                  <p className="text-white font-medium">{selectedWholesaler.supplierCategory}</p>
                </div>
                <div className="bg-brand-surface dark:bg-brand-surface p-4 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Products Listed</p>
                  <p className="text-white font-medium text-lg">{selectedWholesaler._count?.products || 0}</p>
                </div>
                <div className="bg-brand-surface dark:bg-brand-surface p-4 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Min Order Qty</p>
                  <p className="text-white font-medium text-lg">{selectedWholesaler.minOrderQuantity}</p>
                </div>
                <div className="bg-brand-surface dark:bg-brand-surface p-4 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1">Payment Arr.</p>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-block mt-1 ${
                    selectedWholesaler.payment_arrangement === 'pay_on_collection' 
                    ? 'bg-brand-blue/10 text-blue-400 border border-brand-blue/20' 
                    : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                  }`}>
                    {selectedWholesaler.payment_arrangement === 'pay_on_collection' ? 'Pay Upfront' : 'Pay After COD'}
                  </span>
                </div>
              </div>

              {/* Grid Layout for Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Location & Logistics */}
                  <div>
                    <h4 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MapPin size={16} /> Location & Logistics
                    </h4>
                    <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-5 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">City / Region</p>
                        <p className="text-slate-200">{selectedWholesaler.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Exact Warehouse Location</p>
                        <p className="text-slate-200">{selectedWholesaler.exactLocation}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Google Maps</p>
                        <a href={selectedWholesaler.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">
                          {selectedWholesaler.googleMapsLink}
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1"><Clock size={12} /> Shop Hours / Collection Time</p>
                        <p className="text-slate-200">{selectedWholesaler.shopHours}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div>
                    <h4 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <DollarSign size={16} /> Payment Methods
                    </h4>
                    <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-5">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedWholesaler.paymentMethods?.split(',').map((method, idx) => (
                          <span key={idx} className="bg-brand-teal/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">
                            {method.trim()}
                          </span>
                        ))}
                      </div>
                      
                      {selectedWholesaler.paymentDetails && (
                        <div className="space-y-3 mt-4 border-t border-brand-navy/[0.08] dark:border-white/10 pt-4">
                          {Object.entries(JSON.parse(selectedWholesaler.paymentDetails || '{}')).map(([method, details]) => (
                            <div key={method} className="flex justify-between items-center bg-brand-surface dark:bg-brand-surface p-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
                              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{method}</span>
                              <span className="text-white font-mono text-sm">{details}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h4 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Phone size={16} /> Contact Information
                    </h4>
                    <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-5 space-y-3">
                      {(() => {
                        try {
                          const contacts = JSON.parse(selectedWholesaler.contact || '[]');
                          
                          const getContactIcon = (type) => {
                            switch (type) {
                              case 'Phone': return <Phone size={14} className="text-blue-400" />;
                              case 'WhatsApp': return <MessageCircle size={14} className="text-green-400" />;
                              case 'Facebook': return <Facebook size={14} className="text-brand-blue" />;
                              case 'Instagram': return <Instagram size={14} className="text-pink-400" />;
                              case 'LinkedIn': return <Linkedin size={14} className="text-brand-blue" />;
                              case 'Email': return <Mail size={14} className="text-orange-400" />;
                              default: return <Link2 size={14} className="text-slate-500 dark:text-slate-400" />;
                            }
                          };

                          const getContactHref = (type, value) => {
                            if (!value) return '#';
                            switch (type) {
                              case 'Phone': return `tel:${value.replace(/[^0-9+]/g, '')}`;
                              case 'WhatsApp': return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
                              case 'Email': return `mailto:${value}`;
                              default: return value.startsWith('http') ? value : `https://${value}`;
                            }
                          };

                          return contacts.map((c, idx) => {
                            const href = getContactHref(c.type, c.value);
                            return (
                              <a 
                                key={idx} 
                                href={href} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between p-3 bg-brand-surface dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 hover:border-brand-navy/[0.08] dark:border-white/10 hover:bg-slate-50 dark:bg-brand-surface/5 transition cursor-pointer group"
                              >
                                <span className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider group-hover:text-slate-500 dark:text-slate-400 transition">
                                  {getContactIcon(c.type)}
                                  {c.type}
                                </span>
                                <span className="text-white font-medium group-hover:text-blue-400 transition">{c.value}</span>
                              </a>
                            );
                          });
                        } catch (e) {
                          return <p className="text-brand-navy dark:text-slate-300">{selectedWholesaler.contact}</p>;
                        }
                      })()}
                      {selectedWholesaler.website && (
                        <div className="pt-3 border-t border-brand-navy/[0.08] dark:border-white/10 mt-2">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-2"><Globe size={12} /> Website</p>
                          <a href={selectedWholesaler.website.startsWith('http') ? selectedWholesaler.website : `https://${selectedWholesaler.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                            {selectedWholesaler.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Business & Products */}
                  <div>
                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Package size={16} /> Business Info
                    </h4>
                    <div className="bg-brand-surface dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-5 space-y-4">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Product Categories</p>
                        <p className="text-slate-200">{selectedWholesaler.productCategories}</p>
                      </div>
                      {selectedWholesaler.nidOrTradeLicense && (
                        <div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">NID / Trade License</p>
                          <p className="text-slate-200 font-mono text-sm">{selectedWholesaler.nidOrTradeLicense}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedWholesaler.notes && (
                    <div>
                      <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-4">Notes</h4>
                      <div className="bg-brand-amber/10 border border-yellow-500/20 rounded-[4px] p-5">
                        <p className="text-yellow-200/80 text-sm whitespace-pre-wrap">{selectedWholesaler.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Media Section */}
              {((selectedWholesaler.shopPhotos && selectedWholesaler.shopPhotos !== "[]") || (selectedWholesaler.idPhotos && selectedWholesaler.idPhotos !== "[]")) && (
                <div className="border-t border-brand-navy/[0.08] dark:border-white/10 pt-8 mt-4">
                  <h4 className="text-sm font-bold text-brand-navy dark:text-slate-300 uppercase tracking-widest mb-4">Uploaded Media</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedWholesaler.shopPhotos && selectedWholesaler.shopPhotos !== "[]" && JSON.parse(selectedWholesaler.shopPhotos).map((url, idx) => (
                      <div key={`shop-${idx}`} className="relative aspect-square rounded-[4px] overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 group">
                        <img src={url} alt="Shop" className="w-full h-full object-cover group-hover:opacity-80 transition duration-500" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-[10px] font-bold text-brand-navy dark:text-white">Shop Photo</p>
                        </div>
                      </div>
                    ))}
                    {selectedWholesaler.idPhotos && selectedWholesaler.idPhotos !== "[]" && JSON.parse(selectedWholesaler.idPhotos).map((url, idx) => (
                      <div key={`id-${idx}`} className="relative aspect-square rounded-[4px] overflow-hidden border border-brand-navy/[0.08] dark:border-white/10 group">
                        <img src={url} alt="ID" className="w-full h-full object-cover group-hover:opacity-80 transition duration-500" />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-[10px] font-bold text-brand-navy dark:text-white">ID Document</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-brand-navy/[0.08] dark:border-white/10 flex justify-end shrink-0 bg-brand-surface dark:bg-brand-surface/50">
              <button onClick={() => setSelectedWholesaler(null)} className="px-6 py-2.5 bg-brand-cloud dark:bg-brand-surface hover:bg-slate-700 text-white rounded-[4px] font-medium transition">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

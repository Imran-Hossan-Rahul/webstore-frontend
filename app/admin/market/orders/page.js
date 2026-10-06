"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { ChevronDown, Search, RefreshCw, Package, CheckCircle2, Truck, Home, XCircle, Clock, FileText, Calendar } from "lucide-react";
import { generateInvoice } from '@/utils/generateInvoice';
import AppleSpinner from "@/components/ui/AppleSpinner";

const STATUS_FLOW = ['Pending Verification', 'Order placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  'Pending Verification': { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30', icon: Clock },
  'Order placed': { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30', icon: Clock },
  'Confirmed':    { color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30',   icon: CheckCircle2 },
  'Processing':   { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30', icon: Package },
  'Shipped':      { color: 'text-cyan-600 dark:text-cyan-400',   bg: 'bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/30',   icon: Truck },
  'Delivered':    { color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/30', icon: Home },
  'Cancelled':    { color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-500/10 border-red-200 dark:border-red-500/30',     icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); 
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null, courier: '', tracking: '' });
  const [toast, setToast] = useState(null);
  const [activeStatusPicker, setActiveStatusPicker] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.get('/market/orders/all');
      setOrders(Array.isArray(data) ? data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    if (newStatus === 'Shipped') {
      setShippingModal({ isOpen: true, orderId, courier: '', tracking: '' });
      return;
    }
    await updateStatus(orderId, newStatus, {});
  };

  const updateStatus = async (orderId, newStatus, payloadData = {}) => {
    setUpdating(orderId);
    try {
      await api.patch(`/market/orders/` + orderId + `/status`, { status: newStatus, ...payloadData });
      setOrders(prev => prev.map(o => o.id === orderId || o._id?.toString() === orderId 
        ? { 
            ...o, 
            status: newStatus, 
            confirmed_at: newStatus === 'Confirmed' ? new Date().toISOString() : o.confirmed_at,
            ...payloadData
          }
        : o
      ));
      showToast(`Order status updated to "` + newStatus + `"`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
      setActiveStatusPicker(null);
    }
  };

  const handleShippingSubmit = async () => {
    const { orderId, courier, tracking } = shippingModal;
    if (!courier.trim() || !tracking.trim()) {
      showToast('Both Courier Name and Tracking ID are required.', 'error');
      return;
    }
    setShippingModal({ isOpen: false, orderId: null, courier: '', tracking: '' });
    await updateStatus(orderId, 'Shipped', { courier_name: courier.trim(), tracking_id: tracking.trim() });
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—';
  const formatPrice = (p) => new Intl.NumberFormat('en-IN').format(p || 0);

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const searchLower = search.toLowerCase();
    let trackingMatch = o.tracking_id?.toLowerCase().includes(searchLower);
    let nameMatch = false;
    try {
      const addrObj = typeof o.address === 'string' ? JSON.parse(o.address) : o.address;
      nameMatch = addrObj?.name?.toLowerCase().includes(searchLower);
    } catch(e) {}
    const matchSearch = !search || 
      (o.id || o._id?.toString() || '').toLowerCase().includes(searchLower) ||
      (o.phone || '').includes(search) || trackingMatch || nameMatch;

    let matchDate = true;
    if (dateFilter !== 'All') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        matchDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7Days') {
        matchDate = (now - orderDate) / (1000 * 60 * 60 * 24) <= 7;
      } else if (dateFilter === '30Days') {
        matchDate = (now - orderDate) / (1000 * 60 * 60 * 24) <= 30;
      }
    }
    return matchStatus && matchSearch && matchDate;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-slate-800 dark:text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="text-blue-500" size={28} /> Order Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">View, track, and update the status of marketplace orders.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white dark:bg-brand-surface hover:bg-slate-50 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-md text-sm font-medium transition shadow-sm shrink-0"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-blue-500' : 'text-slate-400'} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
        {['All', ...STATUS_FLOW, 'Cancelled'].map(status => {
          const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-3.5 rounded-xl border text-left transition duration-200 flex flex-col justify-between min-h-[88px] ` + (
                filterStatus === status 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white dark:bg-brand-surface border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 text-slate-600 dark:text-slate-400 shadow-sm'
              )}
            >
              <div className={`text-2xl font-bold font-mono tracking-tight ` + (filterStatus === status ? 'text-white' : 'text-slate-800 dark:text-slate-200')}>{count}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider truncate mt-1">{status}</div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, Phone, Name, or Tracking..."
            className="w-full bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-slate-800 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition shadow-sm placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>
        <div className="shrink-0 relative">
          <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="appearance-none bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-slate-800 dark:text-white font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition shadow-sm cursor-pointer"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="7Days">Last 7 Days</option>
            <option value="30Days">Last 30 Days</option>
          </select>
          <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="hidden md:block bg-white dark:bg-brand-surface rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-visible relative z-10">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-brand-surface text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-white/10">
            <tr>
              <th className="p-4 rounded-tl-xl">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-48">Update Status</th>
              <th className="p-4 text-center rounded-tr-xl">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {loading ? (
              <tr>
                <td colSpan="8" className="p-16 text-center text-slate-500">
                  <AppleSpinner className="animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Loading orders...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-16 text-center text-slate-500">
                  <Package size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No orders found.</p>
                </td>
              </tr>
            ) : filtered.map(order => {
              const orderId = order.id || order._id?.toString();
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order placed'];
              const Icon = cfg.icon;
              const itemsPrice = (order.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
              const deliveryCharge = typeof order.delivery_charge === 'number' ? order.delivery_charge : Math.round(itemsPrice * 0.01);
              const total = typeof order.total_amount === 'number' && order.total_amount > 0 ? order.total_amount : itemsPrice + deliveryCharge;
              const isExpanded = expandedOrder === orderId;
              const dueAmount = order.status === 'Delivered' || order.status === 'Cancelled' ? 0 : total;
              const timeSinceOrder = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));
              let addrObj = {};
              try { addrObj = (typeof order.address === 'string' ? JSON.parse(order.address) : order.address) || {}; } catch(e) {}

              return (
                <React.Fragment key={orderId}>
                  <tr className={`group transition-colors ` + (isExpanded ? 'bg-blue-50/50 dark:bg-white/5' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]')}>
                    <td className="p-4 align-top">
                      <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">#{orderId?.slice(-8).toUpperCase()}</span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{addrObj.name || '—'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{order.phone || '—'}</div>
                    </td>
                    <td className="p-4 align-top text-xs text-slate-500 whitespace-nowrap font-medium">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4 align-top text-sm font-medium text-slate-700 dark:text-slate-300">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="p-4 align-top font-bold text-slate-900 dark:text-white text-sm">
                      ৳ {formatPrice(total)}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border ` + cfg.bg + ` ` + cfg.color}>
                        <Icon size={12} strokeWidth={2.5} />
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <div className="relative">
                        <button
                          onClick={() => setActiveStatusPicker(activeStatusPicker === orderId ? null : orderId)}
                          disabled={updating === orderId}
                          className="w-full flex items-center justify-between bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/30 rounded-md px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50 shadow-sm"
                        >
                          <span>{updating === orderId ? 'Updating...' : 'Update'}</span>
                          {updating === orderId ? <AppleSpinner size={12} className="animate-spin" /> : <ChevronDown size={14} className={activeStatusPicker === orderId ? 'rotate-180 transition-transform' : 'transition-transform'} />}
                        </button>
                        
                        {activeStatusPicker === orderId && (
                          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 shadow-xl rounded-lg py-1 z-[100] max-h-60 overflow-y-auto">
                            {[...STATUS_FLOW, 'Cancelled'].map(s => {
                              const sCfg = STATUS_CONFIG[s];
                              const SIcon = sCfg?.icon;
                              const isSelected = order.status === s;
                              return (
                                <button
                                  key={s}
                                  onClick={() => handleStatusChange(orderId, s)}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition text-left ` + (isSelected ? 'bg-blue-50 dark:bg-white/10 font-bold text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium')}
                                >
                                  {SIcon && <SIcon size={14} className={sCfg?.color} />}
                                  <span>{s}</span>
                                  {isSelected && <span className="ml-auto text-[9px] text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-1.5 rounded uppercase">Now</span>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-top text-center">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition ` + (isExpanded ? 'bg-slate-200 dark:bg-white/20 text-slate-800 dark:text-white' : 'bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300')}
                      >
                        {isExpanded ? 'Close' : 'View'}
                      </button>
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-slate-50/50 dark:bg-white/[0.02]">
                      <td colSpan="8" className="p-0 border-t border-slate-200 dark:border-white/10">
                        <div className="px-6 py-6 border-b-2 border-blue-500/20 shadow-inner">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Package size={14} /> Ordered Items</h4>
                              <div className="space-y-2">
                                {(order.items || []).map((item, idx) => {
                                  let photo = null;
                                  try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                                  return (
                                    <div key={idx} className="flex items-center gap-4 bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-white/10 shadow-sm">
                                      <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/5">
                                        {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Package size={20} className="text-slate-400" />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.product?.title || 'Unknown Product'}</p>
                                        {item.variants && <p className="text-xs font-medium text-slate-500 mt-0.5">Variant: <span className="text-slate-700 dark:text-slate-300">{item.variants}</span></p>}
                                        {item.product?.warranty_info && <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 font-mono font-bold">Warranty: {item.product.warranty_info}</p>}
                                      </div>
                                      <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">৳ {formatPrice(item.price_at_purchase * item.quantity)}</p>
                                        <p className="text-xs font-bold text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="col-span-1 sm:col-span-2">
                                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Truck size={14} /> Shipping Information</h4>
                                <div className="bg-white dark:bg-brand-surface rounded-lg p-4 border border-slate-200 dark:border-white/10 text-sm space-y-1.5 text-slate-700 dark:text-slate-300 shadow-sm">
                                  <p className="font-bold text-slate-900 dark:text-white text-base">{addrObj.name || '—'}</p>
                                  <p className="flex items-center gap-2"><span className="text-slate-500 font-medium">Phone:</span> <span className="font-mono font-medium">{order.phone || '—'}</span></p>
                                  <p className="flex items-center gap-2"><span className="text-slate-500 font-medium">Area:</span> <span className="font-medium">{addrObj.upazila || ''}{addrObj.district ? `, ${addrObj.district}` : ''}</span></p>
                                  <p className="flex gap-2"><span className="text-slate-500 font-medium">Address:</span> <span className="leading-snug font-medium">{addrObj.details || '—'}</span></p>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2 mb-3">Order Summary</h4>
                                <div className="bg-white dark:bg-brand-surface rounded-lg p-4 border border-slate-200 dark:border-white/10 text-sm space-y-2.5 shadow-sm">
                                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold"><span>Subtotal</span><span>৳ {formatPrice(itemsPrice)}</span></div>
                                  <div className="flex justify-between text-slate-600 dark:text-slate-400 font-bold"><span>Delivery</span><span>৳ {formatPrice(deliveryCharge)}</span></div>
                                  <div className="flex justify-between font-black text-slate-900 dark:text-white border-t border-slate-100 dark:border-white/10 pt-2.5 text-base"><span>Total</span><span>৳ {formatPrice(total)}</span></div>
                                  <div className={`flex justify-between font-black pt-1 ` + (dueAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400')}>
                                    <span>Due</span><span>৳ {formatPrice(dueAmount)}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-2 mb-3">Payment & Tracking</h4>
                                <div className="bg-white dark:bg-brand-surface rounded-lg p-4 border border-slate-200 dark:border-white/10 text-[13px] space-y-2.5 shadow-sm text-slate-700 dark:text-slate-300">
                                  <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Method</span><span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{order.payment_method || 'COD'}</span></div>
                                  {order.payment_method === 'bkash_manual' && (
                                    <>
                                      <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">bKash</span><span className="font-mono font-bold text-slate-900 dark:text-white">{order.payment_number}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">TrxID</span><span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">{order.payment_trx_id}</span></div>
                                    </>
                                  )}
                                  {(order.courier_name || order.tracking_id) && (
                                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                                      {order.courier_name && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Courier</span><span className="font-bold text-slate-900 dark:text-white">{order.courier_name}</span></div>}
                                      {order.tracking_id && <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Tracking</span><span className="font-mono font-bold text-slate-900 dark:text-white">{order.tracking_id}</span></div>}
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="col-span-1 sm:col-span-2 mt-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md shadow-blue-500/20"
                                >
                                  <FileText size={16} /> Download Professional Invoice
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-4 relative z-10">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-slate-500">
            <AppleSpinner className="animate-spin mb-3" />
            <span className="text-sm font-medium">Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders found.</p>
          </div>
        ) : filtered.map(order => {
          const orderId = order.id || order._id?.toString();
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order placed'];
          const Icon = cfg.icon;
          const itemsPrice = (order.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
          const deliveryCharge = typeof order.delivery_charge === 'number' ? order.delivery_charge : Math.round(itemsPrice * 0.01);
          const total = typeof order.total_amount === 'number' && order.total_amount > 0 ? order.total_amount : itemsPrice + deliveryCharge;
          const isExpanded = expandedOrder === orderId;
          const dueAmount = order.status === 'Delivered' || order.status === 'Cancelled' ? 0 : total;
          let addrObj = {};
          try { addrObj = (typeof order.address === 'string' ? JSON.parse(order.address) : order.address) || {}; } catch(e) {}

          return (
            <div key={orderId} className="bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 rounded-xl overflow-visible shadow-sm">
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">#{orderId?.slice(-8).toUpperCase()}</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-1.5">{addrObj.name || '—'}</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{order.phone || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border shrink-0 uppercase tracking-wide ` + cfg.bg + ` ` + cfg.color}>
                    <Icon size={12} strokeWidth={2.5} />{order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-white/5 pt-3 mt-1">
                  <div>
                    <p className="text-xs font-bold text-slate-500">{order.items?.length || 0} item(s) • {formatDate(order.createdAt)}</p>
                    <p className="font-black text-slate-900 dark:text-white text-lg mt-0.5">৳ {formatPrice(total)}</p>
                  </div>
                </div>
                <div className="mt-4 relative">
                  <button
                    onClick={() => setActiveStatusPicker(activeStatusPicker === orderId ? null : orderId)}
                    disabled={updating === orderId}
                    className="w-full flex items-center justify-between bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
                  >
                    <span>Update: <span className="text-blue-600 dark:text-blue-400">{order.status}</span></span>
                    {updating === orderId ? <AppleSpinner size={16} className="animate-spin" /> : <ChevronDown size={16} className={`transition-transform ` + (activeStatusPicker === orderId ? 'rotate-180' : '')} />}
                  </button>
                  {activeStatusPicker === orderId && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden z-[100]">
                      {[...STATUS_FLOW, 'Cancelled'].map(s => {
                        const sCfg = STATUS_CONFIG[s];
                        const SIcon = sCfg?.icon;
                        const isSelected = order.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => handleStatusChange(orderId, s)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition text-left border-b border-slate-100 dark:border-white/5 last:border-0 ` + (isSelected ? 'bg-blue-50 dark:bg-white/10 text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-white/5')}
                          >
                            {SIcon && <SIcon size={16} className={sCfg?.color} />}
                            <span>{s}</span>
                            {isSelected && <span className="ml-auto text-[10px] text-blue-600 dark:text-blue-400 font-bold bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded uppercase">Now</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                  className="mt-3 w-full text-center text-xs text-blue-600 dark:text-blue-400 font-bold py-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-lg transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
                >
                  {isExpanded ? 'Hide Details' : 'View Full Details'}
                </button>
              </div>
              
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-4 space-y-5">
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Package size={14} /> Items</h4>
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => {
                        let photo = null;
                        try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                        return (
                          <div key={idx} className="flex items-center gap-3 bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-white/10 shadow-sm">
                            <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-white/5 overflow-hidden flex items-center justify-center shrink-0">
                              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-slate-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.product?.title || 'Unknown'}</p>
                              {item.variants && <p className="text-[11px] font-bold text-slate-500 mt-0.5">{item.variants}</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-black text-slate-900 dark:text-white">৳ {formatPrice(item.price_at_purchase * item.quantity)}</p>
                              <p className="text-[11px] font-bold text-slate-500 mt-0.5">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Truck size={14} /> Shipping</h4>
                    <div className="bg-white dark:bg-brand-surface rounded-lg p-3.5 border border-slate-200 dark:border-white/10 text-[13px] text-slate-700 dark:text-slate-300 space-y-1.5 shadow-sm font-medium">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{addrObj.name || '—'}</p>
                      <p className="font-mono">{order.phone || '—'}</p>
                      <p className="text-slate-600 dark:text-slate-400">{addrObj.upazila || ''}{addrObj.district ? `, ${addrObj.district}` : ''}</p>
                      <p className="leading-snug">{addrObj.details || ''}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-white/10 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total</p>
                      <p className="font-black text-slate-900 dark:text-white text-lg">৳ {formatPrice(total)}</p>
                    </div>
                    <div className="bg-white dark:bg-brand-surface rounded-lg p-3 border border-slate-200 dark:border-white/10 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Due</p>
                      <p className={`font-black text-lg ` + (dueAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400')}>৳ {formatPrice(dueAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-brand-surface rounded-lg p-3.5 border border-slate-200 dark:border-white/10 text-[13px] space-y-2.5 shadow-sm text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">Payment</span><span className="font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">{order.payment_method || 'COD'}</span></div>
                    {order.payment_method === 'bkash_manual' && (
                      <>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">bKash</span><span className="font-mono font-bold text-slate-900 dark:text-white">{order.payment_number}</span></div>
                        <div className="flex justify-between items-center"><span className="text-slate-500 font-bold">TrxID</span><span className="font-mono font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">{order.payment_trx_id}</span></div>
                      </>
                    )}
                    {(order.courier_name || order.tracking_id) && (
                      <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/10 space-y-2">
                        {order.courier_name && <div className="flex justify-between"><span className="text-slate-500 font-bold">Courier</span><span className="font-bold text-slate-900 dark:text-white">{order.courier_name}</span></div>}
                        {order.tracking_id && <div className="flex justify-between"><span className="text-slate-500 font-bold">Tracking</span><span className="font-mono font-bold text-slate-900 dark:text-white">{order.tracking_id}</span></div>}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors shadow-md shadow-blue-500/20"
                  >
                    <FileText size={16} /> Download Invoice
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-xl animate-in slide-in-from-bottom-5 ` + (
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
        )}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} className={toast.type === 'error' ? '' : 'text-green-400 dark:text-green-600'} />}
          {toast.msg}
        </div>
      )}

      {shippingModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-brand-surface border border-slate-200 dark:border-white/10 rounded-xl p-6 relative overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Truck size={22} className="text-blue-500" /> Shipping Details</h3>
              <button onClick={() => setShippingModal({ ...shippingModal, isOpen: false })} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Courier Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={shippingModal.courier}
                  onChange={e => setShippingModal({...shippingModal, courier: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="e.g. Pathao, Steadfast"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Tracking ID <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={shippingModal.tracking}
                  onChange={e => setShippingModal({...shippingModal, tracking: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="e.g. P123456789"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShippingModal({ ...shippingModal, isOpen: false })}
                className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleShippingSubmit}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-md shadow-blue-500/20"
              >
                Save & Ship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

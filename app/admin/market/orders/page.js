"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { ChevronDown, Search, RefreshCw, Package, CheckCircle2, Truck, Home, XCircle, Clock, FileText, Filter, Calendar } from "lucide-react";
import { generateInvoice } from '@/utils/generateInvoice';
import AppleSpinner from "@/components/ui/AppleSpinner";

const STATUS_FLOW = ['Order placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const STATUS_CONFIG = {
  'Order placed': { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', icon: Clock },
  'Confirmed':    { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',   icon: CheckCircle2 },
  'Processing':   { color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: Package },
  'Shipped':      { color: 'text-cyan-400',   bg: 'bg-cyan-500/10 border-cyan-500/30',   icon: Truck },
  'Delivered':    { color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30', icon: Home },
  'Cancelled':    { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',     icon: XCircle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // orderId being updated
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [shippingModal, setShippingModal] = useState({ isOpen: false, orderId: null, courier: '', tracking: '' });
  const [toast, setToast] = useState(null);
  const [activeStatusPicker, setActiveStatusPicker] = useState(null); // orderId whose status picker is open

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
      await api.patch(`/market/orders/${orderId}/status`, { status: newStatus, ...payloadData });
      setOrders(prev => prev.map(o => o.id === orderId || o._id?.toString() === orderId 
        ? { 
            ...o, 
            status: newStatus, 
            confirmed_at: newStatus === 'Confirmed' ? new Date().toISOString() : o.confirmed_at,
            ...payloadData
          }
        : o
      ));
      showToast(`Order status updated to "${newStatus}"`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const handleShippingSubmit = async () => {
    const { orderId, courier, tracking } = shippingModal;
    
    if (!courier.trim() || !tracking.trim()) {
      showToast('Both Courier Name and Tracking ID are required.', 'error');
      return;
    }

    setShippingModal({ isOpen: false, orderId: null, courier: '', tracking: '' });
    
    const payloadData = {
      courier_name: courier.trim(),
      tracking_id: tracking.trim()
    };
    
    await updateStatus(orderId, 'Shipped', payloadData);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) : '—';
  const formatPrice = (p) => new Intl.NumberFormat('en-IN').format(p || 0);

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    
    // Search enhancement
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

    // Date filter
    let matchDate = true;
    if (dateFilter !== 'All') {
      const orderDate = new Date(o.createdAt);
      const now = new Date();
      if (dateFilter === 'Today') {
        matchDate = orderDate.toDateString() === now.toDateString();
      } else if (dateFilter === '7Days') {
        const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
        matchDate = diff <= 7;
      } else if (dateFilter === '30Days') {
        const diff = (now - orderDate) / (1000 * 60 * 60 * 24);
        matchDate = diff <= 30;
      }
    }
    return matchStatus && matchSearch && matchDate;
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 text-blue-400">Order Management</h1>
          <p className="text-gray-400 text-sm">View and update the status of all marketplace orders.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition shrink-0"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {['All', ...STATUS_FLOW, 'Cancelled'].map(status => {
          const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg?.icon || Package;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`p-3 rounded-xl border text-left transition ${
                filterStatus === status 
                  ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                  : 'bg-gray-900 border-gray-800 hover:border-gray-700 text-gray-400'
              }`}
            >
              <div className="text-2xl font-bold mb-1">{count}</div>
              <div className="text-xs truncate">{status}</div>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, Phone, Name, or Tracking ID..."
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div className="shrink-0 relative">
          <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <select 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="appearance-none bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-blue-500 transition outline-none cursor-pointer"
          >
            <option value="All">All Time</option>
            <option value="Today">Today</option>
            <option value="7Days">Last 7 Days</option>
            <option value="30Days">Last 30 Days</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-gray-900 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-950 text-gray-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="p-4 font-medium border-b border-gray-800">Order ID</th>
              <th className="p-4 font-medium border-b border-gray-800">Customer</th>
              <th className="p-4 font-medium border-b border-gray-800">Date</th>
              <th className="p-4 font-medium border-b border-gray-800">Items</th>
              <th className="p-4 font-medium border-b border-gray-800">Total</th>
              <th className="p-4 font-medium border-b border-gray-800">Status</th>
              <th className="p-4 font-medium border-b border-gray-800">Update Status</th>
              <th className="p-4 font-medium border-b border-gray-800 text-center">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="p-16 text-center text-gray-500">
                  <AppleSpinner className="animate-spin mx-auto mb-3" />
                  <p className="text-sm">Loading orders...</p>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-16 text-center text-gray-500">
                  <Package size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No orders found.</p>
                </td>
              </tr>
            ) : filtered.map(order => {
              const orderId = order.id || order._id?.toString();
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order placed'];
              const Icon = cfg.icon;
              const itemsPrice = (order.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
              const total = itemsPrice + Math.round(itemsPrice * 0.01);
              const isExpanded = expandedOrder === orderId;

              const isPaid = order.status === 'Delivered';
              const dueAmount = isPaid || order.status === 'Cancelled' ? 0 : total;
              const timeSinceOrder = Math.floor((new Date() - new Date(order.createdAt)) / (1000 * 60 * 60 * 24));

              let addrObj = {};
              try { addrObj = typeof order.address === 'string' ? JSON.parse(order.address) : order.address; } catch(e) {}

              return (
                <React.Fragment key={orderId}>
                  <tr className={`border-b border-gray-800/50 hover:bg-gray-800/20 transition ${isExpanded ? 'bg-gray-800/30' : ''}`}>
                    {/* Order ID */}
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-300">#{orderId?.slice(-8).toUpperCase()}</span>
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div className="text-sm text-gray-200">{addrObj.name || '—'}</div>
                      <div className="text-xs text-gray-500">{order.phone || '—'}</div>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>

                    {/* Items count */}
                    <td className="p-4 text-sm text-gray-300">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>

                    {/* Total */}
                    <td className="p-4 font-bold text-white text-sm">
                      ৳ {formatPrice(total)}
                    </td>

                    {/* Current Status Badge */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
                        <Icon size={12} />
                        {order.status}
                      </span>
                    </td>

                    {/* Update Status Dropdown */}
                    <td className="p-4">
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(orderId, e.target.value)}
                          disabled={updating === orderId}
                          className="appearance-none w-full bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition cursor-pointer disabled:opacity-50"
                        >
                          {[...STATUS_FLOW, 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                          {updating === orderId 
                            ? <AppleSpinner size={14} className="animate-spin" />
                            : <ChevronDown size={14} />
                          }
                        </div>
                      </div>
                    </td>

                    {/* Expand Details */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Details Row */}
                  {isExpanded && (
                    <tr className="border-b border-gray-800">
                      <td colSpan="8" className="px-6 py-5 bg-gray-950/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Products */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Ordered Items</h4>
                            <div className="space-y-2">
                              {(order.items || []).map((item, idx) => {
                                let photo = null;
                                try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                                return (
                                  <div key={idx} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800">
                                    <div className="w-10 h-10 rounded-md bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                                      {photo 
                                        ? <img src={photo} alt="" className="w-full h-full object-cover" />
                                        : <Package size={16} className="text-gray-600" />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-gray-200 truncate">{item.product?.title || 'Unknown'}</p>
                                      {item.variants && <p className="text-xs text-gray-500">({item.variants})</p>}
                                      {item.product?.warranty_info && (
                                        <p className="text-[10px] text-emerald-400 mt-1 font-mono">Warranty: {item.product.warranty_info}</p>
                                      )}
                                    </div>
                                    <div className="text-right shrink-0">
                                      <p className="text-sm font-bold text-white">৳ {formatPrice(item.price_at_purchase * item.quantity)}</p>
                                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Shipping Address */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping Address</h4>
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-sm space-y-1 text-gray-300">
                              <p className="font-semibold text-white">{addrObj.name || '—'}</p>
                              <p>{order.phone || '—'}</p>
                              <p>{addrObj.upazila || ''}{addrObj.district ? `, ${addrObj.district}` : ''}</p>
                              <p>{addrObj.details || ''}</p>
                            </div>

                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2">Order Summary</h4>
                            <div className="bg-gray-900 rounded-lg p-4 border border-gray-800 text-sm space-y-2">
                              <div className="flex justify-between text-gray-400">
                                <span>Items Price</span><span>৳ {formatPrice(itemsPrice)}</span>
                              </div>
                              <div className="flex justify-between text-gray-400">
                                <span>COD Charge (1%)</span><span>৳ {formatPrice(Math.round(itemsPrice * 0.01))}</span>
                              </div>
                              <div className="flex justify-between font-bold text-white border-t border-gray-800 pt-2">
                                <span>Total</span><span>৳ {formatPrice(total)}</span>
                              </div>
                              <div className={`flex justify-between font-bold ${dueAmount > 0 ? 'text-orange-400' : 'text-emerald-400'} pt-1`}>
                                <span>Due Amount</span><span>৳ {formatPrice(dueAmount)}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-800/50 space-y-1.5 text-[11px] text-gray-400 font-mono">
                              <p className="flex justify-between"><span>Time Elapsed:</span> <span className="text-gray-300">{timeSinceOrder === 0 ? 'Ordered today' : `${timeSinceOrder} days ago`}</span></p>
                              {order.confirmed_at && <p className="flex justify-between"><span>Confirmed On:</span> <span className="text-gray-300">{formatDate(order.confirmed_at)}</span></p>}
                              {order.courier_name && <p className="flex justify-between"><span>Courier:</span> <span className="text-white bg-gray-800 px-1.5 py-0.5 rounded">{order.courier_name}</span></p>}
                              {order.tracking_id && <p className="flex justify-between"><span>Tracking ID:</span> <span className="text-white bg-gray-800 px-1.5 py-0.5 rounded">{order.tracking_id}</span></p>}
                            </div>

                            <button 
                              onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                              className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
                            >
                              <FileText size={16} /> Generate Invoice
                            </button>
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

      {/* Mobile Card List */}
      <div className="md:hidden flex flex-col gap-3 mt-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center text-gray-500">
            <AppleSpinner className="animate-spin mb-2" />
            <span className="text-sm">Loading orders...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Package size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No orders found.</p>
          </div>
        ) : filtered.map(order => {
          const orderId = order.id || order._id?.toString();
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Order placed'];
          const Icon = cfg.icon;
          const itemsPrice = (order.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
          const total = itemsPrice + Math.round(itemsPrice * 0.01);
          const isExpanded = expandedOrder === orderId;
          const dueAmount = order.status === 'Delivered' || order.status === 'Cancelled' ? 0 : total;
          let addrObj = {};
          try { addrObj = typeof order.address === 'string' ? JSON.parse(order.address) : order.address; } catch(e) {}

          return (
            <div key={orderId} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Card Header */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-xs text-gray-400">#{orderId?.slice(-8).toUpperCase()}</span>
                    <p className="font-semibold text-gray-100 mt-0.5">{addrObj.name || '—'}</p>
                    <p className="text-xs text-gray-500">{order.phone || '—'}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border shrink-0 ${cfg.bg} ${cfg.color}`}>
                    <Icon size={10} />{order.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">{order.items?.length || 0} item(s) · {formatDate(order.createdAt)}</p>
                    <p className="font-bold text-white mt-0.5">BDT {formatPrice(total)}</p>
                  </div>
                </div>

                {/* Update Status */}
                <div className="mt-3">
                  <button
                    onClick={() => setActiveStatusPicker(activeStatusPicker === orderId ? null : orderId)}
                    disabled={updating === orderId}
                    className="w-full flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white transition disabled:opacity-50"
                  >
                    <span>Change Status: <span className="text-blue-300 font-semibold">{order.status}</span></span>
                    {updating === orderId
                      ? <AppleSpinner size={14} className="animate-spin" />
                      : <ChevronDown size={14} className={`transition-opacity duration-200 ${activeStatusPicker === orderId ? 'rotate-180' : ''}`} />
                    }
                  </button>
                  {activeStatusPicker === orderId && (
                    <div className="mt-1 bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-xl">
                      {[...STATUS_FLOW, 'Cancelled'].map(s => {
                        const sCfg = STATUS_CONFIG[s];
                        const SIcon = sCfg?.icon;
                        const isSelected = order.status === s;
                        return (
                          <button
                            key={s}
                            onClick={() => {
                              setActiveStatusPicker(null);
                              handleStatusChange(orderId, s);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition text-left border-b border-gray-700/50 last:border-0 ${isSelected ? 'bg-blue-600/20 text-white font-semibold' : 'text-gray-300 hover:bg-gray-700'}`}
                          >
                            {SIcon && <SIcon size={14} className={sCfg?.color} />}
                            <span>{s}</span>
                            {isSelected && <span className="ml-auto text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">CURRENT</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setExpandedOrder(isExpanded ? null : orderId)}
                  className="mt-3 w-full text-center text-xs text-blue-400 font-medium py-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20"
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Expanded Mobile Details */}
              {isExpanded && (
                <div className="border-t border-gray-800 p-4 bg-gray-950/50 space-y-4">
                  {/* Items */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Ordered Items</h4>
                    <div className="space-y-2">
                      {(order.items || []).map((item, idx) => {
                        let photo = null;
                        try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                        return (
                          <div key={idx} className="flex items-center gap-3 bg-gray-900 rounded-lg p-3 border border-gray-800">
                            <div className="w-10 h-10 rounded-md bg-gray-800 overflow-hidden flex items-center justify-center shrink-0">
                              {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : <Package size={14} className="text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-200 truncate">{item.product?.title || 'Unknown'}</p>
                              {item.variants && <p className="text-xs text-gray-500">({item.variants})</p>}
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-white">BDT {formatPrice(item.price_at_purchase * item.quantity)}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</h4>
                    <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 text-sm text-gray-300 space-y-1">
                      <p className="font-semibold text-white">{addrObj.name || '—'}</p>
                      <p>{order.phone || '—'}</p>
                      <p>{addrObj.upazila || ''}{addrObj.district ? `, ${addrObj.district}` : ''}</p>
                      <p>{addrObj.details || ''}</p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-900 rounded-lg p-3 border border-gray-800 text-sm space-y-2">
                    <div className="flex justify-between text-gray-400"><span>Items Price</span><span>BDT {formatPrice(itemsPrice)}</span></div>
                    <div className="flex justify-between text-gray-400"><span>COD Charge (1%)</span><span>BDT {formatPrice(Math.round(itemsPrice * 0.01))}</span></div>
                    <div className="flex justify-between font-bold text-white border-t border-gray-800 pt-2"><span>Total</span><span>BDT {formatPrice(total)}</span></div>
                    <div className={`flex justify-between font-bold ${dueAmount > 0 ? 'text-orange-400' : 'text-emerald-400'}`}><span>Due Amount</span><span>BDT {formatPrice(dueAmount)}</span></div>
                  </div>

                  {order.courier_name && <p className="text-xs text-gray-400">Courier: <span className="text-white font-mono">{order.courier_name}</span></p>}
                  {order.tracking_id && <p className="text-xs text-gray-400">Tracking: <span className="text-white font-mono">{order.tracking_id}</span></p>}

                  <button
                    onClick={(e) => { e.stopPropagation(); generateInvoice(order); }}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl transition-all"
                  >
                    <FileText size={16} /> Generate Invoice
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl text-sm font-semibold shadow-xl flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Shipping Details Modal */}
      {shippingModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Truck size={20} className="text-cyan-400" /> Shipping Details</h3>
              <button onClick={() => setShippingModal({ ...shippingModal, isOpen: false })} className="text-gray-500 hover:text-gray-300 transition">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Courier Name <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={shippingModal.courier}
                  onChange={e => setShippingModal({...shippingModal, courier: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition placeholder-gray-700"
                  placeholder="e.g. Pathao, Steadfast"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Tracking ID <span className="text-red-400">*</span></label>
                <input 
                  type="text" 
                  value={shippingModal.tracking}
                  onChange={e => setShippingModal({...shippingModal, tracking: e.target.value})}
                  className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-white text-sm focus:border-cyan-500 focus:outline-none transition placeholder-gray-700"
                  placeholder="e.g. P123456789"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setShippingModal({ ...shippingModal, isOpen: false })}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold text-sm transition border border-gray-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleShippingSubmit}
                className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-semibold text-sm transition shadow-[0_0_15px_rgba(8,145,178,0.4)]"
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

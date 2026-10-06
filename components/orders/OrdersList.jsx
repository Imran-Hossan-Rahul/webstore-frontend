"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Image as ImageIcon, Copy, Eye, FileText, ShoppingBag, Package, Briefcase, Filter, ArrowUpDown } from "lucide-react";
import { api } from '@/utils/api';
import { generateInvoice } from '@/utils/generateInvoice';
import AppleSpinner from "@/components/ui/AppleSpinner";
import { useUser } from '@/context/UserContext';

const STATUS_STYLE = {
  'Order placed': 'bg-yellow-50 text-[#1d1d1f] border-yellow-200',
  'Confirmed':    'bg-brand-sky text-[#1d1d1f] border-blue-200',
  'Processing':   'bg-purple-50 text-[#1d1d1f] border-purple-200',
  'Shipped':      'bg-cyan-50 text-[#1d1d1f] border-cyan-200',
  'Delivered':    'bg-green-50 text-[#1d1d1f] border-green-200',
  'Cancelled':    'bg-red-50 text-[#1d1d1f] border-red-200',
};

const ITEMS_PER_PAGE = 10;

export default function OrdersList({ isEmbedded = false, isProjectsMode = false }) {
  const { user, isGuest } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  
  // Track Order States
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackQuery) return;
    setTrackError('');
    setTrackLoading(true);
    try {
      const res = await api.post('/market/orders/guest/track', { query: trackQuery });
      const fetchedOrders = res.data || res;
      if (Array.isArray(fetchedOrders) && fetchedOrders.length > 0) {
        // Save to local storage
        try {
          const storedIds = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
          let updated = false;
          fetchedOrders.forEach(o => {
            const id = o._id || o.id;
            if (!storedIds.includes(id)) {
              storedIds.push(id);
              updated = true;
            }
          });
          if (updated) {
            localStorage.setItem('codalina_guest_orders', JSON.stringify(storedIds));
          }
        } catch (err) {}
        
        // Show only the fetched orders
        setOrders(fetchedOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      setTrackError(err?.data?.error || err?.response?.data?.error || 'No orders found matching this ID or Phone Number.');
    } finally {
      setTrackLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    setLoading(true);
    try {
      let data = [];
      if (user) {
        data = await api.get('/market/orders');
      } else {
        // Guest flow
        const storedIds = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
        if (storedIds.length > 0) {
          data = await api.post('/market/orders/guest/list', { ids: storedIds });
        }
      }
      
      if (Array.isArray(data)) {
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, [user]);

  const formatPrice = (p) => new Intl.NumberFormat('en-IN').format(p || 0);
  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    }).replace(/,/g, '');
  };

  const copyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = orders.filter(o => {
    if (isProjectsMode) {
      const isPaid = o.payment_status === 'Verified' || o.status === 'Completed' || o.status === 'Delivered';
      if (!isPaid) return false;
    }

    if (statusFilter !== 'All') {
      const status = o.status || 'Order placed';
      if (status !== statusFilter) return false;
    }

    if (!search) return true;
    const oid = (o.id || o._id?.toString() || '').toLowerCase();
    return oid.includes(search.toLowerCase()) || (o.phone || '').includes(search);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'Oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    const totalA = (a.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
    const totalB = (b.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
    if (sortBy === 'Highest Amount') return totalB - totalA;
    if (sortBy === 'Lowest Amount') return totalA - totalB;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className={isEmbedded ? "w-full font-sans" : "min-h-screen pb-24 md:pb-0 bg-transparent font-sans"}>
      <div className={isEmbedded ? "w-full" : "w-full md:pb-2"}>
        
        {/* Header / Filters */}
        <div className={`mb-4 md:mb-6 ${!isEmbedded ? 'bg-white/40 backdrop-blur-md rounded-[20px] border border-brand-navy/[0.08] p-4 md:p-6 shadow-sm' : ''}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            {!isEmbedded && (
              <h1 className="text-[18px] md:text-[20px] font-display font-medium text-brand-navy flex items-center gap-2">
                {isProjectsMode ? <Briefcase size={22} className="text-brand-navy" /> : <Package size={22} className="text-brand-navy" />}
                {isProjectsMode ? 'My Projects' : 'My Orders'}
              </h1>
            )}
            
            <div className="flex flex-col md:flex-row gap-3 w-full flex-1">
              {/* Search */}
              <div className="relative w-full flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search..."
                  className="pl-8 pr-4 py-2 text-[13px] font-sans border border-brand-navy/[0.08] rounded-[12px] bg-white/60 text-brand-navy focus:outline-none focus:border-brand-navy w-full transition-all placeholder:text-slate-400"
                />
              </div>
              
              {/* Filter */}
              {!isProjectsMode && (
                <div className="relative w-full flex-1">
                  <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    className="pl-8 pr-8 py-2 text-[13px] font-sans border border-brand-navy/[0.08] rounded-[12px] bg-white/60 text-brand-navy focus:outline-none focus:border-brand-navy w-full transition-all appearance-none cursor-pointer"
                  >
                    <option value="All">All Status</option>
                    <option value="Order placed">Order placed</option>
                    <option value="Pending Verification">Pending Verification</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Delivered">Delivered Digitally</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              {/* Sort */}
              <div className="relative w-full flex-1">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => { setSortBy(e.target.value); setPage(1); }}
                  className="pl-8 pr-8 py-2 text-[13px] font-sans border border-brand-navy/[0.08] rounded-[12px] bg-white/60 text-brand-navy focus:outline-none focus:border-brand-navy w-full transition-all appearance-none cursor-pointer"
                >
                  <option value="Newest">Newest First</option>
                  <option value="Oldest">Oldest First</option>
                  <option value="Highest Amount">Highest Amount</option>
                  <option value="Lowest Amount">Lowest Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Track Order UI */}
        {!user && (
          <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[20px] p-6 mb-6 shadow-sm">
            <h3 className="text-[16px] font-display font-medium text-brand-navy mb-2 flex items-center">
              {isProjectsMode ? <Briefcase className="w-5 h-5 mr-2 text-brand-blue" /> : <Package className="w-5 h-5 mr-2 text-brand-blue" />}
              {isProjectsMode ? 'Track Your Project' : 'Track Your Order'}
            </h3>
            <p className="text-[13px] font-sans text-slate-500  mb-4">
              If you are not logged in and forgot or didn't see your order, enter your Phone Number or Order ID below to track it.
            </p>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  value={trackQuery}
                  onChange={(e) => {
                    setTrackQuery(e.target.value);
                    if (e.target.value === '') {
                      fetchRecentOrders();
                    }
                  }}
                  placeholder="Enter Phone Number or Order ID..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-[12px] bg-white/60 border border-brand-navy/[0.08] focus:outline-none focus:border-brand-navy text-[13px] font-sans text-brand-navy transition-all placeholder:text-slate-400"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={trackLoading}
                className="bg-brand-navy hover:bg-brand-blue text-white px-6 py-2.5 rounded-[12px] text-[13px] font-sans font-medium transition-colors disabled:opacity-70 flex items-center justify-center shrink-0"
              >
                {trackLoading ? <AppleSpinner size={16} className="text-white " /> : 'Track Order'}
              </button>
            </form>
            {trackError && <p className="text-red-500 text-xs mt-2">{trackError}</p>}
          </div>
        )}


        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <AppleSpinner className="animate-spin mb-3 text-brand-blue" />
            <p className="text-[14px] font-sans">Loading your orders...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            {isProjectsMode ? <Briefcase size={40} className="mb-3 opacity-30" /> : <ShoppingBag size={40} className="mb-3 opacity-30" />}
            <p className="text-[14px] font-sans font-medium">{isProjectsMode ? 'No projects found' : 'No orders found'}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-brand-blue text-[14px] font-sans hover:underline"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {paginated.map(order => {
              const oid = order.id?.toString() || order._id?.toString();
              const shortId = oid?.slice(-8).toUpperCase();
              const itemsPrice = (order.items || []).reduce((s, i) => s + (i.price_at_purchase * i.quantity), 0);
              const total = itemsPrice + Math.round(itemsPrice * 0.01);
              const statusStyle = STATUS_STYLE[order.status] || STATUS_STYLE['Order placed'];

              return (
                <div
                  key={oid}
                  onClick={() => router.push(`/orders/${oid}`)}
                  className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] rounded-[20px] overflow-hidden cursor-pointer hover:border-brand-blue/30 transition-all duration-300 group shadow-sm"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border-b border-slate-100 ">
                    {/* Left: ID + date */}
                    <div className="flex justify-between items-start md:block w-full md:w-auto mb-3 md:mb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                          <span className="text-[15px] font-mono font-medium text-brand-navy  uppercase truncate" title={`Order #WA${shortId}`}>
                            Order #WA{shortId}
                          </span>
                          <button
                            onClick={e => copyId(e, `WA${shortId}`)}
                            className="text-slate-400 hover:text-brand-blue transition-colors shrink-0"
                            title="Copy Order Number"
                          >
                            <Copy size={14} />
                          </button>
                          {copiedId === `WA${shortId}` && (
                            <span className="font-mono text-[10px] text-brand-teal font-medium bg-brand-teal/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Copied</span>
                          )}
                        </div>
                        <p className="text-[12px] font-sans text-slate-500 ">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      {/* Status Badges on Mobile (Top Right) */}
                      <div className="md:hidden flex flex-col items-end gap-1.5">
                        <span className={`font-mono text-[10px] font-medium px-2 py-1 rounded-[4px] uppercase tracking-widest ${statusStyle}`}>
                          {order.status || 'Order placed'}
                        </span>
                        {order.projectPhase && order.projectPhase !== 'Not applicable' && (
                          <span className="font-mono text-[9px] font-medium px-1.5 py-0.5 rounded-[4px] uppercase tracking-widest bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                            {order.projectPhase}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: total + actions (Desktop Status is here too) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                        <span className="font-mono text-[10px] text-slate-500  md:hidden uppercase tracking-widest font-medium">Total Amount</span>
                        <span className="text-[16px] font-mono font-semibold text-brand-navy ">
                          BDT {formatPrice(total)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2">
                          {order.projectPhase && order.projectPhase !== 'Not applicable' && (
                            <span className="font-mono text-[10px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-[4px] bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                              Phase: {order.projectPhase}
                            </span>
                          )}
                          <span className={`font-mono text-[11px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-[4px] ${statusStyle}`}>
                            {order.status || 'Order placed'}
                          </span>
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/orders/${oid}`); }}
                          className="p-2 rounded-[4px] bg-transparent  hover:bg-slate-200   border border-brand-navy/[0.08]  text-slate-500  hover:text-brand-navy  transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); generateInvoice(order); }}
                          className="p-2 rounded-[4px] bg-transparent  hover:bg-slate-200   border border-brand-navy/[0.08]  text-slate-500  hover:text-brand-navy  transition-colors"
                          title="Download Invoice"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-2 md:p-4 bg-transparent ">
                    {(order.items || []).map((item, idx) => {
                      let photo = null;
                      try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 px-2 py-2 md:px-4 md:py-3 border-b border-brand-navy/[0.08]  last:border-b-0"
                        >
                          {/* Product image */}
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[12px] bg-white/60 backdrop-blur-md border border-brand-navy/[0.08] overflow-hidden flex items-center justify-center shrink-0 p-1">
                            {photo
                              ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply " />
                              : <ImageIcon size={20} className="text-slate-300" strokeWidth={1.5} />
                            }
                          </div>

                          {/* Title + variants + qty */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] md:text-[15px] font-sans font-medium text-brand-navy  line-clamp-1 group-hover:text-brand-blue transition-colors">
                              {item.product?.title || 'Unknown Product'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-medium text-brand-navy  bg-white/60 backdrop-blur-md  border border-brand-navy/[0.08]  px-1.5 py-0.5 rounded-[4px]">Qty: {item.quantity}</span>
                              {item.variants && (
                                <span className="text-[12px] font-mono text-slate-500  truncate">({item.variants})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div className="mt-6 pt-4 border-t border-brand-navy/[0.08] ">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-[13px] font-mono text-slate-500  hover:text-brand-navy  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-[13px] font-mono rounded-[4px] font-medium transition-colors ${
                      p === page
                        ? 'bg-brand-navy  text-white '
                        : 'text-slate-500  hover:bg-slate-200  :bg-white/60 backdrop-blur-md/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-[13px] font-mono text-slate-500  hover:text-brand-navy  disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next ›
              </button>
            </div>
            <p className="text-center text-[11px] font-mono text-slate-400 mt-4 tracking-widest uppercase">
              Total {filtered.length} order{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}




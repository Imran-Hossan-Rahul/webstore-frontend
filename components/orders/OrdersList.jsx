"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Image as ImageIcon, Copy, Eye, FileText, ShoppingBag, Package } from "lucide-react";
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

export default function OrdersList({ isEmbedded = false }) {
  const { user, isGuest } = useUser();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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
    if (!search) return true;
    const oid = (o.id || o._id?.toString() || '').toLowerCase();
    return oid.includes(search.toLowerCase()) || (o.phone || '').includes(search);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className={isEmbedded ? "w-full font-sans" : "min-h-screen pb-24 md:pb-0 bg-transparent font-sans"}>
      <div className={isEmbedded ? "w-full" : "w-full md:pb-2"}>
        
        {/* Header */}
        {!isEmbedded && (
          <div className="bg-white dark:bg-[#161B22] rounded-[4px] border border-slate-200 dark:border-white/10 p-4 md:p-6 mb-4 md:mb-6 shadow-sm dark:shadow-none">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-[18px] md:text-[20px] font-display font-medium text-brand-navy dark:text-white flex items-center gap-2">
                <Package size={22} className="text-brand-navy dark:text-white" /> My Orders
              </h1>
              <div className="relative w-full sm:w-auto">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search orders..."
                  className="pl-9 pr-4 py-2 text-[14px] font-sans border border-slate-300 dark:border-white/20 rounded-[4px] bg-brand-cloud dark:bg-[#0D1117] text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 w-full sm:w-64 transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Guest Track Order UI */}
        {!user && (
          <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] p-6 mb-6 shadow-sm dark:shadow-none">
            <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-2 flex items-center">
              <Package className="w-5 h-5 mr-2 text-brand-blue" />
              Track Your Order
            </h3>
            <p className="text-[13px] font-sans text-slate-500 mb-4">
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
                  className="w-full pl-9 pr-4 py-2.5 rounded-[4px] bg-brand-cloud dark:bg-[#0D1117] border border-slate-300 dark:border-white/20 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 text-[13px] font-sans text-brand-navy dark:text-white transition-all placeholder:text-slate-400"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={trackLoading}
                className="bg-brand-navy dark:bg-white hover:opacity-90 text-white dark:text-brand-navy px-6 py-2.5 rounded-[4px] text-[13px] font-sans font-medium transition-opacity disabled:opacity-70 flex items-center justify-center shrink-0"
              >
                {trackLoading ? <AppleSpinner size={16} className="text-white dark:text-brand-navy" /> : 'Track Order'}
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
            <ShoppingBag size={40} className="mb-3 opacity-30" />
            <p className="text-[14px] font-sans font-medium">No orders found</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-brand-blue text-[14px] font-sans hover:underline"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
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
                  className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] overflow-hidden cursor-pointer hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 group shadow-sm dark:shadow-none"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border-b border-slate-100 dark:border-white/5">
                    {/* Left: ID + date */}
                    <div className="flex justify-between items-start md:block w-full md:w-auto mb-3 md:mb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                          <span className="text-[15px] font-mono font-medium text-brand-navy dark:text-white uppercase truncate" title={`Order #WA${shortId}`}>
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
                        <p className="text-[12px] font-sans text-slate-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      {/* Status Badge on Mobile (Top Right) */}
                      <span className={`md:hidden font-mono text-[10px] font-medium px-2 py-1 rounded-[4px] uppercase tracking-widest ${statusStyle}`}>
                        {order.status || 'Order placed'}
                      </span>
                    </div>

                    {/* Right: total + actions (Desktop Status is here too) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                        <span className="font-mono text-[10px] text-slate-500 md:hidden uppercase tracking-widest font-medium">Total Amount</span>
                        <span className="text-[16px] font-mono font-semibold text-brand-navy dark:text-white">
                          BDT {formatPrice(total)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`hidden md:block font-mono text-[11px] font-medium tracking-widest uppercase px-2.5 py-1 rounded-[4px] ${statusStyle}`}>
                          {order.status || 'Order placed'}
                        </span>

                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/orders/${oid}`); }}
                          className="p-2 rounded-[4px] bg-brand-cloud dark:bg-[#0D1117] hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); generateInvoice(order); }}
                          className="p-2 rounded-[4px] bg-brand-cloud dark:bg-[#0D1117] hover:bg-slate-200 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
                          title="Download Invoice"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-2 md:p-4 bg-brand-cloud dark:bg-[#0D1117]">
                    {(order.items || []).map((item, idx) => {
                      let photo = null;
                      try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 px-2 py-2 md:px-4 md:py-3 border-b border-slate-200 dark:border-white/5 last:border-b-0"
                        >
                          {/* Product image */}
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[4px] bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center shrink-0 p-1">
                            {photo
                              ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                              : <ImageIcon size={20} className="text-slate-300" strokeWidth={1.5} />
                            }
                          </div>

                          {/* Title + variants + qty */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] md:text-[15px] font-sans font-medium text-brand-navy dark:text-white line-clamp-1 group-hover:text-brand-blue transition-colors">
                              {item.product?.title || 'Unknown Product'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] font-mono font-medium text-brand-navy dark:text-white bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 px-1.5 py-0.5 rounded-[4px]">Qty: {item.quantity}</span>
                              {item.variants && (
                                <span className="text-[12px] font-mono text-slate-500 truncate">({item.variants})</span>
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
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-[13px] font-mono text-slate-500 hover:text-brand-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
                        ? 'bg-brand-navy dark:bg-white text-white dark:text-brand-navy'
                        : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-[13px] font-mono text-slate-500 hover:text-brand-navy dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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

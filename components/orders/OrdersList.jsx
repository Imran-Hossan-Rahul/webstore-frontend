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
  'Confirmed':    'bg-blue-50 text-[#1d1d1f] border-blue-200',
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
        
        // Merge with existing orders
        setOrders(prev => {
          const newOrders = [...prev];
          fetchedOrders.forEach(fo => {
            const id = fo._id || fo.id;
            if (!newOrders.find(o => (o._id || o.id) === id)) {
              newOrders.push(fo);
            }
          });
          return newOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
        setTrackQuery('');
      }
    } catch (err) {
      setTrackError(err?.data?.error || err?.response?.data?.error || 'No orders found matching this ID or Phone Number.');
    } finally {
      setTrackLoading(false);
    }
  };

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, []);

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
    <div className={isEmbedded ? "w-full" : "min-h-screen pb-24 md:pb-0 bg-[#fafafa] dark:bg-slate-950"}>
      <div className={isEmbedded ? "w-full" : "w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3"}>
        
        {/* Header */}
        {!isEmbedded && (
          <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Package size={24} className="text-[#111827]" /> My Orders
              </h1>
              <div className="relative w-full sm:w-auto">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 hover:bg-gray-100 focus:bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-full sm:w-64 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Guest Track Order UI */}
        {!user && (
          <div className="bg-white dark:bg-apple-surfaceDark border border-apple-hairline rounded-[16px] p-6 mb-6">
            <h3 className="text-[15px] font-semibold text-[#1d1d1f] dark:text-white mb-2 flex items-center">
              <Package className="w-5 h-5 mr-2 text-[#0071e3]" />
              Track Your Order
            </h3>
            <p className="text-[13px] text-[#86868b] mb-4">
              If you are not logged in and forgot or didn't see your order, enter your Phone Number or Order ID below to track it.
            </p>
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Phone Number or Order ID..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-[10px] bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1c1c1e] text-[13px] text-[#1d1d1f] dark:text-white outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={trackLoading}
                className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-6 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors disabled:opacity-70 flex items-center justify-center shrink-0"
              >
                {trackLoading ? <AppleSpinner size={16} className="text-white" /> : 'Track Order'}
              </button>
            </form>
            {trackError && <p className="text-red-500 text-xs mt-2">{trackError}</p>}
          </div>
        )}


        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <AppleSpinner className="animate-spin mb-3" />
            <p className="text-sm">Loading your orders...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <ShoppingBag size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders found</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 text-[#111827] text-sm hover:underline"
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
                  className="bg-apple-parchment dark:bg-apple-surfaceDark border border-apple-hairline rounded-[16px] overflow-hidden cursor-pointer hover:border-gray-400 transition-all duration-300 group"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-white/5">
                    {/* Left: ID + date */}
                    <div className="flex justify-between items-start md:block w-full md:w-auto mb-3 md:mb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">
                            Order #{shortId}
                          </span>
                          <button
                            onClick={e => copyId(e, oid)}
                            className="text-gray-400 hover:text-gray-700 transition"
                            title="Copy full Order ID"
                          >
                            <Copy size={14} />
                          </button>
                          {copiedId === oid && (
                            <span className="font-text text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-[0.06em]">Copied</span>
                          )}
                        </div>
                        <p className="text-[12px] font-normal tracking-[-0.01em] text-[#86868b]">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      {/* Status Badge on Mobile (Top Right) */}
                      <span className={`md:hidden font-text text-[10px] font-semibold px-2 py-1 rounded uppercase tracking-[0.06em] ${statusStyle}`}>
                        {order.status || 'Order placed'}
                      </span>
                    </div>

                    {/* Right: total + actions (Desktop Status is here too) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                        <span className="font-text text-[10px] text-[#86868b] md:hidden uppercase tracking-[0.06em] font-semibold">Total Amount</span>
                        <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">
                          {formatPrice(total)} BDT
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`hidden md:block font-text text-[10px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1.5 rounded-full ${statusStyle}`}>
                          {order.status || 'Order placed'}
                        </span>

                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/orders/${oid}`); }}
                          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-blue-600 transition"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); generateInvoice(order); }}
                          className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-blue-600 transition"
                          title="Download Invoice"
                        >
                          <FileText size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="p-2 md:p-4 bg-[#f8f9fa] dark:bg-slate-800/30">
                    {(order.items || []).map((item, idx) => {
                      let photo = null;
                      try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-4 px-2 py-2 md:px-4 md:py-3 border-b border-gray-200/50 dark:border-white/5 last:border-b-0"
                        >
                          {/* Product image */}
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-[10px] bg-white border border-slate-100 dark:border-[#2c2c2e] overflow-hidden flex items-center justify-center shrink-0 p-1">
                            {photo
                              ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                              : <ImageIcon size={20} className="text-gray-300" strokeWidth={1.5} />
                            }
                          </div>

                          {/* Title + variants + qty */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] md:text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white line-clamp-1 group-hover:text-[#0066cc] transition-colors">
                              {item.product?.title || 'Unknown Product'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[12px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-white bg-white border border-[#d2d2d7] px-1.5 py-0.5 rounded shadow-sm">Qty: {item.quantity}</span>
                              {item.variants && (
                                <span className="text-[12px] font-normal tracking-[-0.01em] text-[#86868b] truncate">({item.variants})</span>
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
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/10">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ‹ Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-sm rounded font-medium transition ${
                      p === page
                        ? 'bg-[#111827] text-white'
                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next ›
              </button>
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-2">
              Total {filtered.length} order{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

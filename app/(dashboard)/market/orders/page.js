"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Image as ImageIcon, Copy, Eye, FileText, Loader2, ShoppingBag, Package } from 'lucide-react';
import { api } from '@/utils/api';
import { generateInvoice } from '@/utils/generateInvoice';

const STATUS_STYLE = {
  'Order placed': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Confirmed':    'bg-blue-50 text-blue-700 border-blue-200',
  'Processing':   'bg-purple-50 text-purple-700 border-purple-200',
  'Shipped':      'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Delivered':    'bg-green-50 text-green-700 border-green-200',
  'Cancelled':    'bg-red-50 text-red-700 border-red-200',
};

const ITEMS_PER_PAGE = 10;

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.get('/market/orders');
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
    <div className="min-h-screen pb-24 md:pb-0 bg-[#fafafa] dark:bg-slate-950">
      <div className="max-w-[1200px] mx-auto py-2 md:py-8 px-3 sm:px-6 lg:px-8 -mt-4 md:mt-0">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6">
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

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 size={28} className="animate-spin mb-3" />
            <p className="text-sm">Loading your orders...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <ShoppingBag size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">No orders found</p>
            <button
              onClick={() => router.push('/market')}
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
                  onClick={() => router.push(`/market/orders/${oid}`)}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-gray-400 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Order Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-5 border-b border-gray-100 dark:border-white/5">
                    {/* Left: ID + date */}
                    <div className="flex justify-between items-start md:block w-full md:w-auto mb-3 md:mb-0">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
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
                            <span className="text-[10px] text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Copied</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      
                      {/* Status Badge on Mobile (Top Right) */}
                      <span className={`md:hidden text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${statusStyle}`}>
                        {order.status || 'Order placed'}
                      </span>
                    </div>

                    {/* Right: total + actions (Desktop Status is here too) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto mt-2 md:mt-0">
                      <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-4">
                        <span className="text-[10px] text-gray-400 md:hidden uppercase tracking-wider font-bold">Total Amount</span>
                        <span className="text-base font-black text-blue-600 md:text-gray-900">
                          {formatPrice(total)} BDT
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`hidden md:block text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded ${statusStyle}`}>
                          {order.status || 'Order placed'}
                        </span>

                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/market/orders/${oid}`); }}
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
                          <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                            {photo
                              ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                              : <ImageIcon size={20} className="text-gray-300" strokeWidth={1.5} />
                            }
                          </div>

                          {/* Title + variants + qty */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 group-hover:text-blue-600 transition-colors">
                              {item.product?.title || 'Unknown Product'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Qty: {item.quantity}</span>
                              {item.variants && (
                                <span className="text-[10px] md:text-xs text-gray-500 truncate">({item.variants})</span>
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

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, MapPin, Phone, ArrowRight, Loader2, PackageOpen } from 'lucide-react';
import { api } from '@/utils/api';
import Link from 'next/link';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentOrders, setRecentOrders] = useState([]);
  const [fetchingRecent, setFetchingRecent] = useState(true);

  // Fetch recent orders from local storage on mount
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const storedIds = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
        if (storedIds.length > 0) {
          const data = await api.post('/market/orders/guest/list', { ids: storedIds });
          if (data && Array.isArray(data)) {
            setRecentOrders(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setFetchingRecent(false);
      }
    };
    fetchRecentOrders();
  }, []);

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!orderId || !phone) {
      setError('Please enter both Order ID and Phone Number.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/market/orders/guest/track', { orderId: orderId.trim(), phone: phone.trim() });
      const order = res.data || res;
      
      if (order && (order.id || order._id)) {
        // Add to local storage for future reference
        try {
          const storedIds = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
          const id = order.id || order._id;
          if (!storedIds.includes(id)) {
            storedIds.push(id);
            localStorage.setItem('codalina_guest_orders', JSON.stringify(storedIds));
          }
        } catch (e) {}
        
        // Trigger global loader before push
        window.dispatchEvent(new Event('startNavigation'));
        router.push(`/orders/${order.id || order._id}`);
      }
    } catch (err) {
      setError(err?.data?.error || err.response?.data?.error || err.message || 'Failed to track order. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black pt-20 pb-16 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-semibold text-[#1d1d1f] dark:text-white mb-4 tracking-tight">Track Your Order</h1>
          <p className="text-[#86868b] dark:text-[#a1a1a6] text-lg">Enter your Order ID and Phone Number to see your order status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Tracking Form */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-[#2c2c2e]">
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-6 flex items-center">
              <Search className="w-5 h-5 mr-2 text-[#0071e3]" />
              Order Details
            </h2>
            
            <form onSubmit={handleTrackOrder} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#a1a1a6] mb-2">Order ID</label>
                <div className="relative">
                  <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 64abc123..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-[12px] bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1c1c1e] focus:ring-1 focus:ring-[#0071e3] transition-all text-[#1d1d1f] dark:text-white outline-none"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#1d1d1f] dark:text-[#a1a1a6] mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full pl-11 pr-4 py-3.5 rounded-[12px] bg-[#f5f5f7] dark:bg-black border border-transparent focus:border-[#0071e3] focus:bg-white dark:focus:bg-[#1c1c1e] focus:ring-1 focus:ring-[#0071e3] transition-all text-[#1d1d1f] dark:text-white outline-none"
                    required
                  />
                </div>
                <p className="text-xs text-[#86868b] mt-2">Enter the phone number you used during checkout.</p>
              </div>

              {error && (
                <div className="p-4 rounded-[12px] bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0071e3] hover:bg-[#0077ED] text-white py-4 rounded-full font-medium text-[15px] transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-6"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Track Order'}
              </button>
            </form>
          </div>

          {/* Recent Orders (from localStorage) */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-[#2c2c2e] flex flex-col">
            <h2 className="text-xl font-semibold text-[#1d1d1f] dark:text-white mb-6 flex items-center">
              <PackageOpen className="w-5 h-5 mr-2 text-[#0071e3]" />
              Recent Orders
            </h2>

            {fetchingRecent ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                {recentOrders.map((order) => (
                  <Link 
                    href={`/orders/${order._id || order.id}`} 
                    key={order._id || order.id}
                    className="block group"
                    onClick={() => window.dispatchEvent(new Event('startNavigation'))}
                  >
                    <div className="p-4 rounded-[16px] bg-[#f5f5f7] dark:bg-black border border-transparent group-hover:border-[#0071e3]/30 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[13px] font-medium text-[#1d1d1f] dark:text-white line-clamp-1">
                          ID: {order._id || order.id}
                        </span>
                        <span className={`text-[11px] font-medium px-2 py-1 rounded-full whitespace-nowrap ml-2 ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-[12px] text-[#86868b]">
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center text-[12px] font-medium text-[#0071e3] group-hover:translate-x-1 transition-transform">
                          View Details <ArrowRight className="w-3 h-3 ml-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#f5f5f7] dark:bg-black flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-[#86868b]" />
                </div>
                <p className="text-[#1d1d1f] dark:text-white font-medium mb-1">No Recent Orders</p>
                <p className="text-sm text-[#86868b]">Orders placed from this browser will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

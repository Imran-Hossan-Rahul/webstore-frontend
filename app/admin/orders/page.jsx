"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, MessageSquare, Clock, CheckCircle2, AlertCircle, Package, Settings, Activity, Home, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/utils/api';

const STATUS_FLOW = ['Pending Verification', 'Confirmed', 'In Collaboration', 'Provisioning', 'Active', 'Delivered'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/market/orders/all?limit=100');
      
      if (Array.isArray(res)) {
        setOrders(res);
      } else if (res && res.data && Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (res && res.orders && Array.isArray(res.orders)) {
        setOrders(res.orders);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusCounts = orders.reduce((acc, order) => {
    const s = order.status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const displayStatuses = ['All', ...STATUS_FLOW];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white">Orders & Collaboration</h1>
          <p className="text-white/60 text-[14px]">Manage client projects, verify payments, and deliver source codes.</p>
        </div>
      </div>

      {/* Stats Bar / Status Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {displayStatuses.map(status => {
          const count = status === 'All' ? orders.length : (statusCounts[status] || 0);
          const isSelected = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={"p-3.5 rounded-xl border text-left transition duration-200 flex flex-col justify-between min-h-[88px] " + (
                isSelected 
                  ? "bg-brand-cyan/20 border-brand-cyan/50 shadow-[0_0_15px_rgba(0,255,255,0.1)]" 
                  : "bg-[#080808] border-white/10 hover:border-white/30 shadow-sm"
              )}
            >
              <div className={"text-2xl font-bold font-mono tracking-tight " + (isSelected ? "text-brand-cyan" : "text-white")}>{count}</div>
              <div className={"text-[11px] font-semibold uppercase tracking-wider truncate mt-1 " + (isSelected ? "text-white" : "text-white/50")}>{status}</div>
            </button>
          );
        })}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Client Name, or Email..."
            className="w-full bg-[#080808] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50"
          />
        </div>
        <button className="flex items-center gap-2 bg-[#080808] border border-white/10 rounded-xl py-2.5 px-4 text-white text-[14px] hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Orders List */}
      <div className="bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-white/5 border-b border-white/10 text-white/50 font-medium">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Order / Client</th>
                <th className="px-6 py-4 whitespace-nowrap">Product / Service</th>
                <th className="px-6 py-4 whitespace-nowrap">Status & Phase</th>
                <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                      Loading collaboration rooms...
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders
                .filter(order => {
                   const matchStatus = filterStatus === 'All' || order.status === filterStatus;
                   const s = searchQuery.toLowerCase();
                   const matchSearch = order._id.toLowerCase().includes(s) || 
                          (order.customer_name || '').toLowerCase().includes(s) || 
                          (order.email || '').toLowerCase().includes(s);
                   return matchStatus && matchSearch;
                })
                .map((order) => {
                  const productNames = order.items?.map(i => i.product_id?.title || i.product_name).filter(Boolean).join(', ');
                  const displayProduct = productNames || 'Custom Service / Missing Item';
                  
                  return (
                  <tr key={order._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1 font-mono" title={order._id}>#{order._id.toUpperCase()}</div>
                      <div className="text-[13px] text-white/60">{order.customer_name || 'Unknown Client'}</div>
                      <div className="text-[12px] text-white/40">{order.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white/90 font-medium truncate max-w-[250px]" title={displayProduct}>{displayProduct}</div>
                      <div className="text-[12px] text-white/50 mt-1 flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> 
                        <span className="truncate max-w-[200px] inline-block">{order.collaborationRoomId ? 'Room Active' : 'No recent messages'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={"inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider " +
                          (order.status === 'In Collaboration' || order.status === 'Active' ? 'bg-blue-500/10 text-blue-400' : 
                            order.status === 'Pending Verification' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-green-500/10 text-green-400')
                        }>
                          {order.status}
                        </span>
                        {order.projectPhase && order.projectPhase !== 'N/A' && (
                          <span className="text-[12px] text-white/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Phase: {order.projectPhase}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1">BDT {order.total_amount?.toLocaleString() || 0}</div>
                      <div className="flex items-center gap-1">
                        {order.payment_status === 'Verified' ? (
                          <span className="text-[12px] text-green-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                        ) : (
                          <span className="text-[12px] text-yellow-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {order.payment_status || 'Unverified'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/orders/${order._id}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-white/10 hover:bg-brand-cyan hover:text-black hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] text-[13px] font-medium text-white transition-all duration-300 whitespace-nowrap"
                      >
                        Enter Room
                      </Link>
                    </td>
                  </tr>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  ShieldAlert, 
  ArrowUpRight,
  Activity,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Calendar,
  PieChart as PieChartIcon,
  CreditCard,
  Target,
  Repeat
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

const COLORS = ['#00FFFF', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
const ALT_COLORS = ['#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981', '#00FFFF', '#3B82F6'];

// Custom Hover List Component
const HoverList = ({ title, items, renderItem, className = "", hoverClasses = "group-hover:opacity-100 group-hover:visible group-hover:translate-y-0" }) => (
  <div className={`absolute z-50 left-0 top-[100%] pt-2 w-max min-w-[280px] max-w-[350px] opacity-0 invisible transition-all duration-200 translate-y-2 ${hoverClasses} ${className}`}>
    <div 
      className="max-h-[250px] overflow-y-auto overscroll-none pointer-events-auto bg-[#0a0a0a] border border-white/10 rounded-xl p-3 shadow-[0_10px_40px_rgba(0,0,0,0.8)] custom-scrollbar"
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      <h4 className="text-[11px] font-bold text-brand-cyan mb-2 uppercase tracking-wider sticky top-0 bg-[#0a0a0a] pb-2 z-10 border-b border-white/5">{title}</h4>
      <div className="space-y-1.5 flex flex-col">
        {items.length > 0 ? items.map(renderItem) : <div className="text-xs text-white/30 text-center py-4">No data</div>}
      </div>
    </div>
  </div>
);

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, ordersRes, productsRes] = await Promise.all([
          api.get("/user/profile").catch(() => null),
          api.get("/market/orders/all?limit=1000").catch(() => []),
          api.get("/market/products").catch(() => [])
        ]);

        if (profileRes?.success && (profileRes.data.role === 'admin' || profileRes.data.role === 'superadmin')) {
          setUser(profileRes.data);
        } else {
          router.push('/auth/login');
          return;
        }

        let ordersData = [];
        if (Array.isArray(ordersRes)) ordersData = ordersRes;
        else if (ordersRes?.data && Array.isArray(ordersRes.data)) ordersData = ordersRes.data;
        else if (ordersRes?.orders && Array.isArray(ordersRes.orders)) ordersData = ordersRes.orders;

        let productsData = [];
        if (Array.isArray(productsRes)) productsData = productsRes;
        else if (productsRes?.data && Array.isArray(productsRes.data)) productsData = productsRes.data;
        else if (productsRes?.products && Array.isArray(productsRes.products)) productsData = productsRes.products;

        setOrders(ordersData);
        setProducts(productsData);

      } catch (err) {
        console.error("Dashboard Fetch Failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  // Filter out legacy physical/electronics orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (order.courier_name || order.tracking_id || order.delivery_charge > 0) return false;
      
      const isLegacy = (order.items || []).some(item => {
        const title = (item.product_id?.title || item.product_name || '').toLowerCase();
        return title.includes('geeoo') || 
               title.includes('smartwatch') || 
               title.includes('bluetooth') || 
               title.includes('tws') || 
               title.includes('earbud') || 
               title.includes('headphone') ||
               title.includes('waterproof') ||
               title.includes('neckband') ||
               title.includes('speaker') ||
               title.includes('powerbank');
      });
      return !isLegacy;
    });
  }, [orders]);

  // Derived Analytics Data
  const analytics = useMemo(() => {
    if (!filteredOrders.length) return null;

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let activeOrdersCount = 0;
    let totalPaidOrders = 0;

    const statusCounts = {};
    const productSales = {};
    const revenueByDateMap = {};
    const paymentMethods = {};
    const projectPhases = {};
    const clientDetails = {};

    filteredOrders.forEach(order => {
      const amount = order.total_amount || 0;
      const isPaid = order.payment_status === 'Verified' || order.status === 'Delivered' || order.status === 'Active';
      
      // Clients Tracking
      const clientKey = (order.email || order.customer_name || 'Guest User').toLowerCase();
      if (!clientDetails[clientKey]) {
        clientDetails[clientKey] = {
          name: order.customer_name || 'Guest',
          email: order.email || 'N/A',
          count: 0,
          spent: 0
        };
      }
      clientDetails[clientKey].count += 1;
      if (isPaid) clientDetails[clientKey].spent += amount;

      // Revenue
      if (isPaid) {
        totalRevenue += amount;
        totalPaidOrders++;
      } else if (order.payment_status !== 'Failed' && order.status !== 'Cancelled') {
        pendingRevenue += (order.payment_due || amount);
      }

      // Active
      if (['Confirmed', 'In Collaboration', 'Provisioning', 'Active'].includes(order.status)) {
        activeOrdersCount++;
      }

      // Status Distribution
      const stat = order.status || 'Unknown';
      statusCounts[stat] = (statusCounts[stat] || 0) + 1;

      // Payment Method
      const pm = order.payment_method || 'Unknown';
      paymentMethods[pm] = (paymentMethods[pm] || 0) + 1;

      // Project Phase
      const phase = order.projectPhase || 'N/A';
      if (phase !== 'N/A') {
        projectPhases[phase] = (projectPhases[phase] || 0) + 1;
      }

      // Product Sales Breakdown
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const pName = item.product_id?.title || item.product_name || 'Custom Service';
          productSales[pName] = (productSales[pName] || 0) + (item.price_at_purchase * item.quantity);
        });
      }

      // Timeline (Revenue grouped by day)
      const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!revenueByDateMap[date]) revenueByDateMap[date] = { date, revenue: 0, orders: 0 };
      if (isPaid) {
        revenueByDateMap[date].revenue += amount;
      }
      revenueByDateMap[date].orders += 1;
    });

    const revenueTimeline = Object.values(revenueByDateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const statusData = Object.keys(statusCounts).map(name => ({ name, value: statusCounts[name] }));
    const paymentData = Object.keys(paymentMethods).map(name => ({ name, value: paymentMethods[name] }));
    
    const phaseOrder = ['Discovery', 'Design', 'Development', 'Testing', 'Launch'];
    const phaseData = phaseOrder.map(name => ({ name, count: projectPhases[name] || 0 }));

    const topProducts = Object.keys(productSales)
      .map(name => ({ name, revenue: productSales[name] }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const allClientsList = Object.values(clientDetails).sort((a, b) => b.spent - a.spent);
    const repeatClientsList = allClientsList.filter(c => c.count > 1);
    
    const totalClients = allClientsList.length;
    const repeatRate = totalClients > 0 ? ((repeatClientsList.length / totalClients) * 100).toFixed(1) : 0;
    const averageOrderValue = totalPaidOrders > 0 ? (totalRevenue / totalPaidOrders) : 0;

    // Detailed Lists for Modals/Hover states
    const verifiedOrdersList = filteredOrders.filter(o => o.payment_status === 'Verified' || o.status === 'Delivered').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20);
    const activeOrdersList = filteredOrders.filter(o => ['Confirmed', 'In Collaboration', 'Provisioning', 'Active'].includes(o.status));
    const highestOrdersList = [...filteredOrders].sort((a, b) => b.total_amount - a.total_amount).slice(0, 10);

    return {
      totalRevenue,
      pendingRevenue,
      totalClients,
      repeatRate,
      averageOrderValue,
      revenueTimeline,
      statusData,
      paymentData,
      phaseData,
      topProducts,
      
      // Hover Lists
      allClientsList,
      repeatClientsList,
      verifiedOrdersList,
      activeOrdersList,
      highestOrdersList
    };
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {!analytics ? (
        <div className="p-12 text-center text-white/50 border border-white/10 rounded-2xl bg-[#080808]">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No data available yet. Start selling products to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Main Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-brand-cyan/20 transition-colors cursor-default flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="relative group mt-auto w-max">
                <h3 className="text-white/50 text-[14px] font-medium mb-1">Total Verified Revenue</h3>
                <p className="text-3xl font-display font-semibold text-white tracking-tight">{formatCurrency(analytics.totalRevenue)}</p>
                <HoverList 
                  title="Recent Verified Orders" 
                  items={analytics.verifiedOrdersList} 
                  renderItem={(order, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-md">
                      <div>
                        <span className="text-brand-cyan font-mono">#{order._id?.slice(-5).toUpperCase()}</span>
                        <span className="text-white/60 ml-2">{order.customer_name || 'Guest'}</span>
                      </div>
                      <span className="text-green-400 font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                  )} 
                />
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-brand-cyan/20 transition-colors cursor-default flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-brand-cyan/10 text-brand-cyan">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="relative group mt-auto w-max">
                <h3 className="text-white/50 text-[14px] font-medium mb-1">Average Order Value</h3>
                <p className="text-3xl font-display font-semibold text-white tracking-tight">{formatCurrency(analytics.averageOrderValue)}</p>
                <HoverList 
                  title="Highest Value Orders" 
                  items={analytics.highestOrdersList} 
                  renderItem={(order, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-md">
                      <div>
                        <span className="text-brand-cyan font-mono">#{order._id?.slice(-5).toUpperCase()}</span>
                        <span className="text-white/60 ml-2">{order.customer_name || 'Guest'}</span>
                      </div>
                      <span className="text-white font-medium">{formatCurrency(order.total_amount)}</span>
                    </div>
                  )} 
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-brand-cyan/20 transition-colors cursor-default flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="relative group mt-auto w-max">
                <h3 className="text-white/50 text-[14px] font-medium mb-1">Active Projects / Orders</h3>
                <p className="text-3xl font-display font-semibold text-white tracking-tight">{analytics.activeOrdersList.length}</p>
                <HoverList 
                  title="Active Projects" 
                  items={analytics.activeOrdersList} 
                  renderItem={(order, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-md">
                      <div className="flex flex-col">
                        <span className="text-white">{order.items?.[0]?.product_id?.title || order.items?.[0]?.product_name || 'Custom Project'}</span>
                        <span className="text-white/40">{order.customer_name}</span>
                      </div>
                      <span className="text-blue-400 text-[10px] uppercase bg-blue-500/10 px-2 py-1 rounded ml-3">{order.status}</span>
                    </div>
                  )} 
                />
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-brand-cyan/20 transition-colors cursor-default flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
                
                {/* Repeat Badge acts as its own hover group */}
                <div className="relative group/badge">
                  <div className="bg-purple-500/10 px-2 py-1 rounded-md text-xs font-bold text-purple-400 flex items-center gap-1 cursor-help hover:bg-purple-500/20 transition-colors">
                    <Repeat className="w-3 h-3"/> {analytics.repeatRate}% Repeat
                  </div>
                  
                  {/* Repeat Clients Hover Modal */}
                  <HoverList 
                    hoverClasses="group-hover/badge:opacity-100 group-hover/badge:visible group-hover/badge:translate-y-0"
                    className="left-auto right-0 translate-x-0 origin-top-right min-w-[260px]"
                    title="Repeat Customers" 
                    items={analytics.repeatClientsList} 
                    renderItem={(client, i) => (
                      <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-md">
                        <div className="flex flex-col">
                          <span className="text-white">{client.name}</span>
                          <span className="text-white/40">{client.email}</span>
                        </div>
                        <span className="text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-full whitespace-nowrap ml-3">{client.count} Orders</span>
                      </div>
                    )} 
                  />
                </div>

              </div>
              <div className="relative group mt-auto w-max">
                <h3 className="text-white/50 text-[14px] font-medium mb-1">Unique Clients</h3>
                <p className="text-3xl font-display font-semibold text-white tracking-tight">{analytics.totalClients}</p>

                {/* All Clients Hover Modal */}
                <HoverList 
                  title="All Clients (By Spend)" 
                  items={analytics.allClientsList.slice(0, 15)} 
                  renderItem={(client, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded-md">
                      <div className="flex flex-col">
                        <span className="text-white">{client.name}</span>
                        <span className="text-white/40">{client.email}</span>
                      </div>
                      <span className="text-green-400 whitespace-nowrap ml-3">{formatCurrency(client.spent)}</span>
                    </div>
                  )} 
                />
              </div>
            </div>
          </div>

          {/* Core Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Revenue Trend Chart */}
            <div className="col-span-1 lg:col-span-2 p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-brand-cyan" /> Revenue Trend</h3>
              <div className="flex-1 min-h-[300px]">
                {analytics.revenueTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.revenueTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FFFF" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00FFFF" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="date" stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00FFFF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-white/30 text-sm">Not enough timeline data</div>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-brand-cyan" /> Order Statuses</h3>
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#aaa' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Deep Analytics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Project Phase Pipeline */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-blue-400" /> Project Pipeline</h3>
              <p className="text-xs text-white/40 mb-4">Current phase distribution for active projects</p>
              <div className="flex-1 min-h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analytics.phaseData}>
                    <PolarGrid stroke="#ffffff20" />
                    <PolarAngleAxis dataKey="name" stroke="#ffffff80" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#ffffff50" fontSize={10} />
                    <Radar name="Projects" dataKey="count" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.4} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-400" /> Payment Methods</h3>
              <p className="text-xs text-white/40 mb-4">Distribution of revenue collection channels</p>
              <div className="flex-1 min-h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.paymentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.paymentData.map((entry, index) => (
                        <Cell key={`pm-${index}`} fill={ALT_COLORS[index % ALT_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-green-400" /> Top Selling Digital Assets</h3>
              <p className="text-xs text-white/40 mb-4">Highest revenue generating assets</p>
              {analytics.topProducts.length > 0 ? (
                <div className="flex-1 min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#ffffff80" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <RechartsTooltip 
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]}>
                        {analytics.topProducts.map((entry, index) => (
                          <Cell key={`tp-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/30 text-sm">No sales data found</div>
              )}
            </div>

          </div>

          {/* Bottom Row: Recent Orders List */}
          <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-white">Recent Transactions</h3>
                <p className="text-xs text-white/40 mt-1">Live feed of the latest orders and payments</p>
              </div>
              <button onClick={() => router.push('/admin/orders')} className="text-[13px] text-brand-cyan hover:text-white transition-colors bg-brand-cyan/10 px-4 py-2 rounded-lg">View All Orders</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {filteredOrders.slice(0, 5).map((order) => (
                <div key={order._id} className={"flex flex-col gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-brand-cyan">#{order._id?.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${order.payment_status === 'Verified' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {order.payment_status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] text-white truncate font-medium">{order.customer_name || order.email || 'Guest User'}</p>
                    <p className="text-[12px] text-white/50 truncate flex items-center gap-1 mt-1">
                      <CreditCard className="w-3 h-3" /> {order.payment_method || 'N/A'}
                    </p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</span>
                    <span className="text-[14px] font-bold text-white">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
    </div>
  );
}



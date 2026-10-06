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
  PieChart as PieChartIcon
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#00FFFF', '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

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

  // Derived Analytics Data
  const analytics = useMemo(() => {
    if (!orders.length) return null;

    let totalRevenue = 0;
    let pendingRevenue = 0;
    let uniqueClients = new Set();
    let activeOrdersCount = 0;

    const statusCounts = {};
    const productSales = {};
    const revenueByDateMap = {};

    orders.forEach(order => {
      const amount = order.total_amount || 0;
      
      // Clients
      if (order.email) uniqueClients.add(order.email.toLowerCase());
      else if (order.customer_name) uniqueClients.add(order.customer_name.toLowerCase());

      // Revenue
      if (order.payment_status === 'Verified' || order.status === 'Delivered' || order.status === 'Active') {
        totalRevenue += amount;
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
      if (order.payment_status === 'Verified') {
        revenueByDateMap[date].revenue += amount;
      }
      revenueByDateMap[date].orders += 1;
    });

    const revenueTimeline = Object.values(revenueByDateMap).sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const statusData = Object.keys(statusCounts).map(key => ({
      name: key,
      value: statusCounts[key]
    }));

    const topProducts = Object.keys(productSales)
      .map(key => ({ name: key, revenue: productSales[key] }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      pendingRevenue,
      totalClients: uniqueClients.size,
      activeOrdersCount,
      revenueTimeline,
      statusData,
      topProducts
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Welcome Banner */}
      <div className="relative p-8 rounded-2xl bg-gradient-to-br from-brand-cyan/10 to-blue-600/10 border border-white/5 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-display font-medium text-white mb-2">
              Welcome back, {user?.name || 'Admin'}
            </h2>
            <p className="text-white/60 text-[15px] max-w-xl">
              Here is the live performance overview of your digital agency. You have <strong className="text-brand-cyan">{analytics?.activeOrdersCount || 0} active projects</strong> in collaboration.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => router.push('/admin/orders')} className="px-5 py-2.5 bg-brand-cyan text-black font-semibold text-sm rounded-xl shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] transition-all">
               Manage Orders
             </button>
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-cyan/20 to-transparent blur-3xl opacity-50 pointer-events-none" />
      </div>

      {!analytics ? (
        <div className="p-12 text-center text-white/50 border border-white/10 rounded-2xl bg-[#080808]">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No data available yet. Start selling products to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-400">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white/50 text-[14px] font-medium mb-1">Total Verified Revenue</h3>
              <p className="text-3xl font-display font-semibold text-white tracking-tight">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white/50 text-[14px] font-medium mb-1">Pending / Unverified Due</h3>
              <p className="text-3xl font-display font-semibold text-white tracking-tight">{formatCurrency(analytics.pendingRevenue)}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white/50 text-[14px] font-medium mb-1">Active Projects / Orders</h3>
              <p className="text-3xl font-display font-semibold text-white tracking-tight">{analytics.activeOrdersCount}</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl hover:border-white/10 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-white/50 text-[14px] font-medium mb-1">Unique Clients</h3>
              <p className="text-3xl font-display font-semibold text-white tracking-tight">{analytics.totalClients}</p>
            </div>
          </div>

          {/* Charts Row */}
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
                      <YAxis stroke="#ffffff50" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => "৳" + (value/1000) + "k"} />
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
                      innerRadius={60}
                      outerRadius={80}
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

          {/* Third Row: Top Products & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top Products */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl">
              <h3 className="text-lg font-medium text-white mb-6">Top Selling Products</h3>
              {analytics.topProducts.length > 0 ? (
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.topProducts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={true} vertical={false} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} width={120} />
                      <RechartsTooltip 
                        cursor={{ fill: '#ffffff05' }}
                        contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px' }}
                        formatter={(value) => [formatCurrency(value), 'Generated Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#3B82F6" radius={[0, 4, 4, 0]}>
                        {analytics.topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[250px] flex items-center justify-center text-white/30 text-sm">No sales data found</div>
              )}
            </div>

            {/* Recent Orders List */}
            <div className="p-6 rounded-2xl bg-[#080808] border border-white/5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-white">Recent Orders</h3>
                <button onClick={() => router.push('/admin/orders')} className="text-[13px] text-brand-cyan hover:text-white transition-colors">View All</button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                {orders.slice(0, 5).map((order) => (
                  <div key={order._id} className={"flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"}>
                    <div className="w-10 h-10 rounded-full bg-brand-cyan/10 flex items-center justify-center shrink-0">
                      <ShoppingCart className="w-5 h-5 text-brand-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] text-white truncate">Order <span className="font-mono text-brand-cyan">#{order._id?.slice(-6).toUpperCase()}</span></p>
                      <p className="text-[12px] text-white/40 truncate">{order.customer_name || order.email || 'Guest'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[14px] font-medium text-white">{formatCurrency(order.total_amount)}</p>
                      <p className={"text-[10px] font-bold uppercase tracking-wider mt-0.5 " + (order.payment_status === 'Verified' ? 'text-green-400' : 'text-yellow-400')}>
                        {order.payment_status || 'Pending'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}
      
    </div>
  );
}

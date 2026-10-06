"use client";

import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, FileText, Download } from 'lucide-react';
import { api } from '@/utils/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, paymentId: null, actionLabel: '', isProcessing: false });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/market/orders/all');
      // The orders endpoint returns all orders. We want to display them as payments.
      // Especially those with manual payment methods (bKash, Nagad, Bank Transfer, bkash_manual)
      const data = Array.isArray(res) ? res : (res.data || []);
      const mapped = data.map(order => ({
        id: order._id,
        orderId: 'WA' + order._id.toString().slice(-8).toUpperCase(),
        productDetails: order.items?.map(item => ({
          title: item.product?.title || 'Unknown Product',
          license: (item.variants || 'Standard License').replace(/&amp;/g, '&')
        })) || [],
        client: { 
          name: order.customer_name || 'Guest', 
          email: order.email || 'N/A', 
          phone: order.phone || 'N/A',
          domain: order.deliveryDomain || 'N/A',
          github: order.githubHandle || 'N/A'
        },
        subtotal: order.subtotal || 0,
        discount: order.discount_amount || 0,
        amount: order.total_amount,
        method: order.payment_method === 'bkash_manual' ? 'bKash' : (order.payment_method || 'Stripe'),
        paymentNumber: order.payment_number || 'N/A',
        txId: order.payment_trx_id || 'N/A',
        date: new Date(order.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
        status: (order.payment_status || 'Pending').toLowerCase()
      }));
      setPayments(mapped);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(amount);
  };

  const handleVerifyClick = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'verify',
      paymentId: id,
      actionLabel: 'Approve & Generate License',
      isProcessing: false
    });
  };

  const handleRejectClick = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'reject',
      paymentId: id,
      actionLabel: 'Reject Payment',
      isProcessing: false
    });
  };

  const handleViewClick = (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'view',
      paymentId: id,
      actionLabel: '',
      isProcessing: false
    });
  };

  const executeAction = async () => {
    const { type, paymentId } = confirmModal;
    setConfirmModal(prev => ({ ...prev, isProcessing: true }));

    try {
      if (type === 'verify') {
        await api.patch(`/market/orders/${paymentId}/status`, { status: 'Confirmed' });
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'verified' } : p));
      } else if (type === 'reject') {
        await api.patch(`/market/orders/${paymentId}/status`, { status: 'Payment Failed' });
        setPayments(payments.map(p => p.id === paymentId ? { ...p, status: 'failed' } : p));
      }
      setConfirmModal({ isOpen: false, type: null, paymentId: null, actionLabel: '', isProcessing: false });
    } catch (err) {
      alert(`Failed to ${type} payment. Please try again.`);
      setConfirmModal(prev => ({ ...prev, isProcessing: false }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 w-full">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-medium text-white">Payments & Invoices</h1>
          <p className="text-white/60 text-[14px]">Verify manual transactions and manage client invoices.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search by TxID, Client Name, or Order ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#080808] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50"
          />
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#080808] border border-white/10 text-white hover:bg-white/5 transition-colors shrink-0">
          <Filter className="w-4 h-4" />
          <span className="text-[14px]">Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#080808] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-white/5 border-b border-white/10 text-white/40 font-medium">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">Transaction / Order</th>
                <th className="px-6 py-4 whitespace-nowrap">Client Details</th>
                <th className="px-6 py-4 whitespace-nowrap">Amount & Method</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                        <FileText className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{payment.txId}</p>
                        <p className="text-[13px] text-white/70">Order: <span className="font-medium">#{payment.orderId}</span></p>
                        <p className="text-[12px] text-white/40 mt-0.5">{payment.date}</p>
                        
                        {/* Improved Product Details Display */}
                        {payment.productDetails && payment.productDetails.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {payment.productDetails.map((prod, idx) => (
                              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-2.5 max-w-[280px]">
                                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1 block">Item</span>
                                <p className="text-[13px] font-medium text-white">{prod.title}</p>
                                <p className="text-[12px] text-brand-cyan/90 mt-1 leading-snug">{prod.license}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{payment.client.name}</p>
                    <p className="text-[12px] text-white/50">{payment.client.phone}</p>
                    <p className="text-[12px] text-white/50">{payment.client.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-[12px] text-white/80">{payment.method}</p>
                    <p className="text-[11px] text-white/40">From: {payment.paymentNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[12px] font-medium border border-yellow-500/20">
                        <Clock className="w-3.5 h-3.5" /> Pending Verification
                      </span>
                    )}
                    {payment.status === 'verified' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 text-[12px] font-medium border border-green-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    )}
                    {payment.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 text-[12px] font-medium border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleVerifyClick(payment.id)}
                            className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                            title="Approve Payment"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleRejectClick(payment.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            title="Reject Payment"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleViewClick(payment.id)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-colors text-[12px] font-medium border border-white/10"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-white/40">No payments found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal Overlay */}
      {confirmModal.isOpen && (() => {
        const activePayment = payments.find(p => p.id === confirmModal.paymentId);
        
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0c0e12] border border-white/10 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden">
            <div className={`p-6 border-b border-white/5 flex items-start gap-4 ${confirmModal.type === 'verify' ? 'bg-green-500/5' : confirmModal.type === 'reject' ? 'bg-red-500/5' : 'bg-white/5'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${confirmModal.type === 'verify' ? 'bg-green-500/10 text-green-500' : confirmModal.type === 'reject' ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-white'}`}>
                {confirmModal.type === 'verify' ? <CheckCircle2 className="w-5 h-5" /> : confirmModal.type === 'reject' ? <XCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-1">
                  {confirmModal.type === 'verify' ? 'Confirm Payment Approval' : confirmModal.type === 'reject' ? 'Confirm Payment Rejection' : 'Order & Payment Details'}
                </h3>
                {confirmModal.type !== 'view' && (
                  <p className="text-[14px] text-white/60 leading-relaxed mb-4">
                    {confirmModal.type === 'verify' 
                      ? "Review the full order details below. Approving this payment will permanently mark the order as Confirmed, generate license keys, and email the client."
                      : "Review the full order details below. Rejecting this payment will mark the order as Failed. This action cannot be undone."}
                  </p>
                )}

                {/* Highly Detailed Summary Card inside Modal */}
                {activePayment && (
                  <div className="bg-black/40 border border-white/5 rounded-xl p-6 text-[14px]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Column 1: Order & Client */}
                      <div className="space-y-6">
                        <div>
                          <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-1.5 font-medium">Order Details</span>
                          <span className="text-white font-semibold block text-[15px]">#{activePayment.orderId}</span>
                          <span className="text-[13px] text-white/50 block mt-0.5">{activePayment.date}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-1.5 font-medium">Client Profile</span>
                          <span className="text-white font-medium block">{activePayment.client.name}</span>
                          <span className="text-[13px] text-white/60 block mt-0.5">{activePayment.client.phone}</span>
                          <span className="text-[13px] text-white/60 block">{activePayment.client.email}</span>
                        </div>
                        {(activePayment.client.domain !== 'N/A' || activePayment.client.github !== 'N/A') && (
                          <div>
                            <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-1.5 font-medium">Technical Details</span>
                            {activePayment.client.domain !== 'N/A' && <span className="text-[13px] text-white/70 block"><span className="text-white/40 mr-1">Domain:</span> {activePayment.client.domain}</span>}
                            {activePayment.client.github !== 'N/A' && <span className="text-[13px] text-white/70 block"><span className="text-white/40 mr-1">GitHub:</span> {activePayment.client.github}</span>}
                          </div>
                        )}
                      </div>

                      {/* Column 2: Products */}
                      <div className="md:col-span-2 space-y-6">
                        <div>
                          <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-2 font-medium">Items Purchased</span>
                          <div className="space-y-3">
                            {activePayment.productDetails.map((prod, idx) => (
                              <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <span className="font-semibold text-white block text-[15px]">{prod.title}</span>
                                <span className="text-[13px] text-brand-cyan mt-1.5 block font-medium leading-relaxed">{prod.license}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          {/* Payment Details */}
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-3 font-medium">Transaction Info</span>
                            <div className="space-y-2 text-[13px]">
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">Method</span>
                                <span className="text-white font-medium">{activePayment.method}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">Sender No.</span>
                                <span className="text-white font-medium">{activePayment.paymentNumber}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">TxID</span>
                                <span className="text-white font-medium bg-white/10 px-2 py-0.5 rounded">{activePayment.txId}</span>
                              </div>
                            </div>
                          </div>

                          {/* Cost Breakdown */}
                          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <span className="text-white/40 block text-[11px] uppercase tracking-wider mb-3 font-medium">Payment Summary</span>
                            <div className="space-y-2 text-[13px]">
                              <div className="flex justify-between items-center">
                                <span className="text-white/50">Subtotal</span>
                                <span className="text-white">{formatCurrency(activePayment.subtotal)}</span>
                              </div>
                              {activePayment.discount > 0 && (
                                <div className="flex justify-between items-center text-green-400">
                                  <span>Discount</span>
                                  <span>-{formatCurrency(activePayment.discount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-2 border-t border-white/10 mt-2">
                                <span className="text-white font-medium">Total Paid</span>
                                <span className="text-brand-cyan font-bold text-[16px]">{formatCurrency(activePayment.amount)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-[#080a0c] flex items-center justify-end gap-3">
              <button 
                disabled={confirmModal.isProcessing}
                onClick={() => setConfirmModal({ isOpen: false, type: null, paymentId: null, actionLabel: '', isProcessing: false })}
                className="px-5 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/5 font-medium transition-colors disabled:opacity-50"
              >
                {confirmModal.type === 'view' ? 'Close' : 'Cancel'}
              </button>
              {confirmModal.type !== 'view' && (
                <button 
                  disabled={confirmModal.isProcessing}
                  onClick={executeAction}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center min-w-[140px] disabled:opacity-50
                    ${confirmModal.type === 'verify' 
                      ? 'bg-green-500 hover:bg-green-400 text-black' 
                      : 'bg-red-500 hover:bg-red-400 text-white'}`}
                >
                  {confirmModal.isProcessing ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    confirmModal.actionLabel
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, MessageSquare, Paperclip, Send, Download, ShieldCheck,
  CreditCard, Lock, Layers, Package, User as UserIcon, Mail, Phone, Loader2, AlertTriangle
} from 'lucide-react';
import { api } from '@/utils/api';
import socket from '@/utils/socket';
import { useUser } from '@/context/UserContext';

const PHASES = ['Discovery', 'Design', 'Development', 'Testing', 'Launch', 'N/A'];

const STATUS_STYLES = {
  'Pending Verification': 'bg-yellow-500/10 text-yellow-400',
  'Payment Failed': 'bg-red-500/10 text-red-400',
  'Confirmed': 'bg-emerald-500/10 text-emerald-400',
  'In Collaboration': 'bg-blue-500/10 text-blue-400',
  'Provisioning': 'bg-purple-500/10 text-purple-400',
  'Active': 'bg-emerald-500/10 text-emerald-400',
  'Delivered': 'bg-emerald-500/10 text-emerald-400',
  'Suspended': 'bg-orange-500/10 text-orange-400',
  'Cancelled': 'bg-red-500/10 text-red-400',
};

const PAYMENT_STYLES = {
  Pending: 'text-yellow-400',
  Verified: 'text-emerald-400',
  Failed: 'text-red-400',
  Refunded: 'text-orange-400',
};

const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

const formatSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

const formatDateTime = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
      })
    : '';

export default function OrderCollaborationRoom({ params }) {
  const { id } = params;
  const { user } = useUser();

  const [order, setOrder] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roomError, setRoomError] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [actionError, setActionError] = useState('');

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  // ── Load order + room + history ────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setRoomError('');
    try {
      const orderData = await api.get(`/market/orders/${id}`);
      setOrder(orderData);

      try {
        const roomRes = await api.get(`/chat/order/${id}`);
        setChat(roomRes.chat);
        const msgRes = await api.get(`/chat/messages/${roomRes.chat._id}`);
        setMessages(msgRes.messages || []);
        api.put(`/chat/read/${roomRes.chat._id}`).catch(() => {});
      } catch (roomErr) {
        setRoomError(roomErr?.message || 'Could not open the collaboration room for this order.');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load this order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Live updates ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!chat?._id || !user?._id) return;

    socket.emit('chat:join', chat._id);

    const onNew = (msg) => {
      const senderId = msg.sender?._id || msg.sender;
      if (String(senderId) === String(user._id)) return; // already added from the HTTP response
      setMessages((prev) => (prev.some((m) => m._id === msg._id) ? prev : [...prev, msg]));
      api.put(`/chat/read/${chat._id}`).catch(() => {});
    };
    const onMediaReady = ({ messageId, fileUrl }) => {
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, fileUrl } : m)));
    };

    socket.on('message:new', onNew);
    socket.on('message:mediaReady', onMediaReady);

    return () => {
      socket.emit('chat:leave', chat._id);
      socket.off('message:new', onNew);
      socket.off('message:mediaReady', onMediaReady);
    };
  }, [chat?._id, user?._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // ── Chat actions ───────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = message.trim();
    if (!text || !chat || sending) return;
    setSending(true);
    try {
      const res = await api.post(`/chat/message/${chat._id}`, { content: text, type: 'text' });
      setMessages((prev) => [...prev, res.message]);
      setMessage('');
    } catch (err) {
      setActionError(err?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !chat) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload(`/chat/upload-media/${chat._id}`, formData);
      setMessages((prev) => [...prev, res.message]);
    } catch (err) {
      setActionError(err?.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  // ── Order actions ──────────────────────────────────────────────────────
  const updateOrder = async (payload, key, confirmText) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setActionLoading(key);
    setActionError('');
    try {
      const updated = await api.patch(`/market/orders/${id}/status`, payload);
      setOrder((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setActionError(err?.message || 'Update failed.');
    } finally {
      setActionLoading('');
    }
  };

  // ── Render states ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/50 gap-3">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading collaboration room...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-white/80">{error || 'Order not found.'}</p>
        <div className="flex justify-center gap-3">
          <button onClick={load} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[13px] hover:bg-white/10">
            Retry
          </button>
          <Link href="/admin/orders" className="px-4 py-2 rounded-xl bg-brand-cyan text-black text-[13px] font-medium">
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const shortId = `#${String(order._id).toUpperCase()}`;
  const customerId = order.user_id ? String(order.user_id) : null;
  const paymentStatus = order.payment_status || 'Pending';
  const isSuspended = order.status === 'Suspended';
  const isDelivered = order.status === 'Delivered';
  const items = order.items || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-display font-medium text-white">Order {shortId}</h1>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${STATUS_STYLES[order.status] || 'bg-white/10 text-white/60'}`}>
                {order.status}
              </span>
            </div>
            <p className="text-white/60 text-[14px]">
              Collaboration Room for {order.customer_name || 'Customer'} · Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={!!actionLoading || order.status === 'Cancelled'}
            onClick={() =>
              isSuspended
                ? updateOrder({ status: 'Active' }, 'suspend', 'Reactivate this order?')
                : updateOrder({ status: 'Suspended' }, 'suspend', 'Suspend this order? The customer will lose access until it is reactivated.')
            }
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[13px] font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            {actionLoading === 'suspend' ? 'Updating...' : isSuspended ? 'Reactivate Order' : 'Suspend Order'}
          </button>
          <button
            disabled={!!actionLoading || isDelivered || order.status === 'Cancelled'}
            onClick={() => updateOrder({ status: 'Delivered' }, 'deliver', 'Mark this order as delivered?')}
            className="px-4 py-2 rounded-xl bg-brand-cyan text-black text-[13px] font-medium hover:bg-brand-cyan/90 transition-colors disabled:opacity-40"
          >
            {actionLoading === 'deliver' ? 'Updating...' : isDelivered ? 'Delivered' : 'Mark as Delivered'}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-[13px] flex items-center justify-between">
          <span>{actionError}</span>
          <button onClick={() => setActionError('')} className="text-red-300/70 hover:text-red-200">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Chat & Collaboration */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-[#080808] border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <h3 className="font-medium text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-cyan" /> Project Chat &amp; Files
            </h3>
            <span className="text-[12px] text-white/40">
              {chat ? `${(chat.participants || []).length} participants` : 'Unavailable'}
            </span>
          </div>

          {roomError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <p className="text-white/70 text-[14px] max-w-sm">{roomError}</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-white/5 text-[11px] text-white/40">
                    Order placed • {formatDateTime(order.createdAt)}
                  </span>
                </div>

                {messages.length === 0 && (
                  <p className="text-center text-white/40 text-[13px] pt-10">
                    No messages yet. Say hello to {order.customer_name || 'the customer'} to get started.
                  </p>
                )}

                {messages.map((msg) => {
                  const senderId = String(msg.sender?._id || msg.sender);
                  const fromCustomer = customerId && senderId === customerId;
                  const senderName = msg.sender?.name || msg.sender?.username || (fromCustomer ? order.customer_name : 'Staff');
                  const isMedia = msg.type === 'image' || msg.type === 'file' || msg.type === 'video' || msg.type === 'audio';

                  return (
                    <div key={msg._id} className={`flex gap-4 ${fromCustomer ? '' : 'flex-row-reverse'}`}>
                      <div
                        title={senderName}
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-medium ${
                          fromCustomer ? 'bg-blue-500/20 text-blue-400' : 'bg-brand-cyan/20 text-brand-cyan'
                        }`}
                      >
                        {initials(senderName)}
                      </div>
                      <div
                        className={`border rounded-2xl p-4 max-w-[80%] ${
                          fromCustomer
                            ? 'bg-white/5 border-white/10 rounded-tl-sm'
                            : 'bg-brand-cyan/10 border-brand-cyan/20 rounded-tr-sm'
                        }`}
                      >
                        {msg.isUnsent ? (
                          <p className="text-[13px] italic text-white/40">This message was unsent</p>
                        ) : isMedia ? (
                          <div className="space-y-2">
                            {msg.type === 'image' && msg.fileUrl && (
                              <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                                <img src={msg.fileUrl} alt={msg.fileName || 'image'} className="rounded-xl max-h-64 object-cover" />
                              </a>
                            )}
                            {msg.type !== 'image' && (
                              <div className="flex items-center gap-3 p-3 bg-[#040608] border border-white/5 rounded-xl">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                  <Paperclip className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-medium text-white truncate">{msg.fileName || msg.content}</p>
                                  <p className="text-[11px] text-white/40">{formatSize(msg.fileSize)}</p>
                                </div>
                                {msg.fileUrl && (
                                  <a href={msg.fileUrl} target="_blank" rel="noreferrer" download className="p-2 text-white/40 hover:text-brand-cyan transition-colors">
                                    <Download className="w-4 h-4" />
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-[14px] text-white/90 whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        <p className="text-[11px] text-white/40 mt-2">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || !chat}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors disabled:opacity-40"
                    title="Attach a file"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                  </button>
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder="Type a message or upload a file..."
                    disabled={!chat}
                    className="flex-1 bg-[#080808] border border-white/10 rounded-xl px-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-brand-cyan/50 disabled:opacity-40"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || sending || !chat}
                    className="p-2.5 rounded-xl bg-brand-cyan text-black hover:bg-brand-cyan/90 transition-colors disabled:opacity-40"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Order Details & Controls */}
        <div className="space-y-6">

          {/* Customer */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-[15px] font-medium text-white flex items-center gap-2 mb-4">
              <UserIcon className="w-4 h-4 text-white/60" /> Customer
            </h3>
            <div className="space-y-2 text-[13px]">
              <p className="text-white font-medium">{order.customer_name || '—'}</p>
              <p className="text-white/60 flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {order.email || '—'}</p>
              <p className="text-white/60 flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {order.phone || '—'}</p>
            </div>
          </div>

          {/* Payment Verification Widget */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-[15px] font-medium text-white flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-white/60" /> Payment Verification
            </h3>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-[13px]">
                <span className="text-white/50">Amount</span>
                <span className="text-white font-medium">BDT {Number(order.total_amount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/50">Method</span>
                <span className="text-white font-medium">{order.payment_method || '—'}</span>
              </div>
              {order.payment_number && (
                <div className="flex justify-between text-[13px]">
                  <span className="text-white/50">Sender No.</span>
                  <span className="text-white font-medium">{order.payment_number}</span>
                </div>
              )}
              <div className="flex justify-between text-[13px]">
                <span className="text-white/50">TrxID</span>
                {order.payment_trx_id ? (
                  <span className="text-brand-cyan font-mono bg-brand-cyan/10 px-1.5 rounded">{order.payment_trx_id}</span>
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-white/50">Status</span>
                <span className={`font-medium ${PAYMENT_STYLES[paymentStatus] || 'text-white'}`}>{paymentStatus}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                disabled={!!actionLoading}
                onClick={() =>
                  paymentStatus === 'Verified'
                    ? updateOrder(
                        { status: 'Pending' },
                        'approve',
                        'Disapprove this payment and move it back to Pending?'
                      )
                    : updateOrder(
                        { status: 'Confirmed' },
                        'approve',
                        'Approve this payment? Licenses will be issued and the customer will be emailed their delivery details.'
                      )
                }
                className={`flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors disabled:opacity-40 ${
                  paymentStatus === 'Verified'
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/20'
                    : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                }`}
              >
                {actionLoading === 'approve' ? 'Updating...' : paymentStatus === 'Verified' ? 'Disapprove' : 'Approve Payment'}
              </button>
              <button
                disabled={!!actionLoading || paymentStatus === 'Failed'}
                onClick={() => updateOrder({ status: 'Payment Failed' }, 'reject', 'Reject this payment?')}
                className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-[13px] font-medium hover:bg-red-500/20 transition-colors disabled:opacity-40"
              >
                {actionLoading === 'reject' ? 'Rejecting...' : paymentStatus === 'Failed' ? 'Rejected' : 'Reject'}
              </button>
            </div>
          </div>

          {/* Project Phase Tracker */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-[15px] font-medium text-white flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-white/60" /> Project Phase
            </h3>
            <select
              value={order.projectPhase || 'N/A'}
              disabled={actionLoading === 'phase'}
              onChange={(e) => updateOrder({ projectPhase: e.target.value }, 'phase')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-[14px] focus:outline-none focus:border-brand-cyan/50 disabled:opacity-50"
            >
              {PHASES.map((p) => (
                <option key={p} value={p} className="bg-[#080808] text-white">
                  {p === 'N/A' ? 'Not applicable' : p}
                </option>
              ))}
            </select>
          </div>

          {/* Items & Delivery */}
          <div className="bg-[#080808] border border-white/10 rounded-2xl p-5 shadow-xl">
            <h3 className="text-[15px] font-medium text-white flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-white/60" /> Items &amp; Delivery
            </h3>

            <div className="space-y-3">
              {items.length === 0 && <p className="text-[13px] text-white/40">No items on this order.</p>}
              {items.map((item) => (
                <div key={item.id || item._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white truncate">{item.product?.title || 'Deleted product'}</p>
                    <p className="text-[11px] text-white/40">
                      Qty {item.quantity} · BDT {Number(item.price_at_purchase || 0).toLocaleString()}
                      {item.variants ? ` · ${item.variants}` : ''}
                    </p>
                    {item.license_key && (
                      <p className="text-[11px] font-mono text-brand-cyan/80 truncate mt-1" title={item.license_key}>
                        {item.license_key}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-white/10 space-y-2">
                <div>
                  <label className="block text-[12px] text-white/50 mb-1">Target Domain / IP Lock</label>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-cyan" />
                    <span className="text-[14px] text-white font-medium">{order.deliveryDomain || 'Not set'}</span>
                  </div>
                </div>
                {order.githubHandle && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-white/50">GitHub</span>
                    <span className="text-white">{order.githubHandle}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

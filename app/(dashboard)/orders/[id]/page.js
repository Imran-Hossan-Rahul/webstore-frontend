"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Image as ImageIcon, CheckCircle2, XCircle, FileText } from "lucide-react";
import { api } from '@/utils/api';
import { generateInvoice } from '@/utils/generateInvoice';

import AppleSpinner from "@/components/ui/AppleSpinner";

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await api.get('/market/orders');
        if (data && data.length > 0) {
          const found = data.find(o => (o.id?.toString() === id || o._id?.toString() === id));
          setOrder(found || null);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    }).replace(/,/g, '');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-slate-950">
        <AppleSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-slate-950 text-gray-500">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#111827] hover:underline">
          Back to My Orders
        </button>
      </div>
    );
  }

  let addressObj = {};
  try { addressObj = typeof order.address === 'string' ? JSON.parse(order.address) : order.address; } catch(e) {}

  const itemsPrice = order.items?.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0) || 0;
  const deliveryCharge = typeof order.delivery_charge === 'number' ? order.delivery_charge : Math.round(itemsPrice * 0.01);
  const subtotal = typeof order.subtotal === 'number' && order.subtotal > 0 ? order.subtotal : itemsPrice;
  const totalAmount = typeof order.total_amount === 'number' && order.total_amount > 0 ? order.total_amount : itemsPrice + deliveryCharge;

  const statusDate = formatDate(order.confirmed_at || order.createdAt);
  const placedDate = formatDate(order.createdAt);

  const isCancelled   = order.status === 'Cancelled';
  const isOrdered     = !isCancelled && ['Order placed','Confirmed','Processing','Shipped','Delivered'].includes(order.status);
  const isConfirmed   = !isCancelled && ['Confirmed','Processing','Shipped','Delivered'].includes(order.status);
  const isProcessing  = !isCancelled && ['Processing','Shipped','Delivered'].includes(order.status);
  const isShipped     = !isCancelled && ['Shipped','Delivered'].includes(order.status);
  const isDelivered   = !isCancelled && order.status === 'Delivered';

  // Progress line calculation: extends halfway past the last active step
  const currentStepIndex = isDelivered ? 4 : isShipped ? 3 : isProcessing ? 2 : isConfirmed ? 1 : isOrdered ? 0 : -1;
  const progressPercent  = currentStepIndex < 0 ? 0 : Math.min((currentStepIndex / 4) * 100 + 12.5, 100);

  return (
    <div className="min-h-screen pb-24 md:pb-0 bg-[#fafafa] dark:bg-slate-950">
      <div className="w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3">
        <div className="p-4 md:p-8 mb-4 md:mb-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 md:pb-6 mb-4 md:mb-6">
            <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.003em] text-[#1d1d1f] dark:text-white">Order Details</h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => generateInvoice(order)}
                className="text-[13px] font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <FileText size={16} /> View Invoice
              </button>
              <button
                onClick={() => router.back()}
                className="text-[13px] font-medium text-[#86868b] hover:text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={16} /> Go Back
              </button>
            </div>
          </div>

          {/* Order Info Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 dark:border-white/10 pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">Order #{((order.id || order._id?.toString())?.slice(-8))}</span>
                <button
                  onClick={() => copyToClipboard(order.id || order._id?.toString())}
                  className="text-gray-400 hover:text-gray-700 transition"
                  title="Copy full Order ID"
                >
                  <Copy size={16} />
                </button>
                {copied && <span className="font-text text-[10px] bg-green-50 text-green-600 font-semibold px-1.5 py-0.5 rounded tracking-[0.06em]">Copied</span>}
              </div>
              <p className="text-[12px] font-normal tracking-[-0.01em] text-[#86868b]">Placed on {placedDate}</p>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="font-text text-[11px] font-semibold tracking-[0.06em] text-[#86868b] mb-1">Total Amount</span>
              <div className="text-[28px] md:text-[32px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-white leading-none">
                {formatPrice(totalAmount)} BDT
              </div>
            </div>
          </div>

          {/* Stepper */}
          {isCancelled ? (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                <XCircle size={22} className="text-red-500" strokeWidth={1.5} />
                <span className="font-text font-semibold text-red-600 dark:text-red-400 text-sm tracking-[0.06em]">Order Cancelled</span>
              </div>
            </div>
          ) : (
            <div className="mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center justify-between relative min-w-[360px] sm:min-w-[480px] mx-auto py-2">
                {/* Gray background track */}
                <div className="absolute left-[32px] md:left-[40px] right-[32px] md:right-[40px] top-[19px] h-[2px] bg-[#e5e5ea] dark:bg-[#2c2c2e] -z-0 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#34c759] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {[
                  { label: 'Ordered',    active: isOrdered },
                  { label: 'Confirmed',  active: isConfirmed },
                  { label: 'Processing', active: isProcessing },
                  { label: 'Shipped',    active: isShipped },
                  { label: 'Delivered',  active: isDelivered },
                ].map(({ label, active }) => (
                  <div key={label} className="flex flex-col items-center gap-2.5 bg-[#fafafa] dark:bg-slate-950 px-1 relative z-10 w-16 md:w-20">
                    {active ? (
                      <CheckCircle2 size={24} className="text-[#34c759] bg-[#fafafa] dark:bg-slate-950 rounded-full" strokeWidth={1.25} />
                    ) : (
                      <div className="w-[24px] h-[24px] rounded-full border-[1.5px] border-[#d2d2d7] dark:border-[#2c2c2e] bg-[#fafafa] dark:bg-slate-950"></div>
                    )}
                    <span className={`font-text font-semibold tracking-[0.06em] text-[11px] sm:text-[12px] text-center ${active ? 'text-[#4b4b4b] dark:text-[#f5f5f7]' : 'text-[#999999] dark:text-[#6e6e73]'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center text-[13px] text-[#86868b] mb-12 flex flex-col items-center gap-1.5">
          <p>Status: <span className="font-text font-semibold tracking-[0.06em] text-[13px] text-[#1d1d1f] dark:text-gray-300">{order.status || 'Order Placed'}</span> &mdash; {formatDate(order.createdAt)}</p>
          {(order.tracking_id || order.courier_name) && ['Shipped', 'Delivered'].includes(order.status) && (
            <p className="mt-2 bg-blue-50 dark:bg-blue-950/30 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300">
              {order.courier_name && <span className="mr-3"><strong>Courier:</strong> {order.courier_name}</span>}
              {order.tracking_id && <span><strong>Tracking ID:</strong> {order.tracking_id}</span>}
            </p>
          )}
        </div>

          {/* Product Items */}
          {order.items?.map((item, idx) => {
            let photo = null;
            try { photo = JSON.parse(item.product?.photos || '[]')[0]; } catch(e) {}
            return (
              <div key={idx} className="bg-white dark:bg-[#1c1c1e] rounded-[12px] p-4 flex items-center justify-between mb-4 border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-16 bg-white dark:bg-black rounded-[8px] border border-[#e5e5ea] dark:border-[#2c2c2e] overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                    {photo ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply" /> : <ImageIcon size={20} className="text-gray-300" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <Link href={item.product?.id ? `/product/${item.product.id}` : '#'}>
                      <h3 className="text-[17px] font-medium tracking-[-0.022em] text-[#1d1d1f] dark:text-white mb-1 hover:text-[#0066cc] transition cursor-pointer line-clamp-1 leading-tight">
                        {item.product?.title || 'Unknown Product'}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[12px] font-bold tracking-[-0.01em] text-[#1d1d1f] dark:text-white bg-white border border-[#e5e5ea] px-2 py-0.5 rounded-[6px] shrink-0">Qty: {item.quantity}</span>
                      {item.variants && <span className="text-[13px] font-normal tracking-[-0.01em] text-[#86868b] leading-relaxed truncate">({item.variants})</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className="font-text text-[11px] font-semibold tracking-[0.06em] text-[#86868b] mb-1">Price</span>
                  <div className="text-[17px] font-bold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">
                    {formatPrice(item.price_at_purchase * item.quantity)} BDT
                  </div>
                  {item.quantity > 1 && (
                    <div className="text-[10px] text-gray-400 mt-0.5">{item.price_at_purchase} × {item.quantity}</div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mb-8"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
            <div className="flex-1 bg-white dark:bg-[#1c1c1e] rounded-[16px] p-5 md:p-6 border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-text font-semibold tracking-[0.06em] text-[#86868b] text-[13px]">Shipping Address</h3>
                <span className="font-text text-[11px] font-semibold tracking-[0.06em] bg-[#f5f5f7] dark:bg-white/10 px-2.5 py-1 rounded-[4px] text-[#1d1d1f] dark:text-white">Regular Delivery</span>
              </div>
              <div className="text-[14px] tracking-[-0.016em] text-[#1d1d1f] dark:text-[#86868b] space-y-2 leading-relaxed">
                <p className="font-semibold text-[#1d1d1f] dark:text-white">{addressObj.name || ''} <span className="text-[#86868b] font-normal ml-2">| {order.phone || ''}</span></p>
                <p>{addressObj.details || ''}, {addressObj.upazila || ''}</p>
                <p>{addressObj.district || ''}, {addressObj.division || ''}, Bangladesh</p>
              </div>
            </div>

            <div className="w-full md:w-[380px] bg-white dark:bg-[#1c1c1e] rounded-[16px] p-5 md:p-6 border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-text font-semibold tracking-[0.06em] text-[#86868b] text-[13px]">Order Summary</h3>
                <span className="font-text text-[11px] font-semibold tracking-[0.06em] bg-white border border-[#e5e5ea] px-2.5 py-1 rounded-[4px] text-[#1d1d1f]">Cash on Delivery</span>
              </div>
              
              <div className="space-y-3.5 mt-2">
                <div className="flex justify-between text-[14px] font-normal tracking-[-0.016em] text-[#4b4b4b] dark:text-gray-300">
                  <span>Items Total</span><span>{formatPrice(itemsPrice)} BDT</span>
                </div>
                <div className="flex justify-between text-[14px] font-normal tracking-[-0.016em] text-[#4b4b4b] dark:text-gray-300">
                  <span>Delivery Charge</span><span>{formatPrice(deliveryCharge)} BDT</span>
                </div>
                
                <div className="border-t border-dashed border-[#d2d2d7] dark:border-gray-700 my-2"></div>
                
                <div className="flex justify-between font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white text-[15px]">
                  <span>Subtotal</span><span>{formatPrice(subtotal)} BDT</span>
                </div>
                
                <div className="border-t border-solid border-[#e5e5ea] dark:border-[#2c2c2e] my-3"></div>
                
                <div className="flex justify-between mt-4 pt-4 border-t border-[#e5e5ea] dark:border-gray-700">
                  <span className="font-text font-semibold tracking-[0.06em] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px]">{isDelivered || order.payment_status === 'Paid' ? 'Total Paid' : 'Due Amount'}</span>
                  <span className="font-bold text-[#1d1d1f] dark:text-white tracking-[-0.015em] text-[28px]">{formatPrice(totalAmount)} BDT</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

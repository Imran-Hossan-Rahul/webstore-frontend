"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '@/utils/api';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-slate-950 text-gray-500">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <button onClick={() => router.push('/market/orders')} className="mt-4 text-[#111827] hover:underline">
          Back to My Orders
        </button>
      </div>
    );
  }

  let addressObj = {};
  try { addressObj = typeof order.address === 'string' ? JSON.parse(order.address) : order.address; } catch(e) {}

  const itemsPrice = order.items?.reduce((sum, item) => sum + (item.price_at_purchase * item.quantity), 0) || 0;
  const codCharge = Math.round(itemsPrice * 0.01);
  const subtotal = itemsPrice + codCharge;

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
      <div className="max-w-[1200px] mx-auto py-2 md:py-8 px-3 sm:px-6 lg:px-8 -mt-4 md:mt-0">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 md:p-8 mb-4 md:mb-8">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 md:pb-6 mb-4 md:mb-6">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-gray-100">Order Details</h1>
            <button
              onClick={() => router.push('/market/orders')}
              className="text-xs md:text-sm font-semibold text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <ArrowLeft size={16} /> Go Back
            </button>
          </div>

          {/* Order Info Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 dark:border-white/10 pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base md:text-[17px] font-bold text-gray-900 dark:text-gray-200">Order #{((order.id || order._id?.toString())?.slice(-8)).toUpperCase()}</span>
                <button
                  onClick={() => copyToClipboard(order.id || order._id?.toString())}
                  className="text-gray-400 hover:text-gray-700 transition"
                  title="Copy full Order ID"
                >
                  <Copy size={16} />
                </button>
                {copied && <span className="text-[10px] bg-green-50 text-green-600 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Copied</span>}
              </div>
              <p className="text-[11px] md:text-xs font-medium text-gray-500">Placed on {placedDate}</p>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Amount</span>
              <div className="text-xl md:text-2xl font-black text-blue-600 md:text-gray-900 dark:text-white">
                {formatPrice(subtotal)} BDT
              </div>
            </div>
          </div>

          {/* Stepper */}
          {isCancelled ? (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                <XCircle size={22} className="text-red-500" strokeWidth={1.5} />
                <span className="font-bold text-red-600 dark:text-red-400 text-sm tracking-wide">ORDER CANCELLED</span>
              </div>
            </div>
          ) : (
            <div className="mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center justify-between relative min-w-[360px] sm:min-w-[480px] mx-auto py-2 px-2">
                {/* Gray background track */}
                <div className="absolute left-[10%] right-[10%] top-[19px] md:top-[19px] h-[2px] bg-gray-200 dark:bg-gray-700 -z-0 rounded-full overflow-hidden">
                  {/* Green progress fill */}
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700 ease-out"
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
                  <div key={label} className="flex flex-col items-center gap-2 bg-white dark:bg-slate-900 px-1 relative z-10 w-16 md:w-20">
                    {active ? (
                      <CheckCircle2 size={24} className="text-green-500 bg-white fill-green-50 dark:fill-green-900/30 rounded-full shadow-sm" strokeWidth={1.5} />
                    ) : (
                      <div className="w-[24px] h-[24px] rounded-full border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-900"></div>
                    )}
                    <span className={`font-bold text-[9px] sm:text-[10px] md:text-[11px] text-center uppercase tracking-wider ${active ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500 mb-12 flex flex-col items-center gap-1.5">
          <p>Status: <span className="font-semibold uppercase text-gray-700 dark:text-gray-300">{order.status || 'ORDER PLACED'}</span> &mdash; {formatDate(order.createdAt)}</p>
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
              <div key={idx} className="bg-[#f8f9fa] dark:bg-slate-800/30 rounded-xl p-3 md:p-4 flex items-center justify-between mb-3 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 md:gap-4 flex-1">
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center shrink-0 p-1">
                    {photo ? <img src={photo} alt="" className="w-full h-full object-contain mix-blend-multiply" /> : <ImageIcon size={20} className="text-gray-300" strokeWidth={1.5} />}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <Link href={item.product?.id ? `/market/product/${item.product.id}` : '#'}>
                      <h3 className="text-[13px] md:text-[14px] font-bold text-gray-900 dark:text-gray-200 mb-1 hover:text-blue-600 transition cursor-pointer line-clamp-2 leading-tight">
                        {item.product?.title || 'Unknown Product'}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-start gap-2 mt-1.5">
                      <span className="text-[10px] md:text-[11px] font-bold text-gray-600 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm shrink-0 mt-0.5">Qty: {item.quantity}</span>
                      {item.variants && <span className="text-[10px] md:text-xs text-gray-500 leading-relaxed max-w-[80%] break-words">({item.variants})</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 ml-2">
                  <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Price</span>
                  <div className="text-[13px] md:text-[14px] font-black text-gray-900 tracking-wide">
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
            <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-xl p-5 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-[15px] uppercase tracking-wider">Shipping Address</h3>
                <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 shadow-sm uppercase tracking-wider">Regular Delivery</span>
              </div>
              <div className="text-xs md:text-[13px] text-gray-700 dark:text-gray-400 space-y-2 leading-relaxed">
                <p className="font-bold text-gray-900">{addressObj.name || ''} <span className="text-gray-400 font-normal ml-2">| {order.phone || ''}</span></p>
                <p>{addressObj.details || ''}, {addressObj.upazila || ''}</p>
                <p>{addressObj.district || ''}, {addressObj.division || ''}, Bangladesh</p>
              </div>
            </div>

            <div className="w-full md:w-[380px] bg-[#f8f9fa] border border-gray-100 rounded-xl p-5 md:p-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm md:text-[15px] uppercase tracking-wider">Order Summary</h3>
                <span className="text-[10px] font-bold bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 shadow-sm uppercase tracking-wider">Cash on Delivery</span>
              </div>
              
              <div className="space-y-3.5">
                <div className="flex justify-between text-[13px] font-medium text-gray-600 dark:text-gray-400">
                  <span>Items Total</span><span>{formatPrice(itemsPrice)} BDT</span>
                </div>
                <div className="flex justify-between text-[13px] font-medium text-gray-600 dark:text-gray-400">
                  <span>Delivery Charge</span><span>{formatPrice(codCharge)} BDT</span>
                </div>
                
                <div className="border-t border-dashed border-gray-300 dark:border-gray-700 my-2"></div>
                
                <div className="flex justify-between font-black text-gray-900 dark:text-gray-100 text-[15px]">
                  <span>Subtotal</span><span>{formatPrice(subtotal)} BDT</span>
                </div>
                <div className="flex justify-between text-[13px] font-bold text-emerald-500">
                  <span>Paid Amount</span><span>- 0 BDT</span>
                </div>
                
                <div className="border-t border-solid border-gray-200 dark:border-gray-700 my-2"></div>
                
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">Due Amount</span>
                  <span className="font-black text-blue-600 text-lg md:text-xl">{formatPrice(subtotal)} BDT</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

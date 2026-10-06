"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import { api } from "@/utils/api";
import { generateInvoice } from "@/utils/generateInvoice";
import AppleSpinner from "@/components/ui/AppleSpinner";
import GlassBackground from "@/components/dashboard/market/GlassBackground";
import { useUser } from "@/context/UserContext";
import { PageContainer } from "@/components/ui/PageContainer";
import { Button } from "@/components/ui/Button";
import { LoadingState, ErrorState } from '@/components/ui/States';

export default function OrderDetailPage({ params }) {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (userLoading) return;
    const fetchOrder = async () => {
      try {
        let data = [];
        if (user) {
          data = await api.get("/market/orders");
        } else {
          const storedIds = JSON.parse(
            localStorage.getItem("codalina_guest_orders") || "[]",
          );
          if (storedIds.length > 0) {
            data = await api.post("/market/orders/guest/list", {
              ids: storedIds,
            });
          }
        }

        if (data && data.length > 0) {
          const found = data.find(
            (o) => o.id?.toString() === id || o._id?.toString() === id,
          );
          setOrder(found || null);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, userLoading]);

  const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString)
      .toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/,/g, "");
  };

  if (loading) {
    return (
      <PageContainer maxWidth="max-w-[1000px]" className="flex items-center justify-center min-h-[60vh]">
        <LoadingState message="Loading order details..." />
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer maxWidth="max-w-[800px]" className="flex items-center justify-center min-h-[60vh]">
        <ErrorState 
          title="Order Not Found"
          message="We couldn't find the order you're looking for. It may have been deleted or the URL is incorrect."
          actionLabel="Back to My Orders"
          onRetry={() => router.back()}
        />
      </PageContainer>
    );
  }

  let addressObj = {};
  try {
    addressObj =
      typeof order.address === "string"
        ? JSON.parse(order.address)
        : order.address;
  } catch (e) {}

  const itemsPrice =
    order.items?.reduce(
      (sum, item) => sum + item.price_at_purchase * item.quantity,
      0,
    ) || 0;
  const deliveryCharge =
    typeof order.delivery_charge === "number"
      ? order.delivery_charge
      : Math.round(itemsPrice * 0.01);
  const subtotal =
    typeof order.subtotal === "number" && order.subtotal > 0
      ? order.subtotal
      : itemsPrice;
  const totalAmount =
    typeof order.total_amount === "number" && order.total_amount > 0
      ? order.total_amount
      : itemsPrice + deliveryCharge;

  const statusDate = formatDate(order.confirmed_at || order.createdAt);
  const placedDate = formatDate(order.createdAt);

  const isCancelled = order.status === "Cancelled";

  return (
    <>

      <PageContainer maxWidth="max-w-[1000px]" className="relative z-10 pt-4 pb-12">
        <div className="bg-white/40 backdrop-blur-3xl rounded-[32px] overflow-hidden border border-white/40 shadow-[0_8px_32px_rgba(11,37,69,0.04)] mb-8">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-navy/[0.04] pb-4 md:pb-6 mb-4 md:mb-6">
              <h1 className="text-[24px] md:text-[28px] font-display font-medium text-brand-navy ">
                Order Details
              </h1>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                leftIcon={<MessageSquare size={16} />}
                onClick={() => {
                  if (order.user_id) {
                    window.dispatchEvent(new CustomEvent("open-order-room", { detail: { orderId: order._id || order.id } }));
                  } else {
                    window.dispatchEvent(new CustomEvent("toggle-chat"));
                  }
                }}
                className="!rounded-[20px] bg-brand-blue hover:bg-brand-blue/90 text-white hidden sm:flex border-0"
              >
                Chat Support
              </Button>
              <Button
                variant="outline"
                leftIcon={<FileText size={16} />}
                onClick={() => generateInvoice(order)}
                className="text-brand-blue border-brand-blue hover:bg-brand-blue/5 hidden sm:flex !rounded-[20px]"
              >
                View Invoice
              </Button>
              <Button
                variant="secondary"
                leftIcon={<ArrowLeft size={16} />}
                onClick={() => router.back()}
                className="!text-brand-navy dark:!text-brand-navy !bg-white/80 hover:!bg-white !rounded-[20px]"
              >
                Go Back
              </Button>
            </div>
          </div>

          {/* Order Info Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-brand-navy/[0.04] pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[16px] font-mono font-medium text-brand-navy ">
                  Order #WA
                  {((order.id || order._id?.toString())?.slice(
                    -8,
                  )).toUpperCase()}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `WA${((order.id || order._id?.toString())?.slice(-8)).toUpperCase()}`,
                      'orderId'
                    )
                  }
                  className="text-slate-400 hover:text-brand-blue transition-colors"
                  title="Copy Order Number"
                >
                  <Copy size={16} />
                </button>
                {copied === 'orderId' && (
                  <span className="font-mono text-[10px] bg-brand-teal/10 text-brand-teal font-medium px-1.5 py-0.5 rounded-[4px] tracking-widest uppercase">
                    Copied
                  </span>
                )}
              </div>
              <p className="text-[13px] font-sans text-slate-500 ">
                Placed on {placedDate}
              </p>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="font-mono text-[11px] font-medium tracking-widest uppercase text-slate-500 mb-1">
                Total Amount
              </span>
              <div className="text-[24px] md:text-[28px] font-mono font-bold text-brand-navy leading-none">
                BDT {formatPrice(totalAmount)}
              </div>
            </div>
          </div>

          {/* Digital Delivery Banner */}
          {isCancelled ? (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 py-4 bg-red-50 border border-red-200 rounded-[4px]">
                <XCircle size={20} className="text-red-500" strokeWidth={2} />
                <span className="font-sans font-medium text-red-600 text-[14px]">
                  Order Cancelled
                </span>
              </div>
            </div>
          ) : order.status === "Pending Verification" ? (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-brand-blue/10 border border-brand-blue/20 rounded-[4px]">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-brand-blue border-t-transparent animate-spin shrink-0"></div>
                  <div>
                    <span className="block font-sans font-medium text-brand-blue text-[14px]">
                      Payment Verification Pending
                    </span>
                    <span className="block text-[13px] font-sans text-brand-blue mt-0.5 opacity-90">
                      Your payment details are being verified by our team. Once verified, your license keys and download links will be available here, and you will also be notified via Email and SMS. This process usually takes a maximum of 12 hours.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-brand-teal/10 border border-brand-teal/20 rounded-[4px]">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={22}
                    className="text-brand-teal"
                    strokeWidth={2}
                  />
                  <div>
                    <span className="block font-sans font-medium text-brand-teal text-[14px]">
                      Digital Goods Ready
                    </span>
                    <span className="block text-[13px] font-sans text-brand-teal mt-0.5 opacity-90">
                      Your license keys and download links are available below.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[13px] font-sans text-slate-500 mb-12 flex flex-col items-center gap-1.5">
            <p>
              Status:{" "}
              <span className="font-mono font-medium tracking-widest uppercase text-[11px] text-brand-navy ">
                {order.status || "Order Placed"}
              </span>{" "}
              &mdash; {formatDate(order.createdAt)}
            </p>
            {order.projectPhase && order.projectPhase !== 'Not applicable' && (
              <p>
                Project Phase:{" "}
                <span className="font-mono font-medium tracking-widest uppercase text-[11px] text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded-[4px] border border-brand-blue/20">
                  {order.projectPhase}
                </span>
              </p>
            )}
          </div>

          {/* Product Items */}
          {order.items?.map((item, idx) => {
            let photo = null;
            try {
              photo = JSON.parse(item.product?.photos || "[]")[0];
            } catch (e) {}
            return (
              <div
                key={idx}
                className="bg-white/60 backdrop-blur-md rounded-[20px] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border border-brand-navy/[0.04] shadow-sm gap-4"
              >
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-white rounded-[16px] border border-brand-navy/[0.04] shadow-sm overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                    {photo ? (
                      <img
                        src={photo}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply "
                      />
                    ) : (
                      <ImageIcon
                        size={20}
                        className="text-slate-300"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <Link
                      href={
                        item.product?.id ? `/product/${item.product.id}` : "#"
                      }
                    >
                      <h3 className="text-[16px] font-sans font-medium text-brand-navy mb-1 hover:text-brand-blue transition-colors cursor-pointer line-clamp-1 leading-tight">
                        {item.product?.title || "Unknown Product"}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-[11px] font-mono font-medium text-brand-navy bg-white/60 border border-brand-navy/[0.04] px-2 py-0.5 rounded-[4px]">
                        License: {item.product?.licenseType || "Personal"}
                      </span>
                      {item.license_key && (
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono font-medium text-brand-navy bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded-[4px] flex items-center gap-1">
                            Key: {item.license_key}
                          </span>
                          <button
                            onClick={() => copyToClipboard(item.license_key, `license-${idx}`)}
                            className="text-slate-400 hover:text-brand-blue transition-colors"
                            title="Copy License Key"
                          >
                            <Copy size={14} />
                          </button>
                          {copied === `license-${idx}` && (
                            <span className="font-mono text-[10px] bg-brand-teal/10 text-brand-teal font-medium px-1.5 py-0.5 rounded-[4px] tracking-widest uppercase">
                              Copied
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between border-t border-brand-navy/[0.04] sm:border-t-0 pt-4 sm:pt-0">
                  <div className="flex flex-col items-start sm:items-end mb-0 sm:mb-3">
                    <span className="font-mono text-[10px] font-medium tracking-widest uppercase text-slate-500 mb-1">
                      Total Paid
                    </span>
                    <div className="text-[16px] font-mono font-bold text-brand-navy ">
                      BDT {formatPrice(item.price_at_purchase * item.quantity)}
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex flex-col items-end gap-1">
                      {item.download_token ? (
                        new Date(item.download_expires_at) < new Date() ? (
                          <div className="flex flex-col items-end">
                            <span className="text-red-500 font-sans text-[11px] font-medium mb-1">Link Expired</span>
                            <button
                              onClick={() => alert("Please contact support to request a new download link.")}
                              className="bg-white/80 hover:bg-white border border-brand-navy/[0.08] text-brand-navy px-4 py-1.5 rounded-[4px] text-[12px] font-sans font-medium transition-colors"
                            >
                              Request New Link
                            </button>
                          </div>
                        ) : item.download_attempts >= (item.max_downloads || 3) ? (
                          <div className="flex flex-col items-end">
                            <span className="text-red-500 font-sans text-[13px] font-semibold bg-red-500/10 px-4 py-2 rounded border border-red-500/20">Download Limit Reached</span>
                            <span className="text-slate-500 text-[11px] mt-2 max-w-[200px] text-right leading-relaxed">
                              You have exhausted all {item.max_downloads || 3} download attempts. Please contact support to request a new link.
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <a
                              href={`${process.env.NEXT_PUBLIC_API_URL}/market/download/${item.download_token}`}
                              target="_blank"
                              className="bg-brand-blue hover:bg-brand-blue/90 text-white px-6 py-2.5 rounded-[4px] text-[13px] font-sans font-medium transition-colors flex items-center gap-2 shrink-0 shadow-sm"
                            >
                              Download Asset
                            </a>
                            <div className="flex flex-col items-end mt-2.5 text-right space-y-1.5">
                              <span className="text-brand-cyan/90 font-medium text-[11px] bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
                                Downloads left: {(item.max_downloads || 3) - item.download_attempts}
                              </span>
                              <span className="text-slate-400 text-[11px] max-w-[220px] leading-tight">
                                You can download this file up to {item.max_downloads || 3} times, but your License Key is strictly valid for <strong className="text-slate-700">1 Domain</strong> only.
                              </span>
                            </div>
                          </div>
                        )
                      ) : order.status === "Pending Verification" ? (
                        <span className="text-brand-blue font-sans font-medium text-[12px]">Verification Pending</span>
                      ) : (
                        <span className="text-slate-500 font-sans text-[12px]">Processing...</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="mb-8"></div>

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-8">
            <div className="flex-1 bg-white/60 backdrop-blur-md rounded-[20px] p-5 md:p-6 border border-brand-navy/[0.04] shadow-[0_8px_32px_rgba(11,37,69,0.04)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display font-medium uppercase tracking-widest text-slate-500 text-[12px]">
                  Customer Details
                </h3>
                <span className="font-mono text-[10px] font-medium tracking-widest uppercase bg-brand-sky text-brand-blue px-2 py-0.5 rounded-[4px]">
                  Digital Delivery
                </span>
              </div>
              <div className="text-[14px] font-sans text-brand-navy space-y-2 leading-relaxed">
                <p className="font-medium text-brand-navy ">
                  {addressObj?.name || order?.customer_name || "Customer"}{" "}
                  <span className="text-slate-400 font-normal ml-2">
                    | {order?.phone || ""}
                  </span>
                </p>
                <p>{order?.email || addressObj?.email || "No email provided"}</p>
                <p className={`text-[12px] mt-3 pt-3 border-t border-slate-100 ${order?.status === "Pending Verification" ? "text-brand-blue" : "text-brand-teal"}`}>
                  {order?.status === "Pending Verification" 
                    ? "Licenses and download instructions will be emailed to this address after verification."
                    : "Licenses and download instructions have been emailed to this address."}
                </p>
              </div>
            </div>

            <div className="w-full md:w-[380px] bg-white/60 backdrop-blur-md rounded-[20px] p-5 md:p-6 border border-brand-navy/[0.04] shadow-[0_8px_32px_rgba(11,37,69,0.04)]">
              <div className="flex justify-between items-center mb-6 border-b border-brand-navy/[0.04] pb-4">
                <h3 className="font-display font-medium uppercase tracking-widest text-slate-500 text-[12px]">
                  Order Summary
                </h3>
                <span className="font-mono text-[10px] font-medium tracking-widest uppercase bg-white/80 text-slate-500 px-2 py-0.5 rounded-[4px]">
                  Online Payment
                </span>
              </div>

              <div className="space-y-3.5 mt-2">
                <div className="flex justify-between text-[14px] font-sans text-slate-500 ">
                  <span>Items Total</span>
                  <span className="font-mono font-medium text-brand-navy ">BDT {formatPrice(itemsPrice)}</span>
                </div>

                <div className="border-t border-dashed border-brand-navy/[0.08] my-2"></div>

                <div className="flex justify-between font-sans text-[14px] text-slate-500 ">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-brand-navy ">BDT {formatPrice(subtotal)}</span>
                </div>

                <div className="border-t border-solid border-brand-navy/[0.08] my-3"></div>

                <div className="flex justify-between items-center mt-4 pt-4">
                  <span className="font-sans font-medium text-brand-navy text-[16px]">
                    {order.status === "Delivered" ||
                    order.payment_status === "Paid"
                      ? "Total Paid"
                      : "Due Amount"}
                  </span>
                  <span className="font-bold font-mono text-brand-navy text-[24px]">
                    BDT {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </PageContainer>
    </>
  );
}

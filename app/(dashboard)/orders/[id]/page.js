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
} from "lucide-react";
import { api } from "@/utils/api";
import { generateInvoice } from "@/utils/generateInvoice";
import AppleSpinner from "@/components/ui/AppleSpinner";
import { useUser } from "@/context/UserContext";

export default function OrderDetailPage({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
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
  }, [id]);

  const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] dark:bg-slate-950">
        <AppleSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] dark:bg-slate-950 text-gray-500">
        <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
        <button
          onClick={() => router.back()}
          className="mt-4 text-[#111827] hover:underline"
        >
          Back to My Orders
        </button>
      </div>
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
    <div className="min-h-screen pb-24 md:pb-0 bg-[#fafafa] dark:bg-slate-950">
      <div className="w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3">
        <div className="p-4 md:p-8 mb-4 md:mb-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 md:pb-6 mb-4 md:mb-6">
            <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.003em] text-[#1d1d1f] dark:text-white">
              Order Details
            </h1>
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
                <span className="text-[17px] font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">
                  Order #WA
                  {((order.id || order._id?.toString())?.slice(
                    -8,
                  )).toUpperCase()}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `WA${((order.id || order._id?.toString())?.slice(-8)).toUpperCase()}`,
                    )
                  }
                  className="text-gray-400 hover:text-gray-700 transition"
                  title="Copy Order Number"
                >
                  <Copy size={16} />
                </button>
                {copied && (
                  <span className="font-text text-[10px] bg-green-50 text-green-600 font-semibold px-1.5 py-0.5 rounded tracking-[0.06em]">
                    Copied
                  </span>
                )}
              </div>
              <p className="text-[12px] font-normal tracking-[-0.01em] text-[#86868b]">
                Placed on {placedDate}
              </p>
            </div>
            <div className="flex flex-col md:items-end">
              <span className="font-text text-[11px] font-semibold tracking-[0.06em] text-[#86868b] mb-1">
                Total Amount
              </span>
              <div className="text-[28px] md:text-[32px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-white leading-none">
                {formatPrice(totalAmount)} BDT
              </div>
            </div>
          </div>

          {/* Digital Delivery Banner */}
          {isCancelled ? (
            <div className="mb-8">
              <div className="flex items-center justify-center gap-3 py-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                <XCircle size={22} className="text-red-500" strokeWidth={1.5} />
                <span className="font-text font-semibold text-red-600 dark:text-red-400 text-sm tracking-[0.06em]">
                  Order Cancelled
                </span>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-5 px-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    size={24}
                    className="text-emerald-600 dark:text-emerald-400"
                    strokeWidth={1.5}
                  />
                  <div>
                    <span className="block font-text font-semibold text-emerald-800 dark:text-emerald-300 text-[15px]">
                      Digital Goods Ready
                    </span>
                    <span className="block text-[13px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Your license keys and download links are available below.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[13px] text-[#86868b] mb-12 flex flex-col items-center gap-1.5">
            <p>
              Status:{" "}
              <span className="font-text font-semibold tracking-[0.06em] text-[13px] text-[#1d1d1f] dark:text-gray-300">
                {order.status || "Order Placed"}
              </span>{" "}
              &mdash; {formatDate(order.createdAt)}
            </p>
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
                className="bg-white dark:bg-[#1c1c1e] rounded-[12px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-sm gap-4"
              >
                <div className="flex items-center gap-4 flex-1 w-full">
                  <div className="w-16 h-16 bg-white dark:bg-black rounded-[8px] border border-[#e5e5ea] dark:border-[#2c2c2e] overflow-hidden flex items-center justify-center shrink-0 p-1.5">
                    {photo ? (
                      <img
                        src={photo}
                        alt=""
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <ImageIcon
                        size={20}
                        className="text-gray-300"
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
                      <h3 className="text-[17px] font-medium tracking-[-0.022em] text-[#1d1d1f] dark:text-white mb-1 hover:text-[#0066cc] transition cursor-pointer line-clamp-1 leading-tight">
                        {item.product?.title || "Unknown Product"}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-[12px] font-medium text-[#1d1d1f] dark:text-white bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-[6px]">
                        License: {item.product?.licenseType || "Personal"}
                      </span>
                      {item.variants && (
                        <span className="text-[13px] font-normal text-[#86868b] leading-relaxed truncate">
                          ({item.variants})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between border-t border-gray-100 dark:border-white/10 sm:border-t-0 pt-4 sm:pt-0">
                  <div className="flex flex-col items-start sm:items-end mb-0 sm:mb-3">
                    <span className="font-text text-[11px] font-semibold tracking-[0.06em] text-[#86868b] mb-1">
                      Total Paid
                    </span>
                    <div className="text-[17px] font-bold tracking-[-0.022em] text-[#1d1d1f] dark:text-white">
                      {formatPrice(item.price_at_purchase * item.quantity)} BDT
                    </div>
                  </div>

                  {!isCancelled && (
                    <a
                      href={item.product?.downloadUrl || "#"}
                      onClick={(e) => {
                        if (!item.product?.downloadUrl) {
                          e.preventDefault();
                          alert(
                            "Download link will be available once the order is fully processed.",
                          );
                        }
                      }}
                      className="bg-[#0071e3] hover:bg-[#0077ED] text-white px-5 py-2 rounded-full text-[13px] font-bold transition-all shadow-sm flex items-center gap-2 shrink-0"
                    >
                      Download Assets
                    </a>
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
                <h3 className="font-text font-semibold tracking-[0.06em] text-[#86868b] text-[13px]">
                  Customer Details
                </h3>
                <span className="font-text text-[11px] font-semibold tracking-[0.06em] bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-1 rounded-[4px]">
                  Digital Delivery
                </span>
              </div>
              <div className="text-[14px] tracking-[-0.016em] text-[#1d1d1f] dark:text-[#86868b] space-y-2 leading-relaxed">
                <p className="font-semibold text-[#1d1d1f] dark:text-white">
                  {addressObj.name || order.customer_name || "Customer"}{" "}
                  <span className="text-[#86868b] font-normal ml-2">
                    | {order.phone || ""}
                  </span>
                </p>
                <p>{order.email || addressObj.email || "No email provided"}</p>
                <p className="text-[12px] text-emerald-600 dark:text-emerald-400 mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                  Licenses and download instructions have been emailed to this
                  address.
                </p>
              </div>
            </div>

            <div className="w-full md:w-[380px] bg-white dark:bg-[#1c1c1e] rounded-[16px] p-5 md:p-6 border border-[#e5e5ea] dark:border-[#2c2c2e] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-text font-semibold tracking-[0.06em] text-[#86868b] text-[13px]">
                  Order Summary
                </h3>
                <span className="font-text text-[11px] font-semibold tracking-[0.06em] bg-white dark:bg-[#2c2c2e] border border-[#e5e5ea] dark:border-transparent px-2.5 py-1 rounded-[4px] text-[#1d1d1f] dark:text-white">
                  Online Payment
                </span>
              </div>

              <div className="space-y-3.5 mt-2">
                <div className="flex justify-between text-[14px] font-normal tracking-[-0.016em] text-[#4b4b4b] dark:text-gray-300">
                  <span>Items Total</span>
                  <span>{formatPrice(itemsPrice)} BDT</span>
                </div>

                <div className="border-t border-dashed border-[#d2d2d7] dark:border-gray-700 my-2"></div>

                <div className="flex justify-between font-semibold tracking-[-0.022em] text-[#1d1d1f] dark:text-white text-[15px]">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)} BDT</span>
                </div>

                <div className="border-t border-solid border-[#e5e5ea] dark:border-[#2c2c2e] my-3"></div>

                <div className="flex justify-between mt-4 pt-4 border-t border-[#e5e5ea] dark:border-gray-700">
                  <span className="font-text font-semibold tracking-[0.06em] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px]">
                    {order.status === "Delivered" ||
                    order.payment_status === "Paid"
                      ? "Total Paid"
                      : "Due Amount"}
                  </span>
                  <span className="font-bold text-[#1d1d1f] dark:text-white tracking-[-0.015em] text-[28px]">
                    {formatPrice(totalAmount)} BDT
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

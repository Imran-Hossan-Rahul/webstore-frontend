"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "@/utils/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Truck,
  FileText,
  Check,
  Plus,
  Minus,
  MapPin,
  Search,
  ChevronRight,
  X,
  AlertCircle,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { districts, upazilas } from "@/utils/bdData";
import { useUser } from "@/context/UserContext";
import { motion, AnimatePresence } from "framer-motion";
import GlassBackground from "@/components/dashboard/market/GlassBackground";
import AppleSpinner from "@/components/ui/AppleSpinner";

export default function Checkout() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const initialQuantity = parseInt(searchParams.get("quantity") || "1", 10);
  const variantSummary = searchParams.get("variantSummary") || "";
  const baseFinalPrice = parseFloat(searchParams.get("finalPrice") || "0");
  const baseOriginalPrice = parseFloat(
    searchParams.get("originalPrice") || "0",
  );

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [paymentType, setPaymentType] = useState("bkash_manual");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    payment_number: "",
    payment_trx_id: "",
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  const [marketConfig, setMarketConfig] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    if (productId) {
      api
        .get(`/market/products/${productId}`)
        .then((res) => setProduct(res))
        .catch((err) => console.error(err));
    }
    api
      .get("/market/config")
      .then((res) => {
        const config = res.data || (res.singletonKey ? res : null);
        setMarketConfig(config);
      })
      .catch(console.error);
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms & Conditions.");
      setShowErrorModal(true);
      return;
    }

    // Validate BD Phone Number
    const phoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    if (!phoneRegex.test(form.phone.trim())) {
      setErrorMessage(
        "Please enter a valid Bangladeshi phone number (e.g. 01712345678).",
      );
      setShowErrorModal(true);
      return;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      setShowErrorModal(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const discountAmountPerItem = appliedPromo
        ? (baseFinalPrice * appliedPromo.discountPercentage) / 100
        : 0;
      const finalPriceAfterDiscount = baseFinalPrice - discountAmountPerItem;

      const payload = {
        phone: form.phone,
        email: form.email,
        name: form.name,
        isDigital: true,
        items: [
          {
            product_id: product.id,
            quantity,
            price: finalPriceAfterDiscount,
            variants: variantSummary,
          },
        ],
        source_channel: "organic:direct",
        delivery_charge: 0,
        discount_amount: discountAmount,
        subtotal: subTotal,
        total_amount: total,
        payment_method: paymentType,
        payment_number: paymentType === 'bkash_manual' ? form.payment_number : undefined,
        payment_trx_id: paymentType === 'bkash_manual' ? form.payment_trx_id : undefined,
      };

      const endpoint = user ? "/market/orders" : "/market/orders/guest";
      const response = await api.post(endpoint, payload);

      const createdOrder = response?.data || response;
      const orderId = createdOrder?.id || createdOrder?._id;

      setOrderConfirmed(true);
      window.dispatchEvent(new CustomEvent("orderConfirmed"));

      // Save guest order to local storage
      if (!user && orderId) {
        try {
          const storedOrders = JSON.parse(
            localStorage.getItem("codalina_guest_orders") || "[]",
          );
          storedOrders.push(orderId);
          localStorage.setItem(
            "codalina_guest_orders",
            JSON.stringify(storedOrders),
          );
        } catch (e) {
          console.error("Failed to save guest order to local storage", e);
        }
      }

      // Clear the purchased item from the cart
      try {
        const prodIdStr = product.id.toString();
        const cartStr = localStorage.getItem("cartIds");
        if (cartStr) {
          let cartIds = JSON.parse(cartStr);
          if (cartIds.includes(prodIdStr)) {
            cartIds = cartIds.filter((id) => id !== prodIdStr);
            localStorage.setItem("cartIds", JSON.stringify(cartIds));

            const detailsStr = localStorage.getItem("cartDetails");
            if (detailsStr) {
              let cartDetails = JSON.parse(detailsStr);
              delete cartDetails[prodIdStr];
              localStorage.setItem("cartDetails", JSON.stringify(cartDetails));
            }
            window.dispatchEvent(new CustomEvent("cartUpdated"));
          }
        }
      } catch (err) {}

      if (orderId) {
        // Trigger global loader before pushing
        window.dispatchEvent(new Event("startNavigation"));
        router.replace(`/orders/${orderId}`);
      }
    } catch (err) {
      console.error(err?.data || err);
      setErrorMessage(err?.data?.error || err.message || "Checkout failed");
      setShowErrorModal(true);
      setIsSubmitting(false);
    }
  };

  const handleApplyPromo = () => {
    setPromoError("");
    if (!marketConfig?.todaysOffer?.isActive) {
      setPromoError("No active promotions available.");
      return;
    }
    const offer = marketConfig.todaysOffer;
    if (promoCodeInput.trim().toUpperCase() !== offer.code.toUpperCase()) {
      setPromoError("Invalid promo code.");
      return;
    }

    // API returns object ids or strings. We check against string.
    const isApplicable =
      offer.applicableProducts &&
      offer.applicableProducts.some((id) =>
        typeof id === "object" ? id._id === productId : id === productId,
      );

    if (!isApplicable) {
      setPromoError("This promo code is not applicable for this product.");
      return;
    }

    setAppliedPromo({
      code: offer.code,
      discountPercentage: offer.discountPercentage || 0,
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput("");
    setPromoError("");
  };

  const formatPrice = (price) => new Intl.NumberFormat("en-IN").format(price);

  // Signal global loader that we are fetching data
  if (typeof window !== "undefined") {
    if (!product) {
      window.isFetchingData = true;
    }
  }

  useEffect(() => {
    if (product) {
      if (typeof window !== "undefined") {
        window.isFetchingData = false;
        window.dispatchEvent(new Event("nextPageReady"));
      }
    }
  }, [product]);

  if (!productId) {
    return (
      <PageContainer maxWidth="max-w-[600px]">
        <div className="flex flex-col items-center justify-center text-brand-navy py-32">
          <h2 className="text-[20px] font-display font-medium mb-4 text-brand-navy ">No Checkout Item Selected</h2>
          <p className="text-[14px] text-slate-500 mb-8">
            Please select a product from your cart to proceed with checkout.
          </p>
          <Button onClick={() => router.push("/cart")}>
            Return to Cart
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AppleSpinner size={40} className="text-brand-blue" />
      </div>
    );

  const subTotal = baseFinalPrice * quantity;
  const discountAmount = appliedPromo
    ? (subTotal * appliedPromo.discountPercentage) / 100
    : 0;
  const deliveryCharge = 0;
  const total = subTotal - discountAmount;
  const totalOriginal = baseOriginalPrice * quantity;

  const isFormValid =
    form.name.trim() !== "" &&
    form.phone.trim().length >= 11 &&
    form.email.trim() !== "" &&
    termsAccepted &&
    (paymentType === 'bkash_manual' ? form.payment_number.trim().length >= 11 && form.payment_trx_id.trim() !== "" : true);

  const PaymentOption = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`border flex items-center gap-3 py-3 px-4 transition-colors w-full rounded-[12px] ${selected ? "border-brand-blue text-brand-navy bg-brand-blue/5 shadow-sm" : "border-brand-navy/[0.08] text-slate-500 hover:border-brand-blue hover:bg-white/50"}`}
    >
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${selected ? "border-brand-blue bg-brand-blue" : "border-brand-navy/[0.08] bg-white/40"}`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-[14px] font-sans font-medium truncate">{label}</span>
    </button>
  );

  return (
    <>
    <div className="min-h-screen bg-transparent relative overflow-hidden font-sans pb-16 selection:bg-brand-navy selection:text-white">

    <PageContainer maxWidth="max-w-[1100px]" className="relative z-10">
      <h1 className="text-[24px] font-display font-medium text-brand-navy mb-8" style={{ color: '#0f172a' }}>
        Checkout
      </h1>

        {!user && (
          <div className="mb-6 md:mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-[20px] p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-sans font-medium text-[14px] ">Checking out as a Guest</h3>
              <p className="text-[13px] mt-1 opacity-90">
                We will save your order data in this browser, but it may be lost
                if you clear your browsing data. We recommend{" "}
                <Link
                  href="/auth/login"
                  className="underline font-medium hover:text-yellow-900"
                >
                  logging in
                </Link>{" "}
                to keep track of your orders securely.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-6 lg:gap-8"
        >
          {/* Left Column */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 md:gap-8">
            {/* Payment Section */}
            <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm p-5 md:p-6 rounded-[20px] border border-brand-navy/[0.08]">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-brand-navy/[0.08] pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-brand-navy/10 text-brand-navy flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  01
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy uppercase tracking-wider">
                  Payment
                </h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-brand-navy">
                  <CreditCard size={18} />
                  <span className="font-semibold text-sm">Payment Type</span>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <PaymentOption
                    label="bKash (Manual)"
                    selected={paymentType === "bkash_manual"}
                    onClick={() => setPaymentType("bkash_manual")}
                  />
                  {paymentType === "bkash_manual" && (
                    <div className="mt-1 p-4 bg-[#e2136e]/5 border border-[#e2136e]/20 rounded-[12px] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3 mb-4">
                        <img src="https://scripts.pay.bka.sh/logo/bkash_logo.png" alt="bKash" className="h-8 object-contain bg-white/60 rounded-[8px] px-1.5 py-1 border border-[#e2136e]/20" />
                        <div>
                          <h4 className="font-sans font-medium text-[#e2136e] [#e2136e] text-[14px]">Send Money to 017XXXXXXXX (Personal)</h4>
                          <p className="text-[13px] font-sans text-slate-500 mt-1 leading-relaxed">
                            Please send exactly <strong>৳ {formatPrice(total)}</strong> to our bKash personal number. Add the 1.85% cash-out charge if possible. After sending, enter your bKash number and Transaction ID below.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <input
                            required
                            type="tel"
                            value={form.payment_number}
                            onChange={(e) => setForm({ ...form, payment_number: e.target.value })}
                            className="w-full border border-brand-navy/[0.08] rounded-[12px] py-2.5 px-3 text-[14px] font-sans outline-none focus:outline-none focus:border-brand-navy focus:ring-0 bg-white/80 text-brand-navy placeholder:text-slate-400 transition-colors"
                            placeholder="Your bKash Number (e.g. 018XXXXXXXX)"
                          />
                        </div>
                        <div>
                          <input
                            required
                            type="text"
                            value={form.payment_trx_id}
                            onChange={(e) => setForm({ ...form, payment_trx_id: e.target.value.toUpperCase() })}
                            className="w-full border border-brand-navy/[0.08] rounded-[12px] py-2.5 px-3 text-[14px] font-sans outline-none focus:outline-none focus:border-brand-navy focus:ring-0 bg-white/80 text-brand-navy uppercase placeholder:text-slate-400 transition-colors"
                            placeholder="Transaction ID (TrxID)"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm p-5 md:p-6 rounded-[20px] border border-brand-navy/[0.08]">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-brand-navy/[0.08] pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-brand-navy/10 text-brand-navy flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  02
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy uppercase tracking-wider">
                  Customer Details
                </h2>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 text-brand-navy">
                  <FileText size={18} />
                  <span className="font-sans font-medium text-[14px]">
                    Digital Delivery Information
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Your license keys and download links will be sent to this
                  email address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      setFormErrors({ ...formErrors, name: null });
                    }}
                    className={`w-full border rounded-[12px] py-2.5 px-4 text-[14px] font-sans outline-none focus:outline-none focus:ring-0 transition-colors ${formErrors.name ? "border-red-500 focus:border-red-500 bg-red-50" : "border-brand-navy/[0.08] focus:border-brand-navy bg-white/80"}`}
                    placeholder="Full Name"
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        setForm({ ...form, phone: e.target.value });
                        setFormErrors({ ...formErrors, phone: null });
                      }}
                      className={`w-full border rounded-[12px] py-2.5 px-3 sm:px-4 text-[14px] font-sans outline-none focus:outline-none focus:ring-0 transition-colors ${formErrors.phone ? "border-red-500 focus:border-red-500 bg-red-50" : "border-brand-navy/[0.08] focus:border-brand-navy bg-white/80"}`}
                      placeholder="Phone Number"
                    />
                    {formErrors.phone && (
                      <p className="text-xs text-red-500 mt-1.5 ml-1">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      setFormErrors({ ...formErrors, email: null });
                    }}
                    className={`w-full border rounded-[12px] py-2.5 px-4 text-[14px] font-sans outline-none focus:outline-none focus:ring-0 transition-colors ${formErrors.email ? "border-red-500 focus:border-red-500 bg-red-50" : "border-brand-navy/[0.08] focus:border-brand-navy bg-white/80"}`}
                    placeholder="Email Address"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1.5 ml-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 md:gap-8">
            <div className="bg-white/60 backdrop-blur-lg border-white/30 shadow-sm p-5 md:p-6 rounded-[20px] border border-brand-navy/[0.08] sticky top-24">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-brand-navy/[0.08] pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-brand-navy/10 text-brand-navy flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  03
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy uppercase tracking-wider">
                  Order Summary
                </h2>
              </div>

              <div className="flex gap-4 mb-6 pt-2">
                <div className="flex-1 min-w-0 pr-2">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-sans font-medium text-brand-navy text-[15px] mb-1 hover:text-brand-blue hover:underline transition truncate">
                      {product.title}
                    </h3>
                  </Link>
                  {variantSummary && (
                    <p className="text-[13px] font-mono text-slate-500 line-clamp-2 break-words">
                      ({variantSummary})
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end shrink-0 gap-3">
                  <div className="flex items-center border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md rounded-[12px]">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className={`px-2 py-1.5 transition-colors ${quantity <= 1 ? "text-slate-300 cursor-not-allowed" : "text-slate-500 hover:text-brand-navy"}`}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-[13px] font-mono font-medium border-x border-brand-navy/[0.08] text-brand-navy">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1.5 text-slate-500 hover:text-brand-navy transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-[15px] font-mono font-semibold text-brand-navy">
                      BDT {formatPrice(baseFinalPrice * quantity)}
                    </div>
                    {baseOriginalPrice > baseFinalPrice && (
                      <div className="text-[12px] font-mono text-slate-400 line-through">
                        BDT {formatPrice(baseOriginalPrice * quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mt-8 mb-6 pt-6 border-t border-brand-navy/[0.08]">
                <span className="font-sans font-medium text-[14px] text-brand-navy block mb-3">
                  Have a promo code?
                </span>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-brand-teal/10 border border-brand-teal/20 rounded-[12px] p-3">
                    <div className="flex items-center gap-2 text-brand-teal">
                      <Check size={16} />
                      <span className="text-[13px] font-sans font-medium">
                        {appliedPromo.code} Applied (
                        {appliedPromo.discountPercentage}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[12px] font-mono tracking-widest uppercase text-red-500 hover:opacity-80 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        placeholder="Enter code"
                        className="flex-1 border border-brand-navy/[0.08] bg-white/80 rounded-[12px] py-[10px] px-[14px] font-mono text-[14px] outline-none focus:outline-none focus:border-brand-navy focus:ring-0 transition-colors text-brand-navy placeholder:text-slate-400 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-brand-navy text-white px-5 py-2.5 rounded-[12px] font-sans text-[14px] font-medium hover:opacity-90 transition-opacity"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[12px] font-sans text-red-500 mt-1">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 mt-4">
                <div className="flex flex-col gap-2 pb-3 border-b border-brand-navy/[0.08]">
                  <div className="flex justify-between text-[14px] text-slate-500 font-sans">
                    <span>Sub total</span>
                    <span className="font-mono font-medium text-brand-navy">
                      BDT {formatPrice(subTotal)}
                    </span>
                  </div>
                  {appliedPromo && (
                    <div className="flex justify-between text-[14px] text-brand-teal font-sans">
                      <span>Discount ({appliedPromo.code})</span>
                      <span className="font-mono font-medium">
                        - BDT {formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-brand-navy pt-2">
                  <span className="font-display font-medium text-[16px]">Total</span>
                  <span className="font-mono font-semibold text-[18px]">
                    BDT {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 shrink-0 accent-brand-blue cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[13px] font-sans text-slate-500 leading-relaxed cursor-pointer"
                >
                  I accept the{" "}
                  <span className="text-brand-navy font-medium hover:text-brand-blue transition-colors">Terms & Conditions</span>{" "}
                  outlined, including{" "}
                  <span className="text-brand-navy font-medium hover:text-brand-blue transition-colors">Delivery, Refund</span>, and{" "}
                  <span className="text-brand-navy font-medium hover:text-brand-blue transition-colors">Cancellation</span> Policies.
                </label>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type={orderConfirmed ? "button" : "submit"}
                  disabled={
                    !isFormValid || isSubmitting || orderConfirmed
                  }
                  className={`font-sans font-medium text-[15px] py-3 px-6 rounded-[12px] transition-all w-full flex items-center justify-center gap-2 ${
                    orderConfirmed
                      ? "bg-brand-teal/20 text-brand-teal cursor-default"
                      : isSubmitting
                        ? "bg-brand-blue/70 text-white cursor-wait"
                        : isFormValid
                          ? "bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm"
                          : "bg-slate-100 border border-brand-navy/[0.08] text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting || orderConfirmed ? (
                    <>
                      {orderConfirmed ? (
                         <Check size={18} strokeWidth={2.5} />
                      ) : (
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      )}
                      {orderConfirmed ? "Redirecting..." : "Processing..."}
                    </>
                  ) : (
                    "Confirm Order"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
    </PageContainer>
    </div>

      <AnimatePresence>
        {showErrorModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm"
              onClick={() => setShowErrorModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white/90 backdrop-blur-xl rounded-[24px] w-full max-w-sm p-8 text-center shadow-[0_8px_32px_rgba(11,37,69,0.12)] border border-brand-navy/[0.08]"
            >
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 text-red-500 mb-5 border border-red-100 shadow-sm">
                <XCircle size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-[20px] font-display font-semibold text-brand-navy mb-2">
                Checkout Failed
              </h3>
              <p className="text-[14px] font-sans text-slate-500 mb-8 leading-relaxed">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white font-sans font-medium text-[15px] py-3.5 px-6 rounded-[14px] transition-all shadow-sm active:scale-[0.98]"
              >
                Try Again
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

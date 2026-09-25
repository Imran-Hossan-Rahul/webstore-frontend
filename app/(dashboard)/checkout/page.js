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
} from "lucide-react";
import Link from "next/link";
import { PageContainer } from "@/components/ui/PageContainer";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { districts, upazilas } from "@/utils/bdData";
import { useUser } from "@/context/UserContext";
import { AlertCircle } from "lucide-react";

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

    try {
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
        <div className="flex flex-col items-center justify-center text-brand-navy dark:text-white py-32">
          <h2 className="text-[20px] font-display font-medium mb-4">No Checkout Item Selected</h2>
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
      <div className="min-h-screen bg-brand-cloud dark:bg-[#0D1117] flex items-center justify-center text-slate-400"></div>
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
      className={`border flex items-center gap-3 py-3 px-4 transition-colors w-full rounded-[4px] ${selected ? "border-brand-blue text-brand-navy dark:text-white bg-brand-blue/5 shadow-sm" : "border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white dark:hover:bg-white/5"}`}
    >
      <div
        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${selected ? "border-brand-blue bg-brand-blue" : "border-slate-300 dark:border-white/20 bg-white dark:bg-transparent"}`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-[14px] font-sans font-medium truncate">{label}</span>
    </button>
  );

  return (
    <>
    <PageContainer maxWidth="max-w-[1100px]">
      <h1 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-8">
        Checkout
      </h1>

        {!user && (
          <div className="mb-6 md:mb-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 text-yellow-800 dark:text-yellow-400 rounded-[4px] p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600 dark:text-yellow-500" />
            <div>
              <h3 className="font-sans font-medium text-[14px]">Checking out as a Guest</h3>
              <p className="text-[13px] mt-1 opacity-90">
                We will save your order data in this browser, but it may be lost
                if you clear your browsing data. We recommend{" "}
                <Link
                  href="/auth/login"
                  className="underline font-medium hover:text-yellow-900 dark:hover:text-yellow-300"
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
            <div className="bg-white dark:bg-[#161B22] rounded-[4px] border border-slate-200 dark:border-white/10 p-5 md:p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  01
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy dark:text-white uppercase tracking-wider">
                  Payment
                </h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-brand-slate">
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
                    <div className="mt-1 p-4 bg-[#e2136e]/5 border border-[#e2136e]/20 rounded-[4px] animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex items-start gap-3 mb-4">
                        <img src="https://scripts.pay.bka.sh/logo/bkash_logo.png" alt="bKash" className="h-8 object-contain bg-white rounded-[4px] px-1.5 py-1 border border-[#e2136e]/20" />
                        <div>
                          <h4 className="font-sans font-medium text-[#e2136e] text-[14px]">Send Money to 017XXXXXXXX (Personal)</h4>
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
                            className="w-full border border-slate-300 dark:border-white/20 rounded-[4px] py-2.5 px-3 text-[14px] font-sans focus:outline-none focus:border-[#e2136e] focus:ring-1 focus:ring-[#e2136e]/20 bg-white dark:bg-[#0D1117] text-brand-navy dark:text-white placeholder:text-slate-400"
                            placeholder="Your bKash Number (e.g. 018XXXXXXXX)"
                          />
                        </div>
                        <div>
                          <input
                            required
                            type="text"
                            value={form.payment_trx_id}
                            onChange={(e) => setForm({ ...form, payment_trx_id: e.target.value.toUpperCase() })}
                            className="w-full border border-slate-300 dark:border-white/20 rounded-[4px] py-2.5 px-3 text-[14px] font-sans focus:outline-none focus:border-[#e2136e] focus:ring-1 focus:ring-[#e2136e]/20 bg-white dark:bg-[#0D1117] text-brand-navy dark:text-white uppercase placeholder:text-slate-400 placeholder-normal"
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
            <div className="bg-white dark:bg-[#161B22] rounded-[4px] border border-slate-200 dark:border-white/10 p-5 md:p-6 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  02
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy dark:text-white uppercase tracking-wider">
                  Customer Details
                </h2>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 text-brand-navy dark:text-white">
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
                    className={`w-full border rounded-[4px] py-2.5 px-4 text-[14px] font-sans focus:outline-none focus:ring-1 transition-colors ${formErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "border-slate-300 dark:border-white/20 focus:border-brand-blue focus:ring-brand-blue/20 bg-brand-cloud dark:bg-[#0D1117]"}`}
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
                      className={`w-full border rounded-[4px] py-2.5 px-3 sm:px-4 text-[14px] font-sans focus:outline-none focus:ring-1 transition-colors ${formErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "border-slate-300 dark:border-white/20 focus:border-brand-blue focus:ring-brand-blue/20 bg-brand-cloud dark:bg-[#0D1117]"}`}
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
                    className={`w-full border rounded-[4px] py-2.5 px-4 text-[14px] font-sans focus:outline-none focus:ring-1 transition-colors ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/10" : "border-slate-300 dark:border-white/20 focus:border-brand-blue focus:ring-brand-blue/20 bg-brand-cloud dark:bg-[#0D1117]"}`}
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
            <div className="bg-white dark:bg-[#161B22] rounded-[4px] border border-slate-200 dark:border-white/10 p-5 md:p-6 sticky top-24 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-3 mb-5 md:mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="w-6 h-6 rounded-[4px] bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 flex items-center justify-center font-mono text-[11px] font-medium tracking-widest">
                  03
                </div>
                <h2 className="text-[16px] font-display font-medium text-brand-navy dark:text-white uppercase tracking-wider">
                  Order Summary
                </h2>
              </div>

              <div className="flex gap-4 mb-6 pt-2">
                <div className="flex-1 min-w-0 pr-2">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-sans font-medium text-brand-navy dark:text-white text-[15px] mb-1 hover:text-brand-blue hover:underline transition truncate">
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
                  <div className="flex items-center border border-slate-200 dark:border-white/10 bg-brand-cloud dark:bg-[#0D1117] rounded-[4px]">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-1.5 text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-[13px] font-mono font-medium border-x border-slate-200 dark:border-white/10 text-brand-navy dark:text-white">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1.5 text-slate-500 hover:text-brand-navy dark:hover:text-white transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-[15px] font-mono font-semibold text-brand-navy dark:text-white">
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
              <div className="mt-8 mb-6 pt-6 border-t border-slate-200 dark:border-white/10">
                <span className="font-sans font-medium text-[14px] text-brand-navy dark:text-white block mb-3">
                  Have a promo code?
                </span>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-brand-teal/10 border border-brand-teal/20 rounded-[4px] p-3">
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
                        className="flex-1 border border-slate-300 dark:border-white/20 bg-brand-cloud dark:bg-[#0D1117] rounded-[4px] py-[10px] px-[14px] font-mono text-[14px] focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/20 transition-all text-brand-navy dark:text-white placeholder:text-slate-400 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-brand-navy dark:bg-white text-white dark:text-brand-navy px-5 py-2.5 rounded-[4px] font-sans text-[14px] font-medium hover:opacity-90 transition-opacity"
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
                <div className="flex justify-between text-[14px] text-slate-500 font-sans">
                  <span>Sub total</span>
                  <span className="font-mono font-medium text-brand-navy dark:text-white">
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
                <div className="flex justify-between text-[14px] text-slate-500 border-b border-slate-200 dark:border-white/10 pb-3 flex-col gap-2">
                  <div className="flex justify-between w-full font-sans">
                    <span>
                      Delivery Charge
                    </span>
                    <span className="font-mono font-medium text-brand-navy dark:text-white">
                      BDT 0{" "}
                      <span className="text-[11px] font-mono tracking-widest uppercase text-brand-teal ml-1">
                        (Instant Digital)
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-brand-navy dark:text-white pt-2">
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
                  <span className="text-brand-navy dark:text-white font-medium hover:text-brand-blue transition-colors">Terms & Conditions</span>{" "}
                  outlined, including{" "}
                  <span className="text-brand-navy dark:text-white font-medium hover:text-brand-blue transition-colors">Delivery, Refund</span>, and{" "}
                  <span className="text-brand-navy dark:text-white font-medium hover:text-brand-blue transition-colors">Cancellation</span> Policies.
                </label>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type={orderConfirmed ? "button" : "submit"}
                  disabled={
                    !isFormValid || orderConfirmed
                  }
                  className={`font-sans font-medium text-[15px] py-3 px-6 rounded-[4px] transition-all w-full flex items-center justify-center gap-2 ${
                    orderConfirmed
                      ? "bg-brand-teal/20 text-brand-teal cursor-default"
                      : isFormValid
                        ? "bg-brand-blue hover:bg-brand-blue/90 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {orderConfirmed ? (
                    <>
                      <Check
                        size={18}
                        strokeWidth={2.5}
                      />
                      Confirmed
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

      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-navy/60 dark:bg-[#000000]/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#161B22] rounded-[4px] w-full max-w-sm p-6 text-center shadow-2xl border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-[4px] bg-red-100 dark:bg-red-900/30 mb-4">
              <span className="text-red-600 dark:text-red-400 font-bold text-xl">!</span>
            </div>
            <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white mb-2">
              Checkout Failed
            </h3>
            <p className="text-[14px] font-sans text-slate-500 mb-6">{errorMessage}</p>
            <Button
              type="button"
              onClick={() => setShowErrorModal(false)}
              variant="primary"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

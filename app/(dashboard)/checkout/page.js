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
  const [paymentType, setPaymentType] = useState("Cash on Delivery");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
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
      <div className="min-h-screen bg-apple-canvas flex flex-col items-center justify-center text-apple-ink">
        <h2 className="text-2xl font-bold mb-4">No Checkout Item Selected</h2>
        <p className="text-gray-500 mb-6">
          Please select a product from your cart to proceed with checkout.
        </p>
        <button
          onClick={() => router.push("/cart")}
          className="bg-[#111] text-white px-6 py-3 rounded-lg hover:bg-black font-semibold"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  if (!product)
    return (
      <div className="min-h-screen bg-apple-canvas flex items-center justify-center text-apple-muted"></div>
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
    termsAccepted;

  const PaymentOption = ({ label, selected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`border flex items-center gap-3 py-3 px-4 transition w-full rounded-lg ${selected ? "border-blue-600 text-gray-900 bg-blue-50/50 shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"}`}
    >
      <div
        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}
      >
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm font-semibold truncate">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pb-24 md:pb-0">
      <div className="w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">
          Checkout
        </h1>

        {!user && (
          <div className="mb-6 md:mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-sm">Checking out as a Guest</h3>
              <p className="text-sm mt-1">
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
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Payment
                </h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <CreditCard size={18} />
                  <span className="font-semibold text-sm">Payment Type</span>
                </div>
                <div className="w-full sm:w-64">
                  <PaymentOption
                    label="Cash on Delivery"
                    selected={paymentType === "Cash on Delivery"}
                    onClick={() => setPaymentType("Cash on Delivery")}
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Customer Details
                </h2>
              </div>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3 text-[#111827] dark:text-white">
                  <FileText size={18} />
                  <span className="font-semibold text-sm">
                    Digital Delivery Information
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-5">
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
                    className={`w-full border rounded py-2.5 px-4 text-sm focus:outline-none focus:ring-1 ${formErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent"}`}
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
                      className={`w-full border rounded py-2.5 px-3 sm:px-4 text-sm focus:outline-none focus:ring-1 ${formErrors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent"}`}
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
                    className={`w-full border rounded py-2.5 px-4 text-sm focus:outline-none focus:ring-1 ${formErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30" : "border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent"}`}
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
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  Product Description
                </h2>
              </div>

              <div className="flex gap-4 mb-6 pt-2">
                <div className="flex-1 min-w-0 pr-2">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 hover:text-blue-600 hover:underline transition truncate">
                      {product.title}
                    </h3>
                  </Link>
                  {variantSummary && (
                    <p className="text-xs text-gray-500 line-clamp-2 break-words">
                      ({variantSummary})
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end shrink-0 gap-3">
                  <div className="flex items-center border border-gray-200 bg-white rounded">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">
                      ৳ {formatPrice(baseFinalPrice * quantity)}
                    </div>
                    {baseOriginalPrice > baseFinalPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        ৳ {formatPrice(baseOriginalPrice * quantity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mt-8 mb-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <span className="font-normal text-[15px] text-apple-ink block mb-3">
                  Have a promo code?
                </span>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-apple-md p-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Check size={16} />
                      <span className="text-[14px] font-normal">
                        {appliedPromo.code} Applied (
                        {appliedPromo.discountPercentage}%)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[13px] text-red-500 hover:opacity-80 transition-opacity"
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
                        className="flex-1 border border-apple-hairline bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-xl rounded-apple-md py-[10px] px-[14px] font-sans text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleApplyPromo}
                        className="bg-[#0071e3] text-white px-[20px] py-[10px] rounded-full font-sans text-[14px] font-normal hover:bg-[#0077ed] transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[13px] text-red-500">{promoError}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 mt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sub total</span>
                  <span className="font-semibold">
                    {formatPrice(subTotal)} BDT
                  </span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-semibold">
                      - {formatPrice(discountAmount)} BDT
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3 border-dashed flex-col gap-2">
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600 dark:text-gray-400">
                      Delivery Charge
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      0 BDT{" "}
                      <span className="text-xs text-emerald-600 font-normal ml-1">
                        (Instant Digital)
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-800 dark:text-white pt-1">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">
                    ৳ {formatPrice(total)}
                  </span>
                </div>
              </div>

              <div className="mb-6 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 shrink-0 accent-[#111827] cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-gray-600 leading-relaxed cursor-pointer"
                >
                  I accept the{" "}
                  <span className="text-blue-500">Terms & Conditions</span>{" "}
                  outlined, including{" "}
                  <span className="text-blue-500">Delivery, Refund</span>, and{" "}
                  <span className="text-blue-500">Cancellation</span> Policies.
                </label>
              </div>

              <div className="flex justify-end mt-2">
                <button
                  type={orderConfirmed ? "button" : "submit"}
                  disabled={
                    (!isFormValid && !orderConfirmed) || isCalculatingDelivery
                  }
                  className={`font-sans font-normal text-[17px] py-[11px] px-[22px] rounded-apple-pill transition-opacity w-full flex items-center justify-center gap-2 ${
                    orderConfirmed
                      ? "bg-apple-accent/20 text-apple-accent cursor-default"
                      : isFormValid && !isCalculatingDelivery
                        ? "bg-apple-accent hover:bg-apple-accent/90 text-white hover:opacity-80"
                        : "bg-apple-canvas border border-apple-hairline text-apple-muted cursor-not-allowed"
                  }`}
                >
                  {orderConfirmed ? (
                    <>
                      <Check
                        size={18}
                        strokeWidth={3}
                        className="text-emerald-600"
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
      </div>

      {/* Order Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-apple-parchment rounded-apple-lg w-full max-w-sm p-6 text-center transform transition-all border border-apple-hairline">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 mb-4">
              <span className="text-red-600 font-bold text-xl">!</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Checkout Failed
            </h3>
            <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-[#111] text-white font-semibold py-3 rounded-lg hover:bg-black transition text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

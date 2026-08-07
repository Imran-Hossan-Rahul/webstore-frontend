"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Truck, FileText, Check, Plus, Minus, MapPin, Search, ChevronRight, X } from "lucide-react";
import Link from 'next/link';
import { districts, upazilas } from '@/utils/bdData';
import { useUser } from '@/context/UserContext';
import { AlertCircle } from 'lucide-react';



export default function Checkout() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const initialQuantity = parseInt(searchParams.get('quantity') || '1', 10);
  const variantSummary = searchParams.get('variantSummary') || '';
  const baseFinalPrice = parseFloat(searchParams.get('finalPrice') || '0');
  const baseOriginalPrice = parseFloat(searchParams.get('originalPrice') || '0');
  
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [paymentType, setPaymentType] = useState('Cash on Delivery');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('Regular Delivery');
  const [addressTab, setAddressTab] = useState('New Address');
  const [form, setForm] = useState({ 
    name: '', 
    phone: '', 
    zip: '', 
    address_line: '', 
    district: '', 
    thana: '' 
  });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [tempLocation, setTempLocation] = useState({ district: '', thana: '', zip: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  
  const [marketConfig, setMarketConfig] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [deliveryData, setDeliveryData] = useState({ baseCharge: 0, codCharge: 0, totalDeliveryCharge: 0, totalWeightInGrams: 0 });
  const [isCalculatingDelivery, setIsCalculatingDelivery] = useState(false);

  const selectedDistrictId = districts.find(d => d.name === form.district)?.id;
  const filteredThanas = selectedDistrictId 
    ? upazilas.filter(u => u.district_id === selectedDistrictId) 
    : [];

  useEffect(() => {
    setMounted(true);
    if (productId) {
      api.get(`/market/products/${productId}`)
        .then(res => setProduct(res))
        .catch(err => console.error(err));
    }
    api.get('/market/config')
      .then(res => {
        const config = res.data || (res.singletonKey ? res : null);
        setMarketConfig(config);
      })
      .catch(console.error);
      
    try {
      const stored = localStorage.getItem('codalina_addresses');
      if (stored) {
        setSavedAddresses(JSON.parse(stored));
      }
    } catch(e) {}
  }, [productId]);

  useEffect(() => {
    setAddressSaved(false);
  }, [form, addressConfirmed]);

  useEffect(() => {
    if (product && form.district && form.thana) {
      const fetchDelivery = async () => {
        setIsCalculatingDelivery(true);
        try {
          const payload = {
            district: form.district,
            thana: form.thana,
            items: [{ id: product.id || product._id, quantity }],
            isCod: paymentType === 'Cash on Delivery'
          };
          const res = await api.post('/market/delivery/calculate', payload);
          if (res && res.data) {
            setDeliveryData(res.data);
          }
        } catch (error) {
          console.error("Failed to calculate delivery", error);
        } finally {
          setIsCalculatingDelivery(false);
        }
      };
      // Debounce slightly to prevent rapid calls while typing
      const timeoutId = setTimeout(fetchDelivery, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setDeliveryData({ baseCharge: 0, codCharge: 0, totalDeliveryCharge: 0, totalWeightInGrams: 0 });
    }
  }, [form.district, form.thana, quantity, paymentType, product]);

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
      setErrorMessage("Please enter a valid Bangladeshi phone number (e.g. 01712345678).");
      setShowErrorModal(true);
      return;
    }

    try {
      const address = {
        name: form.name,
        division: form.district, // Adapting to old payload
        district: form.district,
        upazila: form.thana,
        zip: form.zip,
        details: form.address_line
      };

      const discountAmountPerItem = appliedPromo ? (baseFinalPrice * appliedPromo.discountPercentage) / 100 : 0;
      const finalPriceAfterDiscount = baseFinalPrice - discountAmountPerItem;

      const payload = {
        phone: form.phone,
        address,
        items: [{ product_id: product.id, quantity, price: finalPriceAfterDiscount, variants: variantSummary }],
        source_channel: 'organic:direct',
        delivery_charge: deliveryCharge,
        discount_amount: discountAmount,
        subtotal: subTotal,
        total_amount: total
      };

      const endpoint = user ? '/market/orders' : '/market/orders/guest';
      const response = await api.post(endpoint, payload);
      
      const createdOrder = response?.data || response;
      const orderId = createdOrder?.id || createdOrder?._id;
      
      setOrderConfirmed(true);
      window.dispatchEvent(new CustomEvent('orderConfirmed'));

      // Save guest order to local storage
      if (!user && orderId) {
        try {
          const storedOrders = JSON.parse(localStorage.getItem('codalina_guest_orders') || '[]');
          storedOrders.push(orderId);
          localStorage.setItem('codalina_guest_orders', JSON.stringify(storedOrders));
        } catch (e) {
          console.error("Failed to save guest order to local storage", e);
        }
      }

      // Clear the purchased item from the cart
      try {
        const prodIdStr = product.id.toString();
        const cartStr = localStorage.getItem('cartIds');
        if (cartStr) {
          let cartIds = JSON.parse(cartStr);
          if (cartIds.includes(prodIdStr)) {
            cartIds = cartIds.filter(id => id !== prodIdStr);
            localStorage.setItem('cartIds', JSON.stringify(cartIds));
            
            const detailsStr = localStorage.getItem('cartDetails');
            if (detailsStr) {
              let cartDetails = JSON.parse(detailsStr);
              delete cartDetails[prodIdStr];
              localStorage.setItem('cartDetails', JSON.stringify(cartDetails));
            }
            window.dispatchEvent(new CustomEvent('cartUpdated'));
          }
        }
      } catch (err) {}

      if (orderId) {
        // Trigger global loader before pushing
        window.dispatchEvent(new Event('startNavigation'));
        router.replace(`/orders/${orderId}`);
      }
    } catch (err) {
      console.error(err?.data || err);
      setErrorMessage(err?.data?.error || err.message || 'Checkout failed');
      setShowErrorModal(true);
    }
  };

  const handleApplyPromo = () => {
    setPromoError('');
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
    const isApplicable = offer.applicableProducts && offer.applicableProducts.some(id => typeof id === 'object' ? id._id === productId : id === productId);
    
    if (!isApplicable) {
      setPromoError("This promo code is not applicable for this product.");
      return;
    }
    
    setAppliedPromo({
      code: offer.code,
      discountPercentage: offer.discountPercentage || 0
    });
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
  };

  const handleSaveAddress = () => {
    const errors = {};
    if (form.name.trim() === '') errors.name = "Full name is required";
    if (form.phone.trim().length < 11) errors.phone = "Valid phone number is required (min 11 digits)";
    if (form.address_line.trim() === '') errors.address_line = "Detailed address is required";
    if (form.district === '') errors.district = "Please select a district";
    if (form.thana === '') errors.thana = "Please select a thana";
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (!addressConfirmed) {
      setErrorMessage("Please confirm that your location matches your address by checking the box.");
      setShowErrorModal(true);
      return;
    }
    
    setFormErrors({});
    setAddressSaved(true);
    
    try {
      let addresses = [];
      const stored = localStorage.getItem('codalina_addresses');
      if (stored) {
        addresses = JSON.parse(stored);
      }
      const exists = addresses.find(a => a.name === form.name && a.phone === form.phone && a.address_line === form.address_line);
      if (!exists) {
        addresses.push(form);
        localStorage.setItem('codalina_addresses', JSON.stringify(addresses));
        setSavedAddresses(addresses);
      }
    } catch(e) {}
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  // Signal global loader that we are fetching data
  if (typeof window !== 'undefined') {
    if (!product) {
      window.isFetchingData = true;
    }
  }

  useEffect(() => {
    if (product) {
      if (typeof window !== 'undefined') {
        window.isFetchingData = false;
        window.dispatchEvent(new Event('nextPageReady'));
      }
    }
  }, [product]);

  if (!productId) {
    return (
      <div className="min-h-screen bg-apple-canvas flex flex-col items-center justify-center text-apple-ink">
        <h2 className="text-2xl font-bold mb-4">No Checkout Item Selected</h2>
        <p className="text-gray-500 mb-6">Please select a product from your cart to proceed with checkout.</p>
        <button onClick={() => router.push('/cart')} className="bg-[#111] text-white px-6 py-3 rounded-lg hover:bg-black font-semibold">
          Return to Cart
        </button>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-apple-canvas flex items-center justify-center text-apple-muted"></div>;

  const subTotal = baseFinalPrice * quantity;
  const discountAmount = appliedPromo ? (subTotal * appliedPromo.discountPercentage) / 100 : 0;
  const deliveryCharge = deliveryData.totalDeliveryCharge || 0;
  const total = subTotal - discountAmount + deliveryCharge;
  const totalOriginal = baseOriginalPrice * quantity + deliveryCharge;

  const isFormValid = 
    addressTab === 'New Address' &&
    form.name.trim() !== '' &&
    form.phone.trim().length >= 11 &&
    form.address_line.trim() !== '' &&
    form.district !== '' &&
    form.thana !== '' &&
    addressConfirmed &&
    termsAccepted;

  const PaymentOption = ({ label, selected, onClick }) => (
    <button 
      type="button"
      onClick={onClick}
      className={`border flex items-center gap-3 py-3 px-4 transition w-full rounded-lg ${selected ? 'border-blue-600 text-gray-900 bg-blue-50/50 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'}`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 bg-white'}`}>
        {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <span className="text-sm font-semibold truncate">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pb-24 md:pb-0">
      <div className="w-full pt-4 md:-mt-4 md:pb-2 px-2 md:px-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8">Checkout</h1>
        
        {!user && (
          <div className="mb-6 md:mb-8 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-sm">Checking out as a Guest</h3>
              <p className="text-sm mt-1">We will save your order data in this browser, but it may be lost if you clear your browsing data. We recommend <Link href="/auth/login" className="underline font-medium hover:text-yellow-900">logging in</Link> to keep track of your orders securely.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Left Column */}
          <div className="w-full lg:w-7/12 flex flex-col gap-6 md:gap-8">
            
            {/* Payment Section */}
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">1</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Payment</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-gray-600">
                  <CreditCard size={18} />
                  <span className="font-semibold text-sm">Payment Type</span>
                </div>
                <div className="w-full sm:w-64">
                  <PaymentOption label="Cash on Delivery" selected={paymentType === 'Cash on Delivery'} onClick={() => setPaymentType('Cash on Delivery')} />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">2</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Delivery</h2>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-[#111827]">
                  <Truck size={18} />
                  <span className="font-semibold text-sm text-gray-800">Delivery Method</span>
                </div>
                <div className="w-full sm:w-64">
                  <PaymentOption label="Regular Delivery" selected={deliveryMethod === 'Regular Delivery'} onClick={() => setDeliveryMethod('Regular Delivery')} />
                </div>
              </div>

              <div>
                <span className="font-semibold text-sm text-gray-800 block mb-3">Add Address</span>
                <div className="flex gap-4 mb-4">
                  <button 
                    type="button"
                    onClick={() => setAddressTab('Existing Address')}
                    className={`py-2 px-4 rounded text-sm font-medium border transition ${addressTab === 'Existing Address' ? 'bg-[#111827]/20 border-[#111827]/30 text-gray-800' : 'bg-transparent border-gray-200 text-gray-500'}`}
                  >
                    Existing Address
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAddressTab('New Address')}
                    className={`py-2 px-4 rounded text-sm font-medium border transition ${addressTab === 'New Address' ? 'bg-[#111827]/30 border-[#111827]/50 text-gray-900' : 'bg-transparent border-gray-200 text-gray-500'}`}
                  >
                    New Address
                  </button>
                </div>

                {addressTab === 'New Address' && (
                  <div className="space-y-4 mt-6">
                    <div>
                      <input required type="text" value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setFormErrors({...formErrors, name: null}); }} className={`w-full border rounded py-2.5 px-4 text-sm focus:outline-none focus:ring-1 ${formErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'}`} placeholder="Full Name" />
                      {formErrors.name && <p className="text-xs text-red-500 mt-1.5 ml-1">{formErrors.name}</p>}
                    </div>
                    
                    <div className="flex gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <input required type="tel" value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setFormErrors({...formErrors, phone: null}); }} className={`w-full border rounded py-2.5 px-3 sm:px-4 text-sm focus:outline-none focus:ring-1 ${formErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 focus:border-blue-600 focus:ring-blue-600'}`} placeholder="Phone Number" />
                        {formErrors.phone && <p className="text-xs text-red-500 mt-1.5 ml-1">{formErrors.phone}</p>}
                      </div>
                    </div>
                    
                    {/* Select Location Button */}
                    <div className="mt-2">
                      {!form.district || !form.thana ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTempLocation({ district: '', thana: '', zip: '' });
                            setModalStep(1);
                            setSearchQuery('');
                            setShowLocationModal(true);
                          }}
                          className={`w-full flex items-center justify-between bg-white dark:bg-black/20 border rounded-[12px] py-3.5 px-4 text-sm font-medium transition-all ${formErrors.district || formErrors.thana ? 'border-red-500 text-red-600 bg-red-50/30' : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-black/40'}`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin className={`w-5 h-5 ${formErrors.district ? 'text-red-500' : 'text-gray-400'}`} />
                            <span>Select Delivery Location</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                      ) : (
                        <div className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-gray-800 rounded-[12px] overflow-hidden">
                          <div className="flex items-start justify-between p-4 bg-gray-50/50 dark:bg-black/30">
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-[#0071e3] mt-0.5 shrink-0" />
                              <div className="flex flex-col gap-1">
                                <span className="text-[15px] font-semibold text-gray-900 dark:text-gray-100 leading-none">{form.thana}, {form.district}</span>
                                {form.zip && <span className="text-[13px] font-medium text-gray-500 leading-none">ZIP: {form.zip}</span>}
                              </div>
                            </div>
                            <button 
                              type="button"
                              onClick={() => {
                                setTempLocation({ district: form.district, thana: form.thana, zip: form.zip });
                                setModalStep(1);
                                setSearchQuery('');
                                setShowLocationModal(true);
                              }}
                              className="text-[13px] font-semibold text-[#0071e3] hover:underline px-2"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      )}
                      {(formErrors.district || formErrors.thana) && <p className="text-xs text-red-500 mt-2 ml-1">{formErrors.district || formErrors.thana}</p>}
                    </div>

                    {/* Detailed Address Textarea (only visible if location selected) */}
                    {form.district && form.thana && (
                      <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-4">
                        <textarea required value={form.address_line} onChange={e => { setForm({...form, address_line: e.target.value}); setFormErrors({...formErrors, address_line: null}); }} className={`w-full border rounded-[12px] py-3.5 px-4 text-sm focus:outline-none focus:ring-1 resize-y ${formErrors.address_line ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50/30' : 'border-gray-200 dark:border-gray-800 focus:border-[#0071e3] focus:ring-[#0071e3] bg-transparent'}`} rows="3" placeholder="Full detailed address (e.g., House/Apt no, Road, Landmark)"></textarea>
                        {formErrors.address_line && <p className="text-xs text-red-500 mt-1 ml-1">{formErrors.address_line}</p>}
                      </div>
                    )}

                    {form.district && form.thana && (
                      <div className="bg-amber-50 border border-amber-200 rounded-[12px] p-4 mt-4 flex items-start gap-3 w-full animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="mt-0.5 shrink-0">
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-amber-900 font-semibold">Please double-check your location!</p>
                          <p className="text-[12px] text-amber-700 mt-1 leading-relaxed break-words">
                            Delivery failures often occur due to mismatched locations. Ensure your selected <strong>District</strong> and <strong>Thana</strong> match the detailed address written above.
                          </p>
                          <label className="flex items-start gap-2 mt-4 cursor-pointer p-2 -ml-2 rounded-lg hover:bg-amber-100/50 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={addressConfirmed}
                              onChange={(e) => setAddressConfirmed(e.target.checked)}
                              className="mt-0.5 shrink-0 w-4 h-4 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2"
                            />
                            <span className="text-[12px] font-bold text-amber-900 leading-tight">
                              I confirm that my District and Thana exactly match my address.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    <button 
                      type="button" 
                      onClick={addressSaved ? null : handleSaveAddress} 
                      disabled={!addressConfirmed}
                      className={`w-full font-sans font-normal text-[15px] py-[10px] rounded-full transition-all mt-2 flex items-center justify-center gap-2 ${
                        addressSaved 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 cursor-default shadow-sm' 
                          : addressConfirmed 
                            ? 'bg-[#0071e3] text-white hover:bg-[#0077ed] shadow-sm' 
                            : 'bg-black/5 dark:bg-white/5 border border-apple-hairline text-apple-muted cursor-not-allowed'
                      }`}
                    >
                      {addressSaved ? (
                        <>
                          <Check size={18} strokeWidth={3} /> Address saved for parcel
                        </>
                      ) : (
                        'SAVE'
                      )}
                    </button>
                  </div>
                )}
                {addressTab === 'Existing Address' && (
                  <div className="mt-6 flex flex-col gap-3">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map((addr, idx) => (
                        <div 
                          key={idx} 
                          className="p-4 border border-[#e8e8ed] rounded-apple-lg hover:border-[#0071e3] cursor-pointer transition-colors bg-apple-canvas"
                          onClick={() => {
                            setForm(addr);
                            setAddressConfirmed(true);
                            setAddressSaved(true);
                            setAddressTab('New Address');
                          }}
                        >
                          <div className="font-semibold text-[#1d1d1f] mb-1">{addr.name} - {addr.phone}</div>
                          <div className="text-sm text-[#86868b]">{addr.address_line}, {addr.thana}, {addr.district} - {addr.zip}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 border border-gray-200 rounded text-sm text-gray-500">
                        No existing addresses found. Please add a new address.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 md:gap-8">

            <div className="bg-apple-parchment dark:bg-apple-surfaceDark rounded-apple-lg border border-apple-hairline p-5 md:p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm">3</div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Product Description</h2>
              </div>

              <div className="flex gap-4 mb-6 pt-2">
                <div className="flex-1 min-w-0 pr-2">
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 hover:text-blue-600 hover:underline transition truncate">{product.title}</h3>
                  </Link>
                  {variantSummary && (
                    <p className="text-xs text-gray-500 line-clamp-2 break-words">
                      ({variantSummary})
                    </p>
                  )}
                </div>
                
                <div className="flex flex-col items-end shrink-0 gap-3">
                  <div className="flex items-center border border-gray-200 bg-white rounded">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition"><Minus size={14} /></button>
                    <span className="px-3 py-1 text-sm font-medium border-x border-gray-200">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition"><Plus size={14} /></button>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-800">৳ {formatPrice(baseFinalPrice * quantity)}</div>
                    {baseOriginalPrice > baseFinalPrice && (
                      <div className="text-xs text-gray-400 line-through">৳ {formatPrice(baseOriginalPrice * quantity)}</div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Promo Code Section */}
              <div className="mt-8 mb-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <span className="font-normal text-[15px] text-apple-ink block mb-3">Have a promo code?</span>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-apple-md p-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Check size={16} />
                      <span className="text-[14px] font-normal">{appliedPromo.code} Applied ({appliedPromo.discountPercentage}%)</span>
                    </div>
                    <button type="button" onClick={handleRemovePromo} className="text-[13px] text-red-500 hover:opacity-80 transition-opacity">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Enter code" 
                        className="flex-1 border border-apple-hairline bg-white/50 dark:bg-[#1c1c1e]/50 backdrop-blur-xl rounded-apple-md py-[10px] px-[14px] font-sans text-[14px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]/20 transition-all"
                      />
                      <button type="button" onClick={handleApplyPromo} className="bg-[#0071e3] text-white px-[20px] py-[10px] rounded-full font-sans text-[14px] font-normal hover:bg-[#0077ed] transition-colors">Apply</button>
                    </div>
                    {promoError && <p className="text-[13px] text-red-500">{promoError}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 mt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sub total</span>
                  <span className="font-semibold">{formatPrice(subTotal)} BDT</span>
                </div>
                {appliedPromo && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Discount ({appliedPromo.code})</span>
                    <span className="font-semibold">- {formatPrice(discountAmount)} BDT</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3 border-dashed flex-col gap-2">
                  <div className="flex justify-between w-full">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Charge</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {isCalculatingDelivery ? (
                        <span className="text-xs text-gray-400 animate-pulse">Calculating...</span>
                      ) : deliveryCharge > 0 ? (
                        `${formatPrice(deliveryCharge)} BDT`
                      ) : (
                        <span className="text-xs text-gray-400 italic">Add location to calculate</span>
                      )}
                    </span>
                  </div>
                  
                  {deliveryData.totalDeliveryCharge > 0 && !isCalculatingDelivery && (
                    <div className="bg-blue-50/50 dark:bg-blue-900/20 rounded p-2.5 text-[13px] text-gray-500 dark:text-gray-400 flex flex-col gap-1.5 border border-blue-100/50 dark:border-blue-900/50 mt-1">
                      <div className="flex justify-between">
                        <span>Destination Zone</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{deliveryData.zone === 'insideDhaka' ? 'Inside Dhaka City' : deliveryData.zone === 'subUrban' ? 'Dhaka Sub-Urban' : 'Outside Dhaka'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated Weight</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{(deliveryData.totalWeightInGrams / 1000).toFixed(2)} KG</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Charge</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">৳ {formatPrice(deliveryData.baseCharge)}</span>
                      </div>
                      {deliveryData.codCharge > 0 && (
                        <div className="flex justify-between text-blue-600 dark:text-blue-400">
                          <span>COD Fee (1%)</span>
                          <span className="font-medium">৳ {formatPrice(deliveryData.codCharge)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-between text-gray-800 dark:text-white pt-1">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">৳ {formatPrice(total)}</span>
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
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I accept the <span className="text-blue-500">Terms & Conditions</span> outlined, including <span className="text-blue-500">Delivery, Refund</span>, and <span className="text-blue-500">Cancellation</span> Policies.
                </label>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type={orderConfirmed ? 'button' : 'submit'}
                  disabled={!isFormValid && !orderConfirmed || isCalculatingDelivery}
                  className={`font-sans font-normal text-[17px] py-[11px] px-[22px] rounded-apple-pill transition-opacity w-full flex items-center justify-center gap-2 ${
                    orderConfirmed 
                      ? 'bg-apple-accent/20 text-apple-accent cursor-default' 
                      : (isFormValid && !isCalculatingDelivery)
                        ? 'bg-apple-accent hover:bg-apple-accent/90 text-white hover:opacity-80' 
                        : 'bg-apple-canvas border border-apple-hairline text-apple-muted cursor-not-allowed'
                  }`}
                >
                  {orderConfirmed ? (
                    <>
                      <Check size={18} strokeWidth={3} className="text-emerald-600" />
                      Confirmed
                    </>
                  ) : 'Confirm Order'}
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Checkout Failed</h3>
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
      {showLocationModal && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLocationModal(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1c1c1e] rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 slide-in-from-bottom-10 duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 pb-3">
              <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                Delivery Location
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-[#2c2c2e] transition-colors bg-gray-50 dark:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Segmented Control / Tabs */}
            <div className="px-5 pb-3 border-b border-gray-100 dark:border-[#2c2c2e]">
              <div className="flex bg-gray-100 dark:bg-black/30 p-1 rounded-full w-full">
                <button 
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${modalStep === 1 ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                  onClick={() => setModalStep(1)}
                >
                  District
                </button>
                <button 
                  disabled={!tempLocation.district}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${modalStep === 2 ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : !tempLocation.district ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                  onClick={() => setModalStep(2)}
                >
                  Thana
                </button>
                <button 
                  disabled={!tempLocation.thana}
                  className={`flex-1 py-1.5 text-[13px] font-semibold rounded-full transition-all duration-300 ${modalStep === 3 ? 'bg-white dark:bg-[#2c2c2e] text-[#1d1d1f] dark:text-white shadow-sm' : !tempLocation.thana ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                  onClick={() => setModalStep(3)}
                >
                  ZIP
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-2 relative">
              {modalStep < 3 && (
                <div className="p-3 sticky top-0 bg-white dark:bg-[#1c1c1e] z-10">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder={modalStep === 1 ? "Search district..." : "Search thana..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-transparent focus:border-[#0071e3] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] focus:outline-none transition-colors text-black dark:text-white"
                    />
                  </div>
                </div>
              )}

              {modalStep === 1 && (
                <div className="px-2 pb-4 animate-in slide-in-from-left-4 fade-in duration-300">
                  {districts.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map(d => (
                    <button 
                      key={d.id}
                      onClick={() => {
                        setTempLocation(prev => ({ ...prev, district: d.name, thana: '', zip: '' }));
                        setModalStep(2);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-[12px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{d.name}</span>
                      {tempLocation.district === d.name ? (
                         <Check className="w-5 h-5 text-[#0071e3]" />
                      ) : (
                         <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {modalStep === 2 && (
                <div className="px-2 pb-4 animate-in slide-in-from-right-4 fade-in duration-300">
                  {upazilas.filter(u => u.district_id === districts.find(d => d.name === tempLocation.district)?.id && u.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.name.localeCompare(b.name)).map(u => (
                    <button 
                      key={u.id}
                      onClick={() => {
                        setTempLocation(prev => ({ ...prev, thana: u.name }));
                        setModalStep(3);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3.5 rounded-[12px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left"
                    >
                      <span className="text-[15px] font-medium text-gray-900 dark:text-gray-100">{u.name}</span>
                      {tempLocation.thana === u.name ? (
                         <Check className="w-5 h-5 text-[#0071e3]" />
                      ) : (
                         <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                      )}
                    </button>
                  ))}
                  {upazilas.filter(u => u.district_id === districts.find(d => d.name === tempLocation.district)?.id).length === 0 && (
                     <div className="text-center py-10 text-gray-500 text-sm">No thanas found for {tempLocation.district}</div>
                  )}
                </div>
              )}

              {modalStep === 3 && (
                <div className="p-5 animate-in slide-in-from-right-4 fade-in duration-300">
                  <div className="bg-blue-50 dark:bg-[#0071e3]/10 border border-blue-100 dark:border-[#0071e3]/20 rounded-[16px] p-5 mb-6 text-center">
                    <p className="text-[12px] font-semibold text-blue-500 dark:text-[#0071e3] mb-1 uppercase tracking-wider">Selected Location</p>
                    <p className="text-[18px] font-bold text-gray-900 dark:text-white">{tempLocation.thana}, {tempLocation.district}</p>
                  </div>

                  <label className="block text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">ZIP / Postal Code (Optional)</label>
                  <input 
                    type="text" 
                    value={tempLocation.zip}
                    onChange={(e) => setTempLocation(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-[#2c2c2e] focus:border-[#0071e3] rounded-[16px] px-4 py-3.5 text-[16px] font-medium focus:outline-none focus:ring-1 focus:ring-[#0071e3] transition-all text-black dark:text-white mb-8 shadow-sm"
                    placeholder="e.g. 1212"
                  />

                  <button 
                    onClick={() => {
                      setForm(prev => ({ ...prev, district: tempLocation.district, thana: tempLocation.thana, zip: tempLocation.zip }));
                      setFormErrors(prev => ({ ...prev, district: null, thana: null }));
                      setShowLocationModal(false);
                      setAddressConfirmed(false); 
                    }}
                    className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ED] text-white rounded-full text-[15px] font-bold transition-all shadow-[0_4px_14px_0_rgb(0,113,227,0.39)] hover:shadow-[0_6px_20px_rgba(0,113,227,0.23)] flex items-center justify-center gap-2"
                  >
                    <MapPin className="w-5 h-5" />
                    Confirm & Continue
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

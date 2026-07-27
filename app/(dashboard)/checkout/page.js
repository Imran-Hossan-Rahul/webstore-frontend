"use client";
import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, Truck, FileText, Check, Plus, Minus } from "lucide-react";
import Link from 'next/link';
import { districts, upazilas } from '@/utils/bdData';

export default function Checkout() {
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
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [addressSaved, setAddressSaved] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [marketConfig, setMarketConfig] = useState(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');

  const selectedDistrictId = districts.find(d => d.name === form.district)?.id;
  const filteredThanas = selectedDistrictId 
    ? upazilas.filter(u => u.district_id === selectedDistrictId) 
    : [];

  useEffect(() => {
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
  }, [productId]);

  useEffect(() => {
    setAddressSaved(false);
  }, [form, addressConfirmed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMessage("Please accept the Terms & Conditions.");
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
        source_channel: 'organic:direct'
      };

      await api.post('/market/orders', payload);
      setOrderConfirmed(true);
      // Dispatch event so RightSidebar can show the order confirmed toast
      window.dispatchEvent(new CustomEvent('orderConfirmed'));
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
    if (form.name.trim() === '' || form.phone.trim().length < 11 || form.address_line.trim() === '' || form.district === '' || form.thana === '') {
      setErrorMessage("Please fill all the address fields correctly before saving.");
      setShowErrorModal(true);
      return;
    }
    if (!addressConfirmed) {
      setErrorMessage("Please confirm that your location matches your address by checking the box.");
      setShowErrorModal(true);
      return;
    }
    setAddressSaved(true);
  };

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

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

  if (!product) return <div className="min-h-screen bg-apple-canvas flex items-center justify-center text-apple-muted">Loading product...</div>;

  const subTotal = baseFinalPrice * quantity;
  const discountAmount = appliedPromo ? (subTotal * appliedPromo.discountPercentage) / 100 : 0;
  const deliveryCharge = 150; // Mock delivery charge
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
                    <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 rounded py-2.5 px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Full Name" />
                    <div className="flex gap-2 sm:gap-4">
                      <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="flex-1 min-w-0 border border-gray-200 rounded py-2.5 px-3 sm:px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="Phone Number" />
                      <input type="text" value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} className="w-20 sm:w-32 shrink-0 border border-gray-200 rounded py-2.5 px-2 sm:px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600" placeholder="ZIP" />
                    </div>
                    <textarea required value={form.address_line} onChange={e => setForm({...form, address_line: e.target.value})} className="w-full border border-gray-200 rounded py-2.5 px-4 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 resize-y" rows="3" placeholder="Full address"></textarea>
                    
                    <select required value={form.district} onChange={e => setForm({...form, district: e.target.value, thana: ''})} className="w-full border border-gray-200 rounded py-2.5 px-4 text-sm focus:outline-none focus:border-[#111827] bg-white appearance-none">
                      <option value="" disabled>Please select your parcel's district</option>
                      {districts.sort((a, b) => a.name.localeCompare(b.name)).map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>

                    <select required value={form.thana} onChange={e => setForm({...form, thana: e.target.value})} disabled={!form.district} className={`w-full border border-gray-200 rounded py-2.5 px-4 text-sm focus:outline-none focus:border-[#111827] bg-white appearance-none ${!form.district ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      <option value="" disabled>{!form.district ? 'Please select a district first' : "Please select your parcel's thana"}</option>
                      {filteredThanas.sort((a, b) => a.name.localeCompare(b.name)).map(u => (
                        <option key={u.id} value={u.name}>{u.name}</option>
                      ))}
                    </select>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4 flex items-start gap-3 w-full">
                      <div className="mt-0.5 shrink-0">
                        <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-amber-800 font-medium">Please double-check your location!</p>
                        <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed break-words">
                          Delivery failures often occur due to mismatched locations. Ensure your selected <strong>District</strong> and <strong>Thana</strong> match the detailed address written above.
                        </p>
                        <label className="flex items-start gap-2 mt-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={addressConfirmed}
                            onChange={(e) => setAddressConfirmed(e.target.checked)}
                            className="mt-0.5 shrink-0 accent-amber-600"
                          />
                          <span className="text-[11px] font-bold text-amber-900 leading-tight">
                            I confirm that my District and Thana exactly match my address.
                          </span>
                        </label>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={addressSaved ? null : handleSaveAddress} 
                      disabled={!addressConfirmed}
                      className={`w-full font-semibold py-3 rounded transition mt-2 text-sm flex items-center justify-center gap-2 ${
                        addressSaved 
                          ? 'bg-emerald-500 text-white cursor-default' 
                          : addressConfirmed 
                            ? 'bg-[#111] text-white hover:bg-black' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
                  <div className="p-4 border border-gray-200 rounded mt-6 text-sm text-gray-500">
                    No existing addresses found. Please add a new address.
                  </div>
                )}
              </div>
            </div>
            
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-5/12">
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
                <span className="font-semibold text-sm text-gray-800 dark:text-gray-200 block mb-3">Have a Promo Code?</span>
                {appliedPromo ? (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded p-3">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <Check size={16} />
                      <span className="text-sm font-medium">{appliedPromo.code} Applied ({appliedPromo.discountPercentage}%)</span>
                    </div>
                    <button type="button" onClick={handleRemovePromo} className="text-xs text-red-500 hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Enter code" 
                        className="flex-1 border border-gray-200 dark:border-gray-800 dark:bg-gray-900 rounded py-2 px-3 text-sm focus:outline-none focus:border-blue-600 uppercase"
                      />
                      <button type="button" onClick={handleApplyPromo} className="px-4 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm font-medium rounded hover:bg-black transition">Apply</button>
                    </div>
                    {promoError && <p className="text-xs text-red-500">{promoError}</p>}
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
                <div className="flex justify-between text-sm text-gray-600 border-b border-gray-200 pb-3 border-dashed">
                  <span>Delivery Charge</span>
                  <span className="font-semibold">{formatPrice(deliveryCharge)} BDT</span>
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
                  className="mt-1 shrink-0 accent-[#111827]" 
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I accept the <span className="text-blue-500">Terms & Conditions</span> outlined, including <span className="text-blue-500">Delivery, Refund</span>, and <span className="text-blue-500">Cancellation</span> Policies.
                </label>
              </div>

              <div className="flex justify-end mt-2">
                <button 
                  type={orderConfirmed ? 'button' : 'submit'}
                  disabled={!isFormValid && !orderConfirmed}
                  className={`font-sans font-normal text-[17px] py-[11px] px-[22px] rounded-apple-pill transition-opacity w-full flex items-center justify-center gap-2 ${
                    orderConfirmed 
                      ? 'bg-apple-accent/20 text-apple-accent cursor-default' 
                      : isFormValid 
                        ? 'bg-apple-accent hover:bg-apple-accent/90 text-white hover:opacity-80' 
                        : 'bg-apple-canvas border border-apple-hairline text-apple-muted cursor-not-allowed'
                  }`}
                >
                  {orderConfirmed ? (
                    <>
                      <Check size={18} strokeWidth={3} className="text-emerald-600" />
                      Confirmed
                    </>
                  ) : 'CONFIRM ORDER'}
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
    </div>
  );
}

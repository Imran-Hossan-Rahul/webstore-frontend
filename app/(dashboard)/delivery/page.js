"use client";
import React from 'react';
import Link from 'next/link';
import { Truck, Scale, Coins, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

export default function DeliveryPolicy() {
  return (
    <div className="min-h-screen pb-20 font-sans bg-white dark:bg-[#000000]">
      {/* Hero Section */}
      <div className="bg-[#f5f5f7] dark:bg-slate-900/50 pt-16 pb-12 border-b border-[#e8e8ed] dark:border-white/10">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-[#86868b] mb-6">
            <Link href="/" className="hover:text-[#1d1d1f] dark:hover:text-white transition">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#1d1d1f] dark:text-white">Delivery Policy</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight">
            Fast and Transparent <br className="hidden sm:block" /> Delivery Nationwide.
          </h1>
          <p className="mt-4 text-[17px] sm:text-[19px] text-[#424245] dark:text-gray-400 max-w-[600px] leading-relaxed">
            We believe in complete transparency. Our delivery charges are calculated automatically based on your location and the total weight of your items. No hidden fees.
          </p>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-[#f5f5f7] dark:bg-slate-800/50 p-6 rounded-2xl">
            <Truck size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Nationwide Coverage</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              We deliver to all 64 districts in Bangladesh safely and securely through our trusted logistics partners.
            </p>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-slate-800/50 p-6 rounded-2xl">
            <Scale size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Weight Based</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              Charges are strictly based on the total weight of your cart. We group items to keep your delivery cost as low as possible.
            </p>
          </div>
          <div className="bg-[#f5f5f7] dark:bg-slate-800/50 p-6 rounded-2xl">
            <Coins size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Cash on Delivery</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              Pay when you receive your product. A nominal 1% risk-handling fee is added for all Cash on Delivery orders.
            </p>
          </div>
        </div>

        {/* Zone Pricing */}
        <div className="mb-16">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-8">Delivery Zones & Base Rates</h2>
          
          <div className="space-y-6">
            
            {/* Inside Dhaka */}
            <div className="border border-[#e8e8ed] dark:border-gray-800 rounded-2xl p-6 sm:p-8 hover:shadow-sm transition bg-white dark:bg-[#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f] dark:text-white mb-1">Inside Dhaka City</h3>
                  <p className="text-[15px] text-[#86868b] dark:text-gray-400">Standard delivery within Dhaka metropolitan area</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <div className="text-[13px] font-semibold tracking-wider text-[#0071e3] uppercase bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full inline-block">Zone 1</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Up to 150g</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 55</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Up to 500g</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 65</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900/50">
                  <div className="text-[13px] text-[#0071e3] font-medium mb-1">Up to 1 KG (Standard)</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 75</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Over 1 KG</div>
                  <div className="text-[16px] font-semibold text-[#1d1d1f] dark:text-white mt-1">+৳20 <span className="text-[13px] font-normal text-gray-500">per extra KG</span></div>
                </div>
              </div>
            </div>

            {/* Sub-Urban */}
            <div className="border border-[#e8e8ed] dark:border-gray-800 rounded-2xl p-6 sm:p-8 hover:shadow-sm transition bg-white dark:bg-[#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f] dark:text-white mb-1">Sub-Urban Dhaka</h3>
                  <p className="text-[15px] text-[#86868b] dark:text-gray-400">Savar, Keraniganj, Dhamrai, Dohar, and Nawabganj</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <div className="text-[13px] font-semibold tracking-wider text-purple-600 uppercase bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full inline-block">Zone 2</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl border border-purple-200 dark:border-purple-900/30">
                  <div className="text-[13px] text-purple-600 dark:text-purple-400 font-medium mb-1">Up to 1 KG (Standard)</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 105</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Over 1 KG</div>
                  <div className="text-[16px] font-semibold text-[#1d1d1f] dark:text-white mt-1">+৳20 <span className="text-[13px] font-normal text-gray-500">per extra KG</span></div>
                </div>
              </div>
            </div>

            {/* Outside Dhaka */}
            <div className="border border-[#e8e8ed] dark:border-gray-800 rounded-2xl p-6 sm:p-8 hover:shadow-sm transition bg-white dark:bg-[#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div>
                  <h3 className="text-[22px] font-semibold text-[#1d1d1f] dark:text-white mb-1">Outside Dhaka (Nationwide)</h3>
                  <p className="text-[15px] text-[#86868b] dark:text-gray-400">All other districts and divisions across Bangladesh</p>
                </div>
                <div className="mt-4 sm:mt-0 text-left sm:text-right">
                  <div className="text-[13px] font-semibold tracking-wider text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full inline-block">Zone 3</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Up to 500g</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 115</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                  <div className="text-[13px] text-emerald-600 dark:text-emerald-400 font-medium mb-1">Up to 1 KG (Standard)</div>
                  <div className="text-[20px] font-semibold text-[#1d1d1f] dark:text-white">৳ 135</div>
                </div>
                <div className="bg-[#f5f5f7] dark:bg-slate-800/40 p-4 rounded-xl">
                  <div className="text-[13px] text-[#86868b] dark:text-gray-400 mb-1">Over 1 KG</div>
                  <div className="text-[16px] font-semibold text-[#1d1d1f] dark:text-white mt-1">+৳20 <span className="text-[13px] font-normal text-gray-500">per extra KG</span></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* How Weight Works */}
        <div className="mb-16">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-6">How Weight is Calculated</h2>
          <div className="prose prose-blue dark:prose-invert max-w-none">
            <p className="text-[16px] text-[#424245] dark:text-gray-300 leading-relaxed">
              Every product in our marketplace has a predefined maximum weight based on its category. When you add multiple items to your cart, our system calculates the <strong>total combined weight</strong> of all products.
            </p>
            <ul className="text-[16px] text-[#424245] dark:text-gray-300 space-y-3 mt-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>If you buy 3 items weighing 200g each, your total cart weight is <strong>600g</strong>.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>The system then looks at your selected delivery zone and applies the correct charge for 600g.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>If your total weight exceeds 1 KG, a flat rate of <strong>৳20</strong> is added for every additional KG (rounded up to the next full KG).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Cash on Delivery Fee */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="shrink-0 mt-1"><AlertCircle size={24} className="text-blue-600 dark:text-blue-400" /></div>
            <div>
              <h3 className="text-[20px] font-semibold text-blue-900 dark:text-blue-100 mb-3">Understanding the Cash on Delivery (COD) Fee</h3>
              <p className="text-[15px] text-blue-800/80 dark:text-blue-200/80 leading-relaxed mb-4">
                When you choose to pay via Cash on Delivery, a <strong>1% risk-handling fee</strong> is applied by our courier partners for collecting and processing the cash. This fee is calculated based on the <strong>total payable amount</strong> (Subtotal + Base Delivery Charge).
              </p>
              
              <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 sm:p-5 border border-blue-100/50 dark:border-blue-900/50">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 text-[14px] uppercase tracking-wider">Example Calculation</h4>
                <div className="space-y-2 text-[14px]">
                  <div className="flex justify-between text-blue-800 dark:text-blue-200">
                    <span>Products Subtotal</span>
                    <span>৳ 1,000</span>
                  </div>
                  <div className="flex justify-between text-blue-800 dark:text-blue-200">
                    <span>Base Delivery Charge (Outside Dhaka, 1KG)</span>
                    <span>৳ 135</span>
                  </div>
                  <div className="border-t border-blue-200/50 dark:border-blue-800/50 pt-2 flex justify-between font-medium text-blue-900 dark:text-blue-100">
                    <span>Subtotal + Delivery</span>
                    <span>৳ 1,135</span>
                  </div>
                  <div className="flex justify-between text-blue-600 dark:text-blue-400 font-semibold pt-2">
                    <span>COD Fee (1% of ৳1,135)</span>
                    <span>৳ 11.35 (Rounded to ৳11)</span>
                  </div>
                  <div className="border-t border-blue-200/50 dark:border-blue-800/50 mt-2 pt-3 flex justify-between text-[16px] font-bold text-blue-900 dark:text-blue-100">
                    <span>Total Amount Payable to Courier</span>
                    <span>৳ 1,146</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

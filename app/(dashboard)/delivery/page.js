"use client";
import React from 'react';
import Link from 'next/link';
import { Download, ShieldCheck, Tag, BookOpen, Globe, ChevronRight, CheckCircle2, Zap, Package } from 'lucide-react';

export default function DigitalDeliveryPolicy() {
  return (
    <div className="min-h-screen pb-20 font-sans bg-transparent">
      {/* Hero Section */}
      <div className="pt-16 pb-12 border-b border-[#e8e8ed] dark:border-white/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-[#86868b] mb-6">
            <Link href="/" className="hover:text-[#1d1d1f] dark:hover:text-white transition">Home</Link>
            <ChevronRight size={14} />
            <span className="text-[#1d1d1f] dark:text-white">Digital Delivery</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-[#1d1d1f] dark:text-white tracking-tight leading-tight">
            Instant Digital Delivery.<br className="hidden sm:block" /> Always.
          </h1>
          <p className="mt-4 text-[17px] sm:text-[19px] text-[#424245] dark:text-gray-400 max-w-[600px] leading-relaxed">
            All products on Codalina are delivered digitally. No shipping, no waiting. Your download is available the moment your purchase is confirmed.
          </p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 rounded-2xl">
            <Zap size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Instant Access</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              Download links are generated and attached to your order the moment payment is confirmed. No delays.
            </p>
          </div>
          <div className="p-6 rounded-2xl">
            <Tag size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Clear Licensing</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              Every product specifies a license type — Personal, Commercial, or Extended — before you purchase.
            </p>
          </div>
          <div className="p-6 rounded-2xl">
            <ShieldCheck size={32} className="text-[#0071e3] mb-4" strokeWidth={1.5} />
            <h3 className="text-[19px] font-semibold text-[#1d1d1f] dark:text-white mb-2">Secure Downloads</h3>
            <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">
              Download links are authenticated and tied to your account. Files are never publicly accessible.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-8">How It Works</h2>
          <div className="space-y-4">
            {[
              { step: '1', icon: Package, title: 'Browse & Purchase', desc: 'Choose your product and complete the checkout. A confirmation may be made for digital orders.' },
              { step: '2', icon: CheckCircle2, title: 'Order Confirmed', desc: 'Once your order is marked Confirmed by our team, the download link is attached to your order in the system.' },
              { step: '3', icon: Download, title: 'Download from Your Orders', desc: 'Visit your Orders page and click the Download button next to the fulfilled order. The file is yours to keep.' },
              { step: '4', icon: BookOpen, title: 'Read the Docs', desc: 'Every product includes documentation links. Use them to get started quickly and get the most from your purchase.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="border border-[#e8e8ed] dark:border-gray-800 rounded-2xl p-6 sm:p-8 flex items-start gap-5">
                <div className="shrink-0 w-10 h-10 rounded-full bg-[#0071e3] text-white flex items-center justify-center font-bold text-[16px]">{step}</div>
                <div>
                  <h3 className="text-[18px] font-semibold text-[#1d1d1f] dark:text-white mb-1 flex items-center gap-2">
                    <Icon size={18} strokeWidth={1.5} className="text-[#0071e3]" /> {title}
                  </h3>
                  <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License Types */}
        <div className="mb-16">
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1d1d1f] dark:text-white tracking-tight mb-8">License Types Explained</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { type: 'Personal', color: 'border-gray-300 dark:border-gray-700', badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', desc: 'Use the product in personal, non-commercial projects. You may not sell, redistribute, or use in client work.' },
              { type: 'Commercial', color: 'border-blue-300 dark:border-blue-900', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', desc: 'Use in client projects and commercial products. Perfect for freelancers and agencies.' },
              { type: 'Extended', color: 'border-amber-300 dark:border-amber-900', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', desc: 'You may resell or include this product in items sold to end-users (e.g., bundled in a SaaS product or theme marketplace).' },
            ].map(({ type, color, badge, desc }) => (
              <div key={type} className={`border-2 ${color} rounded-2xl p-6`}>
                <span className={`inline-block px-3 py-1 rounded-full text-[13px] font-semibold mb-4 ${badge}`}>{type} License</span>
                <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Refund Policy */}
        <div className="border border-[#e8e8ed] dark:border-gray-800 rounded-2xl p-8 bg-[#f5f5f7] dark:bg-slate-900/50">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] dark:text-white mb-4">Refund Policy for Digital Products</h2>
          <p className="text-[15px] text-[#424245] dark:text-gray-400 leading-relaxed mb-4">
            Because digital products are delivered instantly and cannot be returned, all sales are final once the download has been served. However, we offer refunds in the following cases:
          </p>
          <ul className="space-y-2 mb-6">
            {[
              'The product files are corrupted or incomplete.',
              'The product description was materially misleading.',
              'A technical issue prevented you from accessing the download within 48 hours of confirmed order.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[15px] text-[#1d1d1f] dark:text-gray-300">
                <CheckCircle2 size={18} className="text-[#0071e3] mt-0.5 shrink-0" strokeWidth={1.5} />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[14px] text-[#86868b]">
            To request a refund, contact us at{' '}
            <a href="mailto:info@codalina.com" className="text-[#0071e3] hover:underline">info@codalina.com</a>
            {' '}with your order ID.
          </p>
        </div>

      </div>
    </div>
  );
}

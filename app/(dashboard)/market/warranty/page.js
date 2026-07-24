"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, RotateCcw, AlertTriangle, CheckCircle2, XCircle, ChevronDown, Phone, Mail, ArrowLeft, Package, Clock, Star, Wrench, HelpCircle } from "lucide-react";

const Section = ({ id, icon: Icon, color, title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={22} className="text-white" />
          </div>
          <h2 className="text-[17px] font-bold text-gray-900 dark:text-white group-hover:text-[#111827] transition">{title}</h2>
        </div>
        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/10 pt-5">{children}</div>}
    </div>
  );
};

const CheckItem = ({ children }) => (
  <li className="flex items-start gap-3 text-[14px] text-gray-700 dark:text-gray-300">
    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
);

const CrossItem = ({ children }) => (
  <li className="flex items-start gap-3 text-[14px] text-gray-700 dark:text-gray-300">
    <XCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
    <span>{children}</span>
  </li>
);

const StepBadge = ({ num, label }) => (
  <div className="flex items-start gap-4">
    <div className="w-9 h-9 rounded-full bg-[#111827]/20 text-[#4b5563] font-bold text-[15px] flex items-center justify-center shrink-0 mt-0.5">{num}</div>
    <p className="text-[14px] text-gray-700 dark:text-gray-300 pt-1.5">{label}</p>
  </div>
);

export default function WarrantyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pb-20">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle at 30% 50%, #111827 0%, transparent 60%), radial-gradient(circle at 80% 20%, #60a5fa 0%, transparent 50%)'}}/>
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#111827]/10 border border-[#111827]/30 text-[#111827] text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            <ShieldCheck size={14} /> Codalina Marketplace
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Warranty & <span className="text-[#111827]">Return Policy</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-xl mx-auto leading-relaxed">
            We stand behind every product we sell. If something goes wrong, we&apos;ll make it right — simple, honest, no hassle.
          </p>
          <p className="text-slate-500 text-xs mt-4">Last updated: July 2026</p>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-8 mb-10 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: RotateCcw,    label: '14-Day Replacement',  sub: 'Hardware defects',        color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
            { icon: Clock,        label: '3–7 Working Days',    sub: 'Repair turnaround',        color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/30' },
            { icon: Package,      label: 'Original Box Required', sub: 'Bring it with you',      color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-950/30' },
            { icon: Star,         label: 'Real Support',        sub: 'Talk to a real person',    color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/30' },
          ].map(({ icon: Icon, label, sub, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 border border-white/60 dark:border-white/5 text-center shadow-sm`}>
              <Icon size={22} className={`${color} mx-auto mb-2`} />
              <p className="font-bold text-gray-900 dark:text-white text-[13px] leading-tight">{label}</p>
              <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-4">

        {/* ── Our Promise ── */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 p-6">
          <h2 className="text-[15px] font-bold text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
            <Star size={16} /> Our Promise to You
          </h2>
          <p className="text-[14px] text-emerald-900 dark:text-emerald-200 leading-relaxed">
            Codalina is a growing marketplace that genuinely cares about its customers. We are not a faceless corporation —
            we are a small, dedicated team that personally checks every product before it ships. If you receive something
            defective or not as described, <strong>we will fix it, replace it, or refund it</strong>. That is our commitment to you.
          </p>
        </div>

        {/* ── 1. General Warranty ── */}
        <Section id="general" icon={ShieldCheck} color="bg-emerald-500" title="1. General Warranty — All Products" defaultOpen={true}>
          <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
            Every product sold on Codalina comes with a standard warranty. The specific duration depends on the product category and is clearly displayed on each product page.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3">✅ What&apos;s Covered</p>
              <ul className="space-y-2">
                <CheckItem>Manufacturing defects and hardware failures</CheckItem>
                <CheckItem>14-day instant replacement for any hardware issue from date of purchase</CheckItem>
                <CheckItem>Internal component failures (display, battery, motherboard) under warranty period</CheckItem>
                <CheckItem>Product not matching the description at time of purchase</CheckItem>
                <CheckItem>Dead-on-arrival (DOA) products — immediate replacement</CheckItem>
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-bold text-red-500 uppercase tracking-wider mb-3">❌ What&apos;s NOT Covered</p>
              <ul className="space-y-2">
                <CrossItem>Physical damage (drops, cracks, bends, dents)</CrossItem>
                <CrossItem>Water or liquid damage</CrossItem>
                <CrossItem>Fire or electrical surge damage</CrossItem>
                <CrossItem>Cosmetic wear and tear (scratches, discoloration)</CrossItem>
                <CrossItem>Software bugs, app crashes, or OS update issues</CrossItem>
                <CrossItem>Accessories in the box (charger, cable, earphones)</CrossItem>
                <CrossItem>Products repaired by unauthorized third parties</CrossItem>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── 2. Replacement Policy ── */}
        <Section id="replacement" icon={RotateCcw} color="bg-blue-500" title="2. Replacement & Exchange Policy">
          <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
            We want you to be completely satisfied. If a product has a verified defect, here is how we handle it:
          </p>
          <div className="space-y-4 mb-5">
            {[
              { title: '0–14 Days from Purchase', desc: 'Instant replacement for any hardware defect. Bring your product and original box to us — we will swap it on the spot if the replacement is in stock, or within 3–7 working days if not.', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300', badgeText: 'Best Window' },
              { title: '15 Days – Warranty Period End', desc: 'Free repair service for covered hardware issues. Parts cost is covered under warranty. Turnaround time is 3–21 working days depending on parts availability.', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', badgeText: 'Repair Covered' },
              { title: 'Color / Model / Storage Change', desc: 'You may exchange for a different variant within 30 days. A price difference adjustment applies. No deduction fee — you only pay or receive the price difference.', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', badgeText: '30-Day Window' },
            ].map(({ title, desc, badge, badgeText }) => (
              <div key={title} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${badge}`}>{badgeText}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[14px] mb-1">{title}</p>
                  <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 3. Product-Specific Warranty ── */}
        <Section id="categories" icon={Package} color="bg-purple-500" title="3. Warranty by Product Category">
          <div className="space-y-3">
            {[
              { cat: 'Smartphones & Tablets',  warranty: 'As stated on product page (typically 1 Year Brand Warranty)',        note: '14-day hardware replacement guaranteed' },
              { cat: 'Laptops & Computers',    warranty: 'As stated on product page (typically 1 Year Brand Warranty)',        note: '14-day hardware replacement guaranteed' },
              { cat: 'Smartwatches & Wearables', warranty: '3–12 months (stated per product)',                                note: 'Battery and sensor coverage included' },
              { cat: 'Audio & Headphones',     warranty: '3–12 months (stated per product)',                                  note: 'Driver and hardware failures covered' },
              { cat: 'Accessories & Cables',   warranty: 'No warranty (unless explicitly stated)',                            note: 'Please check before purchase' },
              { cat: 'Smart Home & Gadgets',   warranty: '3–12 months (stated per product)',                                  note: 'Internal component failures covered' },
            ].map(({ cat, warranty, note }) => (
              <div key={cat} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-[14px]">{cat}</p>
                  <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{note}</p>
                </div>
                <span className="shrink-0 text-[12px] font-semibold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full">{warranty}</span>
              </div>
            ))}
          </div>
          <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-4 italic">
            * Always check the individual product page for the exact warranty duration and terms for that specific item.
          </p>
        </Section>

        {/* ── 4. How to Claim ── */}
        <Section id="claim" icon={Wrench} color="bg-amber-500" title="4. How to Claim Your Warranty">
          <p className="text-[14px] text-gray-600 dark:text-gray-400 mb-5">Claiming warranty with Codalina is straightforward. Just follow these steps:</p>
          <div className="space-y-4 mb-5">
            <StepBadge num="1" label="Contact us via WhatsApp, phone, or email (details below). Describe the issue and share photos/videos of the defect." />
            <StepBadge num="2" label="Our support team will verify your claim and guide you on whether to visit us in person or arrange a pickup/courier." />
            <StepBadge num="3" label="Bring (or send) the product with its original box and a valid purchase receipt. Accessories are not required unless relevant." />
            <StepBadge num="4" label="Our technician will diagnose the product. You will receive a status update within 24 hours of inspection." />
            <StepBadge num="5" label="We repair, replace, or exchange the product within the stated timeframe and notify you when it is ready." />
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 p-4">
            <p className="text-[13px] text-amber-800 dark:text-amber-300 font-semibold mb-1 flex items-center gap-2"><AlertTriangle size={14}/> Important Reminder</p>
            <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Please inspect your product thoroughly before leaving. Codalina will not be responsible for cosmetic damage (scratches, dents) reported after the product has left our hands or been delivered.
            </p>
          </div>
        </Section>

        {/* ── 5. General Terms ── */}
        <Section id="terms" icon={AlertTriangle} color="bg-rose-500" title="5. General Terms & Conditions">
          <ul className="space-y-3">
            {[
              'Warranty is valid only for the original purchaser. It is non-transferable.',
              'Original packaging (box) must be retained and presented for all warranty claims.',
              'Any repair or modification by an unauthorized service center will void the warranty immediately.',
              'Codalina is not responsible for data loss. Please back up your data before handing in any device.',
              'Software issues, OS update failures, third-party app bugs, and gaming-related problems are not covered.',
              'Warranty activation is automatic from the date of purchase. No registration required.',
              'Codalina reserves the right to make the final decision on all warranty claims based on technical inspection.',
              'If a UV glass/screen protector has been applied and causes or conceals damage, warranty may be affected.',
              'Accidental damage (drops, pressure, liquid) is excluded from all standard warranty coverage.',
              'In the event a replacement unit is not available, Codalina may offer store credit of equal value.',
            ].map(t => (
              <li key={t} className="flex items-start gap-3 text-[14px] text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-2 shrink-0"/>
                {t}
              </li>
            ))}
          </ul>
        </Section>

        {/* ── FAQ ── */}
        <Section id="faq" icon={HelpCircle} color="bg-indigo-500" title="6. Frequently Asked Questions">
          <div className="space-y-5">
            {[
              { q: 'Do I need a receipt to claim warranty?', a: 'Your order from Codalina serves as your proof of purchase. If you can share the Order ID, that is enough.' },
              { q: 'What if my product arrives damaged?', a: 'Contact us within 24 hours of delivery with photos. We will arrange an immediate replacement or pickup at no cost to you.' },
              { q: 'Can I get a refund instead of a replacement?', a: 'Refunds are handled on a case-by-case basis. For DOA products or significantly misrepresented items, a full refund is possible within 7 days.' },
              { q: 'Does the warranty transfer if I sell the product?', a: 'No. Warranty is valid only for the original buyer from Codalina. It cannot be transferred.' },
              { q: 'What if the same issue occurs after repair?', a: 'If the same hardware defect recurs within 90 days of repair, it will be fixed again at no charge.' },
              { q: 'How do I track my repair status?', a: 'We will keep you informed via WhatsApp/phone throughout the repair process. You can also contact our support team anytime.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-semibold text-gray-900 dark:text-white text-[14px] mb-1.5">{q}</p>
                <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed pl-3 border-l-2 border-indigo-300 dark:border-indigo-700">{a}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Contact Card ── */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-center">
          <ShieldCheck size={36} className="text-[#111827] mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">Need Help with a Warranty Claim?</h3>
          <p className="text-slate-400 text-[14px] mb-6 max-w-sm mx-auto">
            Our support team is real people who genuinely want to help. Reach out anytime — we typically respond within a few hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="tel:+8801969991122" className="inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#374151] text-slate-900 font-bold px-6 py-3 rounded-xl transition text-[14px]">
              <Phone size={16} /> Call Support
            </a>
            <a href="mailto:support@codalina.com" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition text-[14px] border border-white/10">
              <Mail size={16} /> Email Us
            </a>
          </div>
          <p className="text-slate-500 text-[12px] mt-4">support@codalina.com &nbsp;·&nbsp; 01969 991 122</p>
        </div>

        {/* ── Back ── */}
        <div className="flex justify-center pt-2">
          <Link href="/market" className="inline-flex items-center gap-2 text-[14px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition">
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
        </div>

      </div>
    </div>
  );
}

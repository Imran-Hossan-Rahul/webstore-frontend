"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, ChevronDown, Shield, Users, ShoppingBag, AlertTriangle, Lock, RotateCcw, Gavel, Globe, Mail, Phone, CheckCircle2, XCircle, Eye, CreditCard } from "lucide-react";

const TOC_ITEMS = [
  { id: 'acceptance',    label: '1. Acceptance of Terms' },
  { id: 'eligibility',   label: '2. Eligibility & Account' },
  { id: 'purchases',     label: '3. Purchases & Payments' },
  { id: 'products',      label: '4. Products & Listings' },
  { id: 'prohibited',    label: '5. Prohibited Activities' },
  { id: 'privacy',       label: '6. Privacy & Data' },
  { id: 'ip',            label: '7. Intellectual Property' },
  { id: 'liability',     label: '8. Liability & Disclaimers' },
  { id: 'termination',   label: '9. Account Termination' },
  { id: 'governing',     label: '10. Governing Law' },
  { id: 'changes',       label: '11. Changes to Terms' },
  { id: 'contact',       label: '12. Contact Us' },
];

const Section = ({ id, icon: Icon, color, title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div id={id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden scroll-mt-20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left group"
      >
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
            <Icon size={20} className="text-white" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900 dark:text-white group-hover:text-[#111827] transition">{title}</h2>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-opacity duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/10 pt-5 space-y-3 text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const Clause = ({ children }) => (
  <p className="flex items-start gap-3">
    <span className="w-1.5 h-1.5 rounded-full bg-[#111827] mt-2 shrink-0" />
    <span>{children}</span>
  </p>
);

const Highlight = ({ children, color = 'amber' }) => {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300',
    red:   'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300',
    blue:  'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-300',
  };
  return (
    <div className={`rounded-xl border p-4 text-[13px] leading-relaxed ${colors[color]}`}>
      {children}
    </div>
  );
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pb-20">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #818cf8 0%, transparent 60%), radial-gradient(circle at 80% 30%, #111827 0%, transparent 50%)' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            <Gavel size={14} /> Legal Document
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Terms & <span className="text-[#111827]">Conditions</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-xl mx-auto leading-relaxed">
            By using Codalina, you agree to these terms. Please read them carefully — we&apos;ve written them in plain language so they&apos;re easy to understand.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-slate-500 text-[12px]">
            <span>📅 Last Updated: July 2026</span>
            <span>·</span>
            <span>🌐 Applies to: codalina.com</span>
            <span>·</span>
            <span>📍 Bangladesh</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sticky Table of Contents ── */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm p-5">
              <p className="text-[12px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText size={12} /> Table of Contents
              </p>
              <nav className="space-y-1">
                {TOC_ITEMS.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className="block text-[13px] text-gray-600 dark:text-gray-400 hover:text-[#111827] dark:hover:text-[#111827] hover:bg-[#111827]/5 px-3 py-1.5 rounded-lg transition"
                  >
                    {label}
                  </a>
                ))}
              </nav>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/10">
                <Link href="/warranty" className="text-[12px] text-blue-500 hover:underline block">→ Warranty Policy</Link>
                <Link href="/" className="text-[12px] text-gray-400 hover:underline block mt-1">→ Back to Marketplace</Link>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 space-y-4">

            {/* Intro Box */}
            <Highlight color="blue">
              <strong>Welcome to Codalina.</strong> These Terms & Conditions (&quot;Terms&quot;) govern your use of our website, platform, and services. By accessing or using Codalina (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms. If you do not agree, please do not use our services.
            </Highlight>

            {/* 1 */}
            <Section id="acceptance" icon={CheckCircle2} color="bg-emerald-500" title="1. Acceptance of Terms">
              <Clause>By creating an account, placing an order, or simply browsing Codalina, you confirm that you have read, understood, and agreed to these Terms and our Privacy Policy.</Clause>
              <Clause>These Terms apply to all visitors, users, and customers of Codalina — whether you are purchasing a product, using our community features, or just browsing the marketplace.</Clause>
              <Clause>We reserve the right to update these Terms at any time. Continued use of the platform after changes means you accept the updated Terms.</Clause>
              <Highlight color="amber">
                <strong>Plain English:</strong> By using Codalina, you&apos;re agreeing to follow these rules. It&apos;s like agreeing to the house rules when you enter a store.
              </Highlight>
            </Section>

            {/* 2 */}
            <Section id="eligibility" icon={Users} color="bg-blue-500" title="2. Eligibility & Account Registration">
              <Clause>You must be at least 13 years old to use Codalina. If you are under 18, you should have parental or guardian consent for purchases.</Clause>
              <Clause>You agree to provide accurate, complete, and current information when creating an account. Providing false information may result in account suspension.</Clause>
              <Clause>You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with anyone.</Clause>
              <Clause>You are responsible for all activity that occurs under your account. If you suspect unauthorized access, contact us immediately.</Clause>
              <Clause>Codalina reserves the right to refuse account registration or terminate accounts that violate these Terms, at our sole discretion.</Clause>
              <Clause>Each person may only hold one active account. Duplicate accounts may be merged or removed.</Clause>
            </Section>

            {/* 3 */}
            <Section id="purchases" icon={CreditCard} color="bg-violet-500" title="3. Purchases, Payments & Orders">
              <Clause>All prices listed on Codalina are in Bangladeshi Taka (BDT) and are inclusive of applicable taxes unless stated otherwise.</Clause>
              <Clause>Codalina currently operates on a <strong>Cash on Delivery (COD)</strong> basis. Payment is collected upon delivery of the product.</Clause>
              <Clause>By placing an order, you confirm that all information provided (name, address, phone number) is accurate. Incorrect information may delay or cancel your delivery.</Clause>
              <Clause>Orders can be cancelled before they are marked as &quot;Shipped.&quot; Once shipped, cancellation is subject to our return and warranty policy.</Clause>
              <Clause>Codalina reserves the right to cancel or refuse any order at its discretion — for example, if a pricing error occurs or the product becomes unavailable. You will be notified promptly and not charged.</Clause>
              <Clause>Delivery timelines are estimates only. Codalina is not liable for delays caused by courier services, weather, or other external factors beyond our control.</Clause>
              <Highlight color="amber">
                <strong>Note on COD:</strong> Please ensure you are available to receive your order. If a delivery attempt fails twice, the order may be returned and redelivery charges will apply.
              </Highlight>
            </Section>

            {/* 4 */}
            <Section id="products" icon={ShoppingBag} color="bg-amber-500" title="4. Products, Listings & Accuracy">
              <Clause>Codalina strives to display product information, images, and specifications as accurately as possible. However, minor variations in color or appearance may occur due to screen settings.</Clause>
              <Clause>All products listed are subject to availability. Codalina does not guarantee that any product will remain in stock.</Clause>
              <Clause>Product specifications, pricing, and availability are subject to change without prior notice.</Clause>
              <Clause>If a product you ordered becomes unavailable after purchase, we will contact you to offer an alternative or full refund.</Clause>
              <Clause>Codalina does not sell counterfeit or unauthorized products. All items are sourced from legitimate suppliers.</Clause>
            </Section>

            {/* 5 */}
            <Section id="prohibited" icon={XCircle} color="bg-rose-500" title="5. Prohibited Activities">
              <p className="text-gray-600 dark:text-gray-400 mb-3">The following activities are strictly prohibited on Codalina:</p>
              {[
                'Placing fraudulent orders or providing false delivery information intentionally.',
                'Attempting to hack, reverse-engineer, or disrupt our platform or servers.',
                'Using automated bots or scrapers to access our website or data.',
                'Posting false reviews, misleading content, or spam.',
                'Attempting to resell products purchased from Codalina without authorization.',
                'Using Codalina to engage in any illegal activity under Bangladeshi law.',
                'Harassing, threatening, or abusing Codalina staff or other users.',
                'Creating multiple accounts to abuse promotions, discounts, or warranty claims.',
              ].map(t => (
                <p key={t} className="flex items-start gap-3">
                  <XCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
                  <span>{t}</span>
                </p>
              ))}
              <Highlight color="red">
                Violations may result in immediate account suspension, order cancellation, and — where applicable — legal action.
              </Highlight>
            </Section>

            {/* 6 */}
            <Section id="privacy" icon={Lock} color="bg-slate-600" title="6. Privacy & Data">
              <Clause>Codalina collects personal information (name, email, phone, address) solely to process orders, provide support, and improve our services.</Clause>
              <Clause>We do not sell, rent, or share your personal data with third parties for marketing purposes.</Clause>
              <Clause>Your data is stored securely and protected using industry-standard encryption practices.</Clause>
              <Clause>By placing an order, you consent to us sharing your delivery details (name, address, phone) with our courier partner for the sole purpose of fulfilling your order.</Clause>
              <Clause>You have the right to request deletion of your account and associated data at any time by contacting us.</Clause>
              <Clause>Codalina may use cookies to improve your browsing experience. You can disable cookies in your browser settings, though some features may not function correctly.</Clause>
              <Clause>We may send you transactional messages (order confirmation, delivery updates) via email or SMS. These are not promotional and cannot be opted out of while an order is active.</Clause>
            </Section>

            {/* 7 */}
            <Section id="ip" icon={Eye} color="bg-indigo-500" title="7. Intellectual Property">
              <Clause>All content on Codalina — including logos, text, images, UI design, product descriptions, and code — is the intellectual property of Codalina or its respective licensors.</Clause>
              <Clause>You may not reproduce, copy, distribute, or use any Codalina content for commercial purposes without written permission.</Clause>
              <Clause>Product images provided by manufacturers or suppliers remain the property of their respective owners.</Clause>
              <Clause>User-submitted content (reviews, profile pictures) remains yours, but by submitting it you grant Codalina a non-exclusive license to display it on our platform.</Clause>
            </Section>

            {/* 8 */}
            <Section id="liability" icon={Shield} color="bg-orange-500" title="8. Limitation of Liability & Disclaimers">
              <Clause>Codalina provides its services &quot;as is&quot; without any express or implied warranties regarding uninterrupted access or error-free operation.</Clause>
              <Clause>To the fullest extent permitted by law, Codalina is not liable for any indirect, incidental, or consequential damages arising from the use of our platform.</Clause>
              <Clause>Codalina&apos;s maximum liability to any customer shall not exceed the total amount paid for the specific order in question.</Clause>
              <Clause>We are not responsible for delays, losses, or damage caused by third-party courier services once the package has been handed over for delivery.</Clause>
              <Clause>Codalina is not liable for data loss resulting from device repair or replacement. Customers must back up their data prior to submitting a device.</Clause>
              <Highlight color="amber">
                Our goal is always to make things right. If something goes wrong, please contact us first — we will do our best to resolve it fairly.
              </Highlight>
            </Section>

            {/* 9 */}
            <Section id="termination" icon={AlertTriangle} color="bg-red-500" title="9. Account Termination">
              <Clause>You may deactivate your account at any time by contacting our support team or through your account settings.</Clause>
              <Clause>Codalina reserves the right to suspend or permanently terminate your account without prior notice if you violate these Terms.</Clause>
              <Clause>Upon termination, your right to use the platform ceases immediately. Outstanding orders will still be fulfilled unless there is an active dispute.</Clause>
              <Clause>We may retain certain data for legal or compliance purposes even after account termination, as required by law.</Clause>
            </Section>

            {/* 10 */}
            <Section id="governing" icon={Gavel} color="bg-teal-600" title="10. Governing Law & Disputes">
              <Clause>These Terms are governed by and construed in accordance with the laws of the People&apos;s Republic of Bangladesh.</Clause>
              <Clause>Any disputes arising from the use of Codalina shall first be attempted to be resolved through good-faith negotiation between the parties.</Clause>
              <Clause>If a dispute cannot be resolved informally, it shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.</Clause>
              <Clause>Codalina is committed to fair resolution of any customer concern. Please reach out to us before pursuing formal legal action.</Clause>
            </Section>

            {/* 11 */}
            <Section id="changes" icon={RotateCcw} color="bg-purple-500" title="11. Changes to These Terms">
              <Clause>Codalina may update these Terms from time to time. The &quot;Last Updated&quot; date at the top of this page will reflect the most recent revision.</Clause>
              <Clause>For significant changes, we will notify registered users via email or an in-platform notification at least 7 days before the changes take effect.</Clause>
              <Clause>Your continued use of Codalina after the effective date of updated Terms constitutes your acceptance of the changes.</Clause>
              <Clause>If you disagree with any changes, you may terminate your account before the changes take effect.</Clause>
            </Section>

            {/* 12 – Contact */}
            <Section id="contact" icon={Globe} color="bg-sky-500" title="12. Contact Us">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions about these Terms, wish to report a violation, or need legal clarification, please contact us through any of the following channels:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Mail,  label: 'Email', value: 'support@codalina.com', href: 'mailto:support@codalina.com' },
                  { icon: Phone, label: 'Phone / WhatsApp', value: '01969 991 122', href: 'tel:+8801969991122' },
                  { icon: Globe, label: 'Website', value: 'www.codalina.com', href: 'https://codalina.com' },
                  { icon: FileText, label: 'Registered In', value: 'Dhaka, Bangladesh', href: null },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="w-9 h-9 bg-[#111827]/15 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-[#4b5563]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                      {href ? (
                        <a href={href} className="text-[14px] font-semibold text-gray-900 dark:text-white hover:text-[#111827] transition">{value}</a>
                      ) : (
                        <p className="text-[14px] font-semibold text-gray-900 dark:text-white">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Bottom Agreement Banner */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-center">
              <Gavel size={32} className="text-[#111827] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-2">By using Codalina, you agree to these Terms.</h3>
              <p className="text-slate-400 text-[13px] max-w-md mx-auto mb-5">
                We believe in transparency and fair dealing. If anything here is unclear or you need help, just ask — we&apos;re real people who want to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/" className="inline-flex items-center justify-center gap-2 bg-[#111827] hover:bg-[#374151] text-slate-900 font-bold px-6 py-2.5 rounded-xl transition text-[14px]">
                  <ShoppingBag size={16}/> Continue Shopping
                </Link>
                <Link href="/warranty" className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition text-[14px] border border-white/10">
                  <Shield size={16}/> View Warranty Policy
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

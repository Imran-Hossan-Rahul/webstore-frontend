"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield, ChevronDown, Lock, Eye, Database, Share2, UserCheck, 
  Settings, Mail, Globe, AlertTriangle, FileText, CheckCircle2
} from 'lucide-react';

const TOC_ITEMS = [
  { id: 'collection',    label: '1. Information We Collect' },
  { id: 'usage',         label: '2. How We Use Your Data' },
  { id: 'sharing',       label: '3. Data Sharing & Disclosure' },
  { id: 'security',      label: '4. Data Security' },
  { id: 'cookies',       label: '5. Cookies & Tracking' },
  { id: 'rights',        label: '6. Your Privacy Rights' },
  { id: 'children',      label: '7. Children\'s Privacy' },
  { id: 'changes',       label: '8. Changes to Policy' },
  { id: 'contact',       label: '9. Contact Us' },
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
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
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

const Highlight = ({ children, color = 'emerald' }) => {
  const colors = {
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300',
    red:   'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300',
    emerald:  'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300',
  };
  return (
    <div className={`rounded-xl border p-4 text-[13px] leading-relaxed ${colors[color]}`}>
      {children}
    </div>
  );
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 pb-20">

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #10b981 0%, transparent 60%), radial-gradient(circle at 20% 30%, #111827 0%, transparent 50%)' }}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-16 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5 tracking-wider uppercase">
            <Shield size={14} /> Data Protection
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Privacy <span className="text-[#111827]">Policy</span>
          </h1>
          <p className="text-slate-400 text-[15px] max-w-xl mx-auto leading-relaxed">
            Your privacy matters to us. We believe in being transparent about how we collect, use, and protect your personal data.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6 text-slate-500 text-[12px]">
            <span>📅 Last Updated: July 2026</span>
            <span>·</span>
            <span>🌐 Applies to: codalina.com</span>
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
                <Link href="/market/terms" className="text-[12px] text-blue-500 hover:underline block">→ Terms & Conditions</Link>
                <Link href="/market/warranty" className="text-[12px] text-blue-500 hover:underline block mt-1">→ Warranty Policy</Link>
                <Link href="/market" className="text-[12px] text-gray-400 hover:underline block mt-1">→ Back to Marketplace</Link>
              </div>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 space-y-4">

            {/* Intro Box */}
            <Highlight color="emerald">
              <strong>Our Privacy Promise:</strong> Codalina respects your personal data. We only collect what we need to serve you better, and we <strong>never</strong> sell your information to third parties.
            </Highlight>

            {/* 1 */}
            <Section id="collection" icon={Database} color="bg-blue-500" title="1. Information We Collect">
              <Clause><strong>Personal Information:</strong> When you register or place an order, we collect your name, email address, phone number, and delivery address.</Clause>
              <Clause><strong>Usage Data:</strong> We automatically collect information about how you use our website, including your IP address, browser type, device information, and pages visited.</Clause>
              <Clause><strong>Communication Data:</strong> We retain records of your communications with our customer support team for quality assurance and issue resolution.</Clause>
            </Section>

            {/* 2 */}
            <Section id="usage" icon={Settings} color="bg-indigo-500" title="2. How We Use Your Data">
              <Clause>To process and fulfill your orders, including delivery and payment processing.</Clause>
              <Clause>To communicate with you regarding order updates, shipping status, and customer support.</Clause>
              <Clause>To improve our website, products, and services based on user behavior and feedback.</Clause>
              <Clause>To prevent fraud, abuse, and unauthorized access to our platform.</Clause>
              <Highlight color="amber">
                We will only use your data for the purposes outlined here. We do not use your personal information for unrelated marketing without your consent.
              </Highlight>
            </Section>

            {/* 3 */}
            <Section id="sharing" icon={Share2} color="bg-purple-500" title="3. Data Sharing & Disclosure">
              <Clause><strong>Service Providers:</strong> We share necessary details (like your name, phone, and address) with our trusted courier partners (e.g., Pathao, Steadfast) solely for delivering your order.</Clause>
              <Clause><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or government regulation.</Clause>
              <Clause><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred to the new owning entity.</Clause>
              <Clause>We strictly <strong>do not sell, rent, or trade</strong> your personal information to third parties for their own marketing purposes.</Clause>
            </Section>

            {/* 4 */}
            <Section id="security" icon={Lock} color="bg-emerald-600" title="4. Data Security">
              <Clause>We implement industry-standard security measures, including encryption and secure servers, to protect your personal data from unauthorized access, alteration, or disclosure.</Clause>
              <Clause>While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure.</Clause>
              <Clause>You are responsible for keeping your account password confidential. Do not share it with anyone.</Clause>
            </Section>

            {/* 5 */}
            <Section id="cookies" icon={Eye} color="bg-amber-500" title="5. Cookies & Tracking Technologies">
              <Clause>Codalina uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic.</Clause>
              <Clause>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our website may not function properly.</Clause>
            </Section>

            {/* 6 */}
            <Section id="rights" icon={UserCheck} color="bg-sky-500" title="6. Your Privacy Rights">
              <Clause><strong>Access & Update:</strong> You can review and update your personal information at any time by logging into your account settings.</Clause>
              <Clause><strong>Data Deletion:</strong> You have the right to request the deletion of your account and personal data. Please contact support to initiate this process.</Clause>
              <Clause><strong>Opt-Out:</strong> You may opt-out of receiving non-essential promotional communications, though we will still send critical transactional messages (like order updates).</Clause>
            </Section>

            {/* 7 */}
            <Section id="children" icon={UserCheck} color="bg-rose-500" title="7. Children's Privacy">
              <Clause>Codalina is not intended for use by children under the age of 13. We do not knowingly collect personal identifiable information from children under 13.</Clause>
              <Clause>If we discover that a child under 13 has provided us with personal information, we will immediately delete such information from our servers.</Clause>
            </Section>

            {/* 8 */}
            <Section id="changes" icon={AlertTriangle} color="bg-orange-500" title="8. Changes to This Policy">
              <Clause>We may update our Privacy Policy periodically to reflect changes in our practices or legal requirements.</Clause>
              <Clause>We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.</Clause>
              <Clause>You are advised to review this Privacy Policy periodically for any changes.</Clause>
            </Section>

            {/* 9 – Contact */}
            <Section id="contact" icon={Globe} color="bg-teal-600" title="9. Contact Us">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Mail,  label: 'Email', value: 'privacy@codalina.com', href: 'mailto:privacy@codalina.com' },
                  { icon: Shield, label: 'Support', value: '01969 991 122', href: 'tel:+8801969991122' },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="w-9 h-9 bg-[#111827]/15 rounded-lg flex items-center justify-center">
                      <Icon size={16} className="text-[#4b5563]" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                      <a href={href} className="text-[14px] font-semibold text-gray-900 dark:text-white hover:text-[#111827] transition">{value}</a>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
}

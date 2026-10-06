"use client";
import React, { useState } from 'react';
import { InfoLayout } from '@/components/ui/InfoLayout';
import { Check, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

export default function DigitalRefundPolicyPage() {
  const [verifyInput, setVerifyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { showToast } = useToast();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyInput.trim()) {
      showToast('Please enter a Project ID or Order ID', 'error');
      return;
    }
    
    setIsVerifying(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/market/orders/guest/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: verifyInput })
      });
      
      const data = await res.json();
      
      if (res.ok && data.length > 0) {
        showToast(`Found project/order status: ${data[0].status}`, 'success');
      } else {
        showToast('No matching records found for this Project/Order ID', 'error');
      }
    } catch (err) {
      showToast('Failed to connect to verification server', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const sidebarLinks = [
    { label: 'Legal Hub', href: '/legal' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'End User License', href: '/eula' },
    { label: 'Warranty & Refunds', href: '/warranty', active: true },
  ];

  return (
    <InfoLayout
      title="Warranty & Service Guarantee"
      subtitle="Clear, transparent policies for our web development services, SaaS solutions, and premium templates."
      eyebrow="Codalina Agency"
      lastUpdated="October 2026"
      sidebarLinks={sidebarLinks}
    >
      <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-6 md:p-8 mb-12">
        <h3 className="text-[18px] font-display font-medium text-brand-navy mt-0 mb-3">Our Agency Guarantee</h3>
        <p className="m-0 text-slate-600 leading-relaxed text-[15px]">
          At Codalina, we stand by the quality of our engineering. We provide dedicated post-launch support and a warranty period for our custom web development services and SaaS solutions, ensuring your business operations remain flawless. For our digital marketplace templates, we maintain strict quality standards and offer verified defect resolution.
        </p>
      </div>

      {/* Project/License Verification mockup */}
      <div className="not-prose my-12">
        <div className="rounded-[20px] border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm overflow-hidden max-w-[500px]">
          <div className="p-5 border-b border-brand-navy/[0.08] flex items-center justify-between">
            <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-400">Project / Order Support Check</p>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Enter Project ID or Order ID" 
                value={verifyInput}
                onChange={(e) => setVerifyInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(e); }}
                className="w-full h-11 rounded-[12px] border border-brand-navy/[0.08] bg-white/80 pl-4 pr-[84px] text-[13px] font-mono text-brand-navy outline-none focus:border-brand-blue/50 placeholder:text-slate-400 transition-colors"
              />
              <button 
                className="absolute right-1.5 h-8 px-4 bg-brand-navy hover:bg-brand-blue text-white text-[12px] font-medium font-sans rounded-[8px] transition-colors flex items-center justify-center min-w-[70px]"
                onClick={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? <Loader2 size={14} className="animate-spin" /> : 'Check'}
              </button>
            </div>
            <p className="text-[13px] font-sans text-slate-500">
              Verify your active warranty status or support plan for custom web projects and template purchases.
            </p>
          </div>
        </div>
      </div>

      <h2>1. Custom Web Development & SaaS</h2>
      <p>
        For client projects, including custom websites, web applications, and SaaS platforms built by the Codalina team, we offer a robust service warranty.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 not-prose mt-8 mb-8">
        <div>
          <h3 className="text-[11px] font-mono font-medium uppercase tracking-widest text-brand-blue mb-4">What's Covered</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Check size={14} className="text-brand-blue mt-0.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-600 leading-relaxed"><strong>30-Day Post-Launch Warranty:</strong> We will fix any bugs, broken links, or visual glitches discovered within 30 days of the project going live, completely free of charge.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={14} className="text-brand-blue mt-0.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-600 leading-relaxed"><strong>Performance Guarantees:</strong> Issues related to server misconfigurations on our end or failure to meet agreed-upon performance metrics.</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] font-mono font-medium uppercase tracking-widest text-red-500 mb-4">What's NOT Covered</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500 leading-relaxed">Changes or new feature requests outside the original project scope.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500 leading-relaxed">Issues caused by third-party plugins, APIs, or hosting providers outside our control.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500 leading-relaxed">Errors resulting from the client or another developer modifying our source code.</span>
            </li>
          </ul>
        </div>
      </div>

      <h2>2. Digital Templates & Marketplace Assets</h2>
      <p>
        Because source code, UI kits, and templates are intangible and non-returnable digital goods, we generally do not issue refunds once a product is purchased and accessed.
      </p>

      <h3>Refunds on Digital Goods</h3>
      <p>Exceptions to the no-refund policy are strictly limited to the following scenarios:</p>
      <ul>
        <li><strong>Verified Technical Defects:</strong> If the template has a critical bug preventing it from working as advertised, and our support team cannot provide a fix within 48 hours.</li>
        <li><strong>Duplicate Purchase:</strong> Accidental purchasing of the exact same digital item twice.</li>
      </ul>

      <h2>3. Ongoing Retainers & Maintenance</h2>
      <p>
        For clients enrolled in our monthly maintenance or dedicated developer retainers, support and bug fixes are continuous. You can cancel your retainer at any time with a 30-day notice, and you will only be billed for the current active period. We do not provide prorated refunds for mid-month cancellations.
      </p>

      <h2>4. Need Support?</h2>
      <p>
        Whether you need a quick fix for a template or need to report an issue with your custom web app, our engineering team is here to help.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 not-prose mt-8 p-6 rounded-[20px] border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm">
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1.5">Support Email</p>
          <a href="mailto:info@codalina.com" className="text-[14px] font-sans text-brand-blue hover:underline">info@codalina.com</a>
        </div>
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1.5">Direct Line</p>
          <a href="tel:+8801951768360" className="text-[14px] font-sans text-brand-blue hover:underline">01951768360</a>
        </div>
      </div>

    </InfoLayout>
  );
}

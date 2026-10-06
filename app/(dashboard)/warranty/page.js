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
      showToast('Please enter a License Key or Order ID', 'error');
      return;
    }
    
    setIsVerifying(true);
    try {
      // Try to track order if it looks like an order ID or query
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/market/orders/guest/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: verifyInput })
      });
      
      const data = await res.json();
      
      if (res.ok && data.length > 0) {
        showToast(`Found order with ${data[0].items.length} product(s). Status: ${data[0].status}`, 'success');
      } else {
        showToast('No matching records found for this Key/ID', 'error');
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
      title="Warranty & Refunds"
      subtitle="Clear, transparent policies for your hardware, software, templates, and digital assets."
      eyebrow="Codalina Marketplace"
      lastUpdated="July 2026"
      sidebarLinks={sidebarLinks}
    >
      <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-6 md:p-8 mb-12">
        <h3 className="text-[18px] font-display font-medium text-brand-navy mt-0 mb-3">Our Digital Goods Guarantee</h3>
        <p className="m-0">
          As a provider of intangible, non-returnable digital products (such as source code, UI kits, templates, and scripts), Codalina generally does not issue refunds once a product is purchased and the download link or license key has been accessed. However, we stand by the quality of our offerings and provide exceptions for verified technical defects.
        </p>
      </div>

      {/* License Verification mockup */}
      <div className="not-prose my-12">
        <div className="rounded-[20px] border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm overflow-hidden max-w-[500px]">
          <div className="p-5 border-b border-brand-navy/[0.08] flex items-center justify-between">
            <p className="text-[11px] font-mono font-medium uppercase tracking-widest text-slate-400">License Verification</p>
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-slate-300 " />
              <div className="w-2 h-2 rounded-full bg-slate-300 " />
              <div className="w-2 h-2 rounded-full bg-slate-300 " />
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Enter License Key or Order ID" 
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
                {isVerifying ? <Loader2 size={14} className="animate-spin" /> : 'Verify'}
              </button>
            </div>
            <p className="text-[13px] font-sans text-slate-500 ">
              Verify the authenticity and support status of your digital products without an account.
            </p>
          </div>
        </div>
      </div>

      <h2>1. General Refund Rules</h2>
      <p>
        Due to the nature of digital goods, a product cannot be "returned." By purchasing and downloading a product, you agree to this policy.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8 not-prose mt-8 mb-8">
        <div>
          <h3 className="text-[11px] font-mono font-medium uppercase tracking-widest text-brand-teal mb-4">When a Refund is Granted</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Check size={14} className="text-brand-teal mt-0.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-600  leading-relaxed"><strong>Verified Technical Defects:</strong> If the product has a major bug or defect that prevents it from functioning as described, and our support team cannot resolve it.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={14} className="text-brand-teal mt-0.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-600  leading-relaxed"><strong>Product Not as Described:</strong> If the item is fundamentally different from the product description and live preview.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={14} className="text-brand-teal mt-0.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-600  leading-relaxed"><strong>Duplicate Purchase:</strong> If you accidentally purchased the same digital item twice.</span>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] font-mono font-medium uppercase tracking-widest text-red-500 mb-4">When a Refund is NOT Granted</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500  leading-relaxed">You changed your mind after purchasing.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500  leading-relaxed">You bought an item by mistake and have already downloaded the files or revealed the license key.</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500  leading-relaxed">You do not have the sufficient expertise to use the item (e.g., you do not know how to code to use a script).</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
              <span className="text-[14px] font-sans text-slate-500  leading-relaxed">The item did not meet your expectations, although it works exactly as described.</span>
            </li>
          </ul>
        </div>
      </div>

      <h2>2. The 14-Day Technical Defect Window</h2>
      <p>
        If you experience a critical technical issue with your digital purchase, you must report it within <strong>14 days</strong> of the purchase date. 
      </p>
      
      <h3>Resolution Process</h3>
      <p>Before processing a refund for a defect, we ask that you allow our support team to attempt to resolve the issue. If the defect cannot be fixed, we will issue a full refund to your original payment method.</p>

      <h2>3. How to Request a Refund</h2>
      <p>To request a refund for a valid reason, please follow these steps:</p>
      <ol>
        <li>Contact our support team via email with your Order ID.</li>
        <li>Provide a detailed description of the issue.</li>
        <li>Include screenshots, error logs, or video recordings demonstrating the defect.</li>
        <li>Allow our team up to 48 hours to review the claim and provide technical assistance.</li>
      </ol>
      <p>
        <strong>Revocation of License:</strong> Upon receiving a refund, your license to use the product is immediately revoked. You must delete all downloaded files, source code, and assets associated with the refunded product from your local machines and servers.
      </p>

      <h2>4. Need Help?</h2>
      <p>
        If you have any questions about this policy or need technical support for a purchase, please reach out.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 not-prose mt-8 p-6 rounded-[20px] border border-brand-navy/[0.08] bg-white/40 backdrop-blur-md shadow-sm">
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500  uppercase tracking-widest mb-1.5">Email</p>
          <a href="mailto:info@codalina.com" className="text-[14px] font-sans text-brand-blue hover:underline">info@codalina.com</a>
        </div>
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500  uppercase tracking-widest mb-1.5">Phone</p>
          <a href="tel:+8801951768360" className="text-[14px] font-sans text-brand-blue hover:underline">01951768360</a>
        </div>
      </div>

    </InfoLayout>
  );
}

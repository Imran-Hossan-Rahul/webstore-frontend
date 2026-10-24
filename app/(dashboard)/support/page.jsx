"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/ToastProvider';

export default function SupportPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      showToast("Your message has been sent successfully. We'll get back to you soon.", "success", "Message Sent");
      e.target.reset();
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full min-h-screen font-sans pt-16 md:pt-24 pb-24 bg-transparent">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <header className="text-center mb-16">
          <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-semibold text-[#111418] mb-4 drop-shadow-sm">
            Customer Support
          </p>
          <h1 className="text-[36px] md:text-[48px] font-display font-medium text-slate-900 mb-6 leading-[1.05] tracking-[-0.02em]">
            How can we help?
          </h1>
          <p className="text-[17px] font-sans text-slate-600 max-w-[640px] mx-auto leading-relaxed">
            Find answers to common questions, explore our documentation, or get in touch with our technical team.
          </p>
        </header>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {[
            {
              title: "Documentation",
              desc: "Technical guides and API references.",
              href: "/docs",
              icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            },
            {
              title: "FAQ",
              desc: "Frequently asked questions about purchasing and licensing.",
              href: "/faq",
              icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            },
            {
              title: "Warranty & Refunds",
              desc: "Check your warranty status and our refund policies.",
              href: "/warranty",
              icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            },
            {
              title: "Order History",
              desc: "View past purchases and download invoices.",
              href: "/orders",
              icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            }
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className="group block p-6 rounded-[20px] border border-white/20 bg-white/60 backdrop-blur-lg shadow-sm hover:bg-white/80 transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-[12px] bg-white/80 shadow-sm border border-white/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6 text-[#111418]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold font-sans text-slate-900 mb-1 group-hover:text-[#111418] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-sans text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Form area placeholder */}
        <div className="rounded-[20px] border border-white/20 bg-white/60 backdrop-blur-lg shadow-sm p-8 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 border border-white/40 rounded-[20px] pointer-events-none" />
          <div className="mb-8 relative z-10">
            <h2 className="text-[24px] font-display font-semibold text-slate-900 mb-3">
              Contact our team
            </h2>
            <p className="text-[15px] font-sans text-slate-600 leading-relaxed">
              Can't find what you're looking for? Send us a message and our technical support team will get back to you within 24 hours.
            </p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-mono font-semibold text-slate-600 uppercase tracking-widest pl-1">Name</label>
                <input type="text" required className="w-full h-12 px-4 rounded-[12px] border border-white/40 bg-white/40 text-[14px] text-slate-900 focus:outline-none focus:border-white focus:bg-white/60 shadow-inner transition-colors" placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-mono font-semibold text-slate-600 uppercase tracking-widest pl-1">Email</label>
                <input type="email" required className="w-full h-12 px-4 rounded-[12px] border border-white/40 bg-white/40 text-[14px] text-slate-900 focus:outline-none focus:border-white focus:bg-white/60 shadow-inner transition-colors" placeholder="your@email.com" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[12px] font-mono font-semibold text-slate-600 uppercase tracking-widest pl-1">Subject</label>
              <select className="w-full h-12 px-4 rounded-[12px] border border-white/40 bg-white/40 text-[14px] text-slate-900 focus:outline-none focus:border-white focus:bg-white/60 shadow-inner transition-colors appearance-none">
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing & Refunds</option>
                <option value="sales">Sales & Custom Solutions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-mono font-semibold text-slate-600 uppercase tracking-widest pl-1">Message</label>
              <textarea rows={5} required className="w-full py-4 px-4 rounded-[12px] border border-white/40 bg-white/40 text-[14px] text-slate-900 focus:outline-none focus:border-white focus:bg-white/60 shadow-inner transition-colors resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
              <button type="submit" disabled={loading} className="w-full sm:w-auto h-12 px-8 rounded-[20px] bg-[#111418] text-white text-[14px] font-medium font-sans hover:bg-[#2B3038] active:bg-[#000000] transition-colors shadow-[0_4px_12px_rgba(17,20,24,0.15)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? "Sending..." : "Send Message"}
              </button>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("toggle-chat"))} className="w-full sm:w-auto h-12 px-8 rounded-[20px] bg-white/60 border border-white/40 text-slate-900 text-[14px] font-medium font-sans hover:bg-white/80 transition-colors shadow-sm active:scale-95 flex items-center justify-center gap-2">
                <svg className="w-4 h-4 text-[#111418]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat with our team
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

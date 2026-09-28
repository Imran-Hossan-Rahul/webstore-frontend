"use client";
import React from 'react';
import Link from 'next/link';



export default function SupportPage() {
  return (
    <div className="w-full min-h-screen ] font-sans pt-16 md:pt-24 pb-24 bg-brand-main">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <header className="text-center mb-16">
          <p className="uppercase tracking-[0.12em] text-[11px] font-mono font-medium text-brand-blue mb-4">
            Customer Support
          </p>
          <h1 className="text-[36px] md:text-[48px] font-display font-medium text-brand-navy dark:text-white mb-6 leading-[1.05] tracking-[-0.02em]">
            How can we help?
          </h1>
          <p className="text-[17px] font-sans text-slate-500 dark:text-slate-400 max-w-[640px] mx-auto leading-relaxed">
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
            <Link key={idx} href={item.href} className="group block p-6 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface hover:border-brand-blue/50 dark:hover:border-brand-blue/50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-[4px] bg-brand-blue/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-brand-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[16px] font-medium font-sans text-brand-navy dark:text-white mb-1 group-hover:text-brand-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Contact Form area placeholder */}
        <div className="rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface p-8 md:p-10">
          <div className="mb-8">
            <h2 className="text-[24px] font-display font-medium text-brand-navy dark:text-white mb-3">
              Contact our team
            </h2>
            <p className="text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Can't find what you're looking for? Send us a message and our technical support team will get back to you within 24 hours.
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Name</label>
                <input type="text" className="w-full h-11 px-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 bg-transparent text-[14px] text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Email</label>
                <input type="email" className="w-full h-11 px-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 bg-transparent text-[14px] text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue" placeholder="your@email.com" />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[12px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Subject</label>
              <select className="w-full h-11 px-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 bg-transparent text-[14px] text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue">
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Support</option>
                <option value="billing">Billing & Refunds</option>
                <option value="sales">Sales & Custom Solutions</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest">Message</label>
              <textarea rows={5} className="w-full py-3 px-3 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/20 bg-transparent text-[14px] text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue resize-none" placeholder="How can we help you?"></textarea>
            </div>

            <button type="submit" className="h-11 px-6 rounded-[4px] bg-brand-blue text-white text-[14px] font-medium font-sans hover:bg-blue-600 transition-colors">
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

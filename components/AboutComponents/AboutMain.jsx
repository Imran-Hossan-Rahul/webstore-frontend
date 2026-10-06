"use client";
import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';

export default function AboutMain() {
  return (
    <div className="w-full bg-transparent font-sans pb-16">
      
      {/* 1. The Vision (Hero) */}
      <section className="text-center pt-[80px] pb-[60px] px-6">
        <PageContainer maxWidth="max-w-[980px]">
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-mono font-semibold uppercase tracking-widest text-[#0071e3] mb-[18px] block bg-white/60 px-4 py-1.5 rounded-full shadow-sm border border-[#0071e3]/10">
              OUR VISION
            </span>
            <h1 className="text-[40px] md:text-[56px] font-display font-medium text-slate-900 leading-[1.1] mb-[20px] max-w-[800px]">
              Crafting exceptional web platforms with absolute precision.
            </h1>
            <p className="text-[18px] md:text-[21px] font-sans text-slate-500 max-w-[640px] mx-auto mb-[24px]">
              We build high-performance, scalable web applications that empower businesses to grow, automate, and dominate their digital presence.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Main Content */}
      <section className="px-6 relative z-10">
        <PageContainer maxWidth="max-w-[800px]">
          <div className="space-y-8 bg-white/30 backdrop-blur-3xl border border-white/50 p-8 md:p-12 rounded-[32px] shadow-[0_8px_40px_rgba(0,0,0,0.04)] relative">
            
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10 rounded-[32px] pointer-events-none" />

            {/* 2. The Mission */}
            <div className="relative z-10">
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-slate-900 mb-3">
                The Mission
              </h2>
              <p className="text-[15px] font-sans text-slate-600 leading-relaxed">
                We believe that great software is the foundation of every successful modern business. Our mission is to eliminate technical debt and deliver bespoke, lightning-fast web solutions that scale seamlessly. From enterprise eCommerce to complex internal APIs, we engineer platforms that work flawlessly under pressure.
              </p>
            </div>

            {/* 3. Engineering Excellence */}
            <div className="relative z-10">
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-slate-900 mb-3">
                Engineering Excellence
              </h2>
              <p className="text-[15px] font-sans text-slate-600 leading-relaxed">
                We don't just write code; we architect solutions. Every project we undertake follows rigorous software engineering principles, ensuring clean architecture, robust security, and unparalleled performance. We build systems designed not just for today's needs, but for tomorrow's scale.
              </p>
            </div>

            {/* 4. Strategic Partnerships */}
            <div className="relative z-10">
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-slate-900 mb-3">
                Strategic Partnerships
              </h2>
              <p className="text-[15px] font-sans text-slate-600 leading-relaxed">
                We act as your dedicated technical partner. Instead of just delivering a project and walking away, we offer proactive maintenance, continuous integration, and strategic consulting to ensure your digital products evolve alongside your business goals.
              </p>
            </div>

            {/* 5. Core Values */}
            <div className="relative z-10">
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-slate-900 mb-4">
                Our Core Values
              </h2>
              <ul className="list-none space-y-4 text-[15px] font-sans text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 shrink-0"></span>
                  <span><strong className="text-slate-900 font-medium">Precision:</strong> Pixel-perfect frontends matched with rock-solid, scalable backend architectures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 shrink-0"></span>
                  <span><strong className="text-slate-900 font-medium">Performance:</strong> Lightning-fast load times and optimized workflows that keep your users engaged.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] mt-2 shrink-0"></span>
                  <span><strong className="text-slate-900 font-medium">Reliability:</strong> We build mission-critical systems that you can depend on 24/7/365.</span>
                </li>
              </ul>
            </div>

          </div>
        </PageContainer>
      </section>

      {/* 6. CTA Banner */}
      <section className="mt-16 px-6">
        <PageContainer maxWidth="max-w-[800px]">
          <div className="bg-brand-navy rounded-[32px] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/20 to-transparent pointer-events-none" />
            <h2 className="text-[28px] md:text-[36px] font-display font-medium text-white mb-4 relative z-10">
              Ready to transform your business?
            </h2>
            <p className="text-[16px] text-slate-300 max-w-[500px] mx-auto mb-8 relative z-10">
              Let's discuss how our engineering expertise can help you launch, scale, and dominate your market.
            </p>
            <div className="relative z-10">
              <Link href="/support" className="inline-flex h-12 items-center justify-center rounded-full bg-[#0071e3] px-8 text-[15px] font-medium text-white hover:bg-[#0077ed] transition-colors shadow-[0_8px_20px_rgba(0,113,227,0.3)]">
                Start a Project
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>

    </div>
  );
}

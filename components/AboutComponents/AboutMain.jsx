"use client";
import React from 'react';
import Link from 'next/link';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { CTASection } from '@/components/ui/CTASection';

export default function AboutMain() {
  return (
    <div className="w-full bg-transparent font-sans">
      
      {/* 1. The Vision (Hero) */}
      <section className="text-center pt-[120px] pb-[80px] px-6">
        <PageContainer maxWidth="max-w-[980px]">
          <div className="flex flex-col items-center">
            <span className="text-[12px] font-mono font-medium uppercase tracking-widest text-brand-blue mb-[18px] block">
              OUR VISION
            </span>
            <h1 className="text-[40px] md:text-[56px] font-display font-medium text-brand-navy dark:text-white leading-[1.1] mb-[20px] max-w-[800px]">
              Redefining the premium marketplace experience.
            </h1>
            <p className="text-[18px] md:text-[21px] font-sans text-slate-500 dark:text-slate-400 max-w-[640px] mx-auto mb-[24px]">
              Where exceptional quality meets discerning buyers. We are building the future of digital commerce.
            </p>
          </div>
        </PageContainer>
      </section>

      {/* Main Content */}
      <section className="pb-[80px] px-6">
        <PageContainer maxWidth="max-w-[800px]">
          <div className="space-y-12">
            
            {/* 2. The Mission / The "Why" */}
            <div className="border-t border-brand-navy/[0.08] dark:border-white/10 pt-12">
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-brand-navy dark:text-white mb-4">
                The Mission
              </h2>
              <p className="text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                We built this platform because we believed discovering high-quality products shouldn't be complicated. In a world full of crowded marketplaces with inconsistent standards, we created a space where excellence is the only standard. Our goal is to connect passionate buyers with the very best tech and gadgets available.
              </p>
            </div>

            {/* 3. The Curated Experience */}
            <div>
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-brand-navy dark:text-white mb-4">
                The Curated Experience
              </h2>
              <p className="text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                We don't just list products; we curate them. Every item on our platform meets strict standards for design, durability, and innovation. We manually verify sellers and products to ensure that when you shop with us, you are only choosing from the finest selection available in the country.
              </p>
            </div>

            {/* 4. Direct Brand Partnerships */}
            <div>
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-brand-navy dark:text-white mb-4">
                Direct Brand Partnerships
              </h2>
              <p className="text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                We do not rely on third-party or unverified sellers. Instead, we partner directly with the manufacturers and official distributors of the world's leading technology brands. This direct relationship ensures that every product on our platform is 100% authentic, backed by official warranties, and delivered to you without compromise.
              </p>
            </div>

            {/* 5. The User Experience */}
            <div>
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-brand-navy dark:text-white mb-4">
                The User Experience
              </h2>
              <p className="text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                From a beautifully intuitive design to a lightning-fast, secure checkout process, we obsess over every detail so you can shop with absolute peace of mind. We believe technology should make your life simpler, and our platform reflects that philosophy at every touchpoint.
              </p>
            </div>

            {/* 6. Core Values */}
            <div>
              <h2 className="text-[20px] md:text-[24px] font-display font-medium text-brand-navy dark:text-white mb-4">
                Our Core Values
              </h2>
              <ul className="list-none space-y-4 text-[15px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
                <li>
                  <strong className="text-brand-navy dark:text-white font-medium">Simplicity:</strong> We believe in clean design and effortless navigation. No clutter, no confusion.
                </li>
                <li>
                  <strong className="text-brand-navy dark:text-white font-medium">Trust:</strong> Uncompromising security, verified products, and robust buyer protection.
                </li>
                <li>
                  <strong className="text-brand-navy dark:text-white font-medium">Excellence:</strong> Only the absolute best products make it to our platform.
                </li>
              </ul>
            </div>

          </div>
        </PageContainer>
      </section>

      {/* 7. CTA Banner (Dark Canvas) */}
      <CTASection 
        title="Ready to experience the difference?"
        description="Join thousands of discerning buyers who demand excellence."
        primaryAction={{
          label: "Start Shopping",
          onClick: () => { window.location.href = '/market' }
        }}
        className="!border-t-0"
      />

    </div>
  );
}

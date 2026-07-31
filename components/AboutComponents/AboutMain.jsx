"use client";
import React from 'react';
import Link from 'next/link';

export default function AboutMain() {
  return (
    <div className="w-full bg-transparent font-sans">
      
      {/* 1. The Vision (Hero) */}
      <section className="text-center pt-[120px] pb-[80px] px-6 bg-transparent">
        <div className="max-w-[980px] mx-auto flex flex-col items-center">
          <span className="text-[12px] font-[600] uppercase tracking-[0.12em] text-[#0071e3] mb-[18px] block">
            OUR VISION
          </span>
          <h1 className="text-[44px] md:text-[56px] font-[600] tracking-[-0.02em] text-[#1d1d1f] leading-[1.05] mb-[20px] max-w-[800px]">
            Redefining the premium marketplace experience.
          </h1>
          <p className="text-[18px] md:text-[21px] font-[400] text-[#424245] max-w-[640px] mx-auto mb-[24px]">
            Where exceptional quality meets discerning buyers. We are building the future of digital commerce.
          </p>
        </div>
      </section>

      {/* Main Content (Simple & Classic like Homepage SEO) */}
      <section className="pt-[20px] pb-[80px] px-6 bg-transparent">
        <div className="max-w-[800px] mx-auto space-y-12">
          
          {/* 2. The Mission / The "Why" */}
          <div className="border-t border-[#e8e8ed] pt-12">
            <h2 className="text-[18px] md:text-[22px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-3">
              The Mission
            </h2>
            <p className="text-[14px] md:text-[16px] font-[400] text-[#424245] leading-relaxed">
              We built this platform because we believed discovering high-quality products shouldn't be complicated. In a world full of crowded marketplaces with inconsistent standards, we created a space where excellence is the only standard. Our goal is to connect passionate buyers with the very best tech and gadgets available.
            </p>
          </div>

          {/* 3. The Curated Experience */}
          <div>
            <h2 className="text-[18px] md:text-[22px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-3">
              The Curated Experience
            </h2>
            <p className="text-[14px] md:text-[16px] font-[400] text-[#424245] leading-relaxed">
              We don't just list products; we curate them. Every item on our platform meets strict standards for design, durability, and innovation. We manually verify sellers and products to ensure that when you shop with us, you are only choosing from the finest selection available in the country.
            </p>
          </div>

          {/* 4. Direct Brand Partnerships */}
          <div>
            <h2 className="text-[18px] md:text-[22px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-3">
              Direct Brand Partnerships
            </h2>
            <p className="text-[14px] md:text-[16px] font-[400] text-[#424245] leading-relaxed">
              We do not rely on third-party or unverified sellers. Instead, we partner directly with the manufacturers and official distributors of the world's leading technology brands. This direct relationship ensures that every product on our platform is 100% authentic, backed by official warranties, and delivered to you without compromise.
            </p>
          </div>

          {/* 5. The User Experience */}
          <div>
            <h2 className="text-[18px] md:text-[22px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-3">
              The User Experience
            </h2>
            <p className="text-[14px] md:text-[16px] font-[400] text-[#424245] leading-relaxed">
              From a beautifully intuitive design to a lightning-fast, secure checkout process, we obsess over every detail so you can shop with absolute peace of mind. We believe technology should make your life simpler, and our platform reflects that philosophy at every touchpoint.
            </p>
          </div>

          {/* 6. Core Values */}
          <div>
            <h2 className="text-[18px] md:text-[22px] font-[600] tracking-[-0.01em] text-[#1d1d1f] mb-4">
              Our Core Values
            </h2>
            <ul className="list-none space-y-4 text-[14px] md:text-[16px] font-[400] text-[#424245] leading-relaxed">
              <li>
                <strong className="text-[#1d1d1f] font-[600]">Simplicity:</strong> We believe in clean design and effortless navigation. No clutter, no confusion.
              </li>
              <li>
                <strong className="text-[#1d1d1f] font-[600]">Trust:</strong> Uncompromising security, verified products, and robust buyer protection.
              </li>
              <li>
                <strong className="text-[#1d1d1f] font-[600]">Excellence:</strong> Only the absolute best products make it to our platform.
              </li>
            </ul>
          </div>

        </div>
      </section>

      {/* 7. CTA Banner (Dark Canvas) */}
      <section className="text-center py-[100px] px-6 bg-[#000000]">
        <div className="max-w-[800px] mx-auto flex flex-col items-center">
          <h2 className="text-[36px] md:text-[48px] font-[600] tracking-[-0.02em] text-[#ffffff] leading-[1.05] mb-[16px]">
            Ready to experience the difference?
          </h2>
          <p className="text-[18px] md:text-[21px] font-[400] text-[#cccccc] max-w-[640px] mx-auto mb-[32px]">
            Join thousands of discerning buyers who demand excellence.
          </p>

          <div className="flex justify-center">
            <Link 
              href="/market" 
              className="inline-block bg-[#2997ff] text-[#ffffff] font-[400] text-[16px] px-[28px] py-[13px] rounded-[980px] hover:bg-[#1c7cd6] transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

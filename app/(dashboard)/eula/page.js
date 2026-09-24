"use client";
import React from 'react';

export default function EULAPage() {
  return (
    <div className="w-full min-h-screen bg-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <div className="max-w-[980px] mx-auto px-6 pt-[100px] pb-[120px]">
        
        <header className="text-center mb-[64px]">
          <p className="uppercase tracking-[.12em] text-[12px] font-[600] text-[#0071e3] mb-[18px]">
            Codalina Marketplace
          </p>
          <h1 className="text-[40px] md:text-[56px] font-[700] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-[20px]">
            End User License Agreement (EULA)
          </h1>
          <p className="text-[17px] md:text-[21px] font-[400] text-[#86868b] max-w-[640px] mx-auto mb-[16px]">
            Standard licensing terms for digital products on Codalina.
          </p>
          <p className="text-[13px] text-[#86868b]">
            Last Updated: July 2026
          </p>
        </header>

        <div className="bg-transparent rounded-[18px] px-6 py-4 md:px-[60px] md:py-[40px]">
          
          <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-[14px] p-6 mb-10">
            <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-2">Introduction</h3>
            <p className="text-[15px] text-[#1d1d1f] leading-[1.5]">
              This End User License Agreement (EULA) is a legal agreement between you (the "Licensee") and Codalina (the "Licensor") governing the use of digital products (software, templates, UI kits, source code, scripts) purchased from our marketplace. By downloading and using the product, you agree to these terms.
            </p>
          </div>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">1. Personal License</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              The Personal License is designed for hobbyists, students, and independent creators working on non-commercial projects.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#1d1d1f] leading-[1.5]">
              <li>You may use the product to create one (1) End Product for yourself.</li>
              <li>The End Product must not be sold, licensed, or monetized in any way (no ads, no subscription fees).</li>
              <li>You cannot use the product for client work.</li>
              <li>You may not distribute or publicly share the original source files.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">2. Commercial License</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              The Commercial License is tailored for freelancers, agencies, and businesses creating projects for monetary gain.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#1d1d1f] leading-[1.5]">
              <li>You may use the product to create one (1) End Product for yourself or for one (1) client.</li>
              <li>The End Product may be sold or monetized, provided the end-user is not charged a fee strictly to access the product itself (e.g., a free website with ads is allowed).</li>
              <li>You cannot redistribute, resell, or lease the original source files as-is or modified.</li>
              <li>You cannot use the product to create a tool or service that competes with the original product.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">3. Extended License</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              The Extended License provides maximum flexibility for scalable business applications and software-as-a-service (SaaS) products.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#1d1d1f] leading-[1.5]">
              <li>You may use the product to create one (1) End Product where end-users are charged to access or use the product (e.g., a SaaS platform or paid app).</li>
              <li>You may use the product for client work intended for broad commercial distribution.</li>
              <li>You still may NOT resell, redistribute, or license the original source code or template itself. The value of your End Product must be significantly different from the original item.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">4. Prohibited Uses (All Licenses)</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-5">Regardless of the license type purchased, the following actions are strictly prohibited:</p>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>Reselling, sharing, transferring, or sub-licensing the original source files, download links, or license keys.</li>
              <li>Extracting a single component from a larger product (e.g., an icon from a UI kit) and redistributing it on its own.</li>
              <li>Using the product in applications that promote illegal activities, hate speech, or malicious intent.</li>
              <li>Claiming authorship or copyright over the original unedited product.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">5. Intellectual Property</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5]">
              All digital products remain the intellectual property of their respective creators/authors. A license grants you the right to <i>use</i> the product according to the terms above; it does not transfer ownership or copyright of the product to you.
            </p>
          </section>
          
          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">6. Governing Law</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5]">
              This Agreement shall be governed by and construed in accordance with the laws of [Your Jurisdiction]. 
              <br /><br />
              <strong>[ADMIN NOTE: Please replace "[Your Jurisdiction]" with the applicable legal jurisdiction, e.g., "Bangladesh" or "the State of California"]</strong>
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

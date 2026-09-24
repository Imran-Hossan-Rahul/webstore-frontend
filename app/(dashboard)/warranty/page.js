"use client";
import React from 'react';

export default function DigitalRefundPolicyPage() {
  return (
    <div className="w-full min-h-screen bg-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      <div className="max-w-[980px] mx-auto px-6 pt-[100px] pb-[120px]">
        
        <header className="text-center mb-[64px]">
          <p className="uppercase tracking-[.12em] text-[12px] font-[600] text-[#0071e3] mb-[18px]">
            Codalina Marketplace
          </p>
          <h1 className="text-[40px] md:text-[56px] font-[700] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-[20px]">
            Digital Product Refund Policy
          </h1>
          <p className="text-[17px] md:text-[21px] font-[400] text-[#86868b] max-w-[640px] mx-auto mb-[16px]">
            Clear, transparent policies for your software, templates, and digital assets.
          </p>
          <p className="text-[13px] text-[#86868b]">
            Last Updated: July 2026
          </p>
        </header>

        <div className="bg-transparent rounded-[18px] px-6 py-4 md:px-[60px] md:py-[40px]">
          
          <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-[14px] p-6 mb-10">
            <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-2">Our Digital Goods Guarantee</h3>
            <p className="text-[15px] text-[#1d1d1f] leading-[1.5]">
              As a provider of intangible, non-returnable digital products (such as source code, UI kits, templates, and scripts), Codalina generally does not issue refunds once a product is purchased and the download link or license key has been accessed. However, we stand by the quality of our offerings and provide exceptions for verified technical defects.
            </p>
          </div>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">1. General Refund Rules</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              Due to the nature of digital goods, a product cannot be "returned." By purchasing and downloading a product, you agree to this policy.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[12px] font-[700] uppercase tracking-[.05em] text-[#1d1d1f] mb-4">When a Refund is Granted</h3>
                <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#1d1d1f] leading-[1.5]">
                  <li><strong>Verified Technical Defects:</strong> If the product has a major bug or defect that prevents it from functioning as described, and our support team cannot resolve it. (Must be reported within [X] days - <i>Please update this placeholder</i>).</li>
                  <li><strong>Product Not as Described:</strong> If the item is fundamentally different from the product description and live preview.</li>
                  <li><strong>Duplicate Purchase:</strong> If you accidentally purchased the same digital item twice.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[12px] font-[700] uppercase tracking-[.05em] text-[#1d1d1f] mb-4">When a Refund is NOT Granted</h3>
                <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#86868b] leading-[1.5]">
                  <li>You changed your mind after purchasing.</li>
                  <li>You bought an item by mistake and have already downloaded the files or revealed the license key.</li>
                  <li>You do not have the sufficient expertise to use the item (e.g., you do not know how to code to use a script).</li>
                  <li>The item did not meet your expectations, although it works exactly as described.</li>
                  <li>You can no longer access the item because it has been removed from our marketplace (we advise downloading files immediately).</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">2. The [X]-Day Technical Defect Window</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              If you experience a critical technical issue with your digital purchase, you must report it within <strong>[X] days</strong> of the purchase date. 
              <br /><br />
              <strong>[ADMIN NOTE: Please replace "[X] days" with your actual refund window, e.g., 7 days or 14 days]</strong>
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Resolution Process</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Before processing a refund for a defect, we ask that you allow our support team to attempt to resolve the issue. If the defect cannot be fixed, we will issue a full refund to your original payment method.</p>
              </div>
            </div>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">3. How to Request a Refund</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-5">To request a refund for a valid reason, please follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-4 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>Contact our support team via email with your Order ID.</li>
              <li>Provide a detailed description of the issue.</li>
              <li>Include screenshots, error logs, or video recordings demonstrating the defect.</li>
              <li>Allow our team up to 48 hours to review the claim and provide technical assistance.</li>
            </ol>
            <p className="mt-6 text-[15px] text-[#86868b] leading-[1.5]">
              <strong>Revocation of License:</strong> Upon receiving a refund, your license to use the product is immediately revoked. You must delete all downloaded files, source code, and assets associated with the refunded product from your local machines and servers.
            </p>
          </section>

          <section className="pt-[32px]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">4. Need Help?</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              If you have any questions about this policy or need technical support for a purchase, please reach out.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-[12px] font-[600] text-[#86868b] uppercase tracking-[.05em] mb-1">Email</p>
                <a href="mailto:info@codalina.com" className="text-[16px] text-[#0071e3] hover:underline">info@codalina.com</a>
              </div>
              <div>
                <p className="text-[12px] font-[600] text-[#86868b] uppercase tracking-[.05em] mb-1">Phone</p>
                <a href="tel:+8801951768360" className="text-[16px] text-[#0071e3] hover:underline">01951768360</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

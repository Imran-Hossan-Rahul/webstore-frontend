"use client";
import React from 'react';
import Link from 'next/link';

export default function WarrantyPage() {
  return (
    <div className="w-full min-h-screen bg-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      


      <div className="max-w-[980px] mx-auto px-6 pt-[100px] pb-[120px]">
        
        <header className="text-center mb-[64px]">
          <p className="uppercase tracking-[.12em] text-[12px] font-[600] text-[#0071e3] mb-[18px]">
            Codalina Marketplace
          </p>
          <h1 className="text-[40px] md:text-[56px] font-[700] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-[20px]">
            Warranty & Return Policy
          </h1>
          <p className="text-[17px] md:text-[21px] font-[400] text-[#86868b] max-w-[640px] mx-auto mb-[16px]">
            We stand behind every product we sell. If something goes wrong, we&apos;ll make it right — simple, honest, no hassle.
          </p>
          <p className="text-[13px] text-[#86868b]">
            Last Updated: July 2026
          </p>
        </header>

        <div className="bg-transparent rounded-[18px] px-6 py-4 md:px-[60px] md:py-[40px]">
          
          <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-[14px] p-6 mb-10">
            <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-2">Our Promise to You</h3>
            <p className="text-[15px] text-[#1d1d1f] leading-[1.5]">
              Codalina is a growing marketplace that genuinely cares about its customers. We are not a faceless corporation — we are a small, dedicated team that personally checks every product before it ships. If you receive something defective or not as described, <strong>we will fix it, replace it, or refund it</strong>. That is our commitment to you.
            </p>
          </div>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">1. General Warranty — All Products</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              Every product sold on Codalina comes with a standard warranty. The specific duration depends on the product category and is clearly displayed on each product page.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-[12px] font-[700] uppercase tracking-[.05em] text-[#1d1d1f] mb-4">What is Covered</h3>
                <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#1d1d1f] leading-[1.5]">
                  <li>Manufacturing defects and hardware failures</li>
                  <li>Instant replacement if any hardware defect is found during unboxing (requires unboxing video)</li>
                  <li>Internal component failures (display, battery, motherboard) under warranty period</li>
                  <li>Product not matching the description at time of purchase</li>
                  <li>Dead-on-arrival (DOA) products — immediate replacement</li>
                </ul>
              </div>
              <div>
                <h3 className="text-[12px] font-[700] uppercase tracking-[.05em] text-[#1d1d1f] mb-4">What is Not Covered</h3>
                <ul className="list-disc pl-5 space-y-3 text-[15px] text-[#86868b] leading-[1.5]">
                  <li>Physical damage (drops, cracks, bends, dents)</li>
                  <li>Water or liquid damage</li>
                  <li>Fire or electrical surge damage</li>
                  <li>Cosmetic wear and tear (scratches, discoloration)</li>
                  <li>Software bugs, app crashes, or OS update issues</li>
                  <li>Accessories in the box (charger, cable, earphones)</li>
                  <li>Products repaired by unauthorized third parties</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">2. Replacement & Exchange Policy</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              We want you to be completely satisfied. If a product has a verified defect, here is how we handle it:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Defect Found During Unboxing</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Instant replacement for any hardware defect found right after unboxing. We strongly recommend recording a continuous unboxing video. We will swap it instantly if in stock, or within 3–7 working days if not.</p>
              </div>
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Standard Warranty Period</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Free repair service for covered hardware issues. Parts cost is covered under warranty. Turnaround time is 3–21 working days depending on parts availability.</p>
              </div>
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Color / Model / Storage Change</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">You may exchange for a different variant only if the product box is completely sealed and unopened. A price difference adjustment applies.</p>
              </div>
            </div>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">3. Understanding Product Warranties</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              As Codalina is a marketplace featuring a wide variety of electronics, warranty terms vary depending on the specific product, brand, and seller. We ensure transparency by displaying the exact warranty coverage directly on each product page.
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Brand Warranty</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Official warranty provided by the manufacturer. If your product faces an issue, you can visit any authorized brand service center nationwide, or return it to Codalina and we will handle the brand claim for you.</p>
              </div>
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">Seller Warranty</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Warranty provided directly by the verified Codalina seller. For any claims, you will return the product to us and our support team will coordinate the repair or replacement with the seller.</p>
              </div>
              <div>
                <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">No Warranty</h3>
                <p className="text-[15px] text-[#86868b] leading-[1.5]">Certain items, such as consumable accessories, cables, and screen protectors, may not come with a warranty. This will always be explicitly stated on the product page before you make a purchase.</p>
              </div>
            </div>
            <p className="text-[13px] text-[#86868b] mt-6 italic">
              * The warranty period starts from the date of delivery. Your final invoice serves as your proof of warranty.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">4. How to Claim Your Warranty</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-5">Claiming warranty with Codalina is straightforward. Just follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-4 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>Contact us via phone or email (details below). Describe the issue and share photos/videos of the defect.</li>
              <li>Our support team will verify your claim and guide you on whether to visit us in person or arrange a pickup/courier.</li>
              <li>Bring (or send) the product with its original box and a valid purchase receipt. Accessories are not required unless relevant.</li>
              <li>Our technician will diagnose the product. You will receive a status update within 24 hours of inspection.</li>
              <li>We repair, replace, or exchange the product within the stated timeframe and notify you when it is ready.</li>
            </ol>
            <p className="mt-6 text-[15px] text-[#86868b] leading-[1.5]">
              <strong>Important Reminder:</strong> Please inspect your product thoroughly before leaving. Codalina will not be responsible for cosmetic damage (scratches, dents) reported after the product has left our hands or been delivered.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">5. General Terms & Conditions</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>Warranty is valid only for the original purchaser. It is non-transferable.</li>
              <li>Original packaging (box) must be retained and presented for all warranty claims.</li>
              <li>Any repair or modification by an unauthorized service center will void the warranty immediately.</li>
              <li>Codalina is not responsible for data loss. Please back up your data before handing in any device.</li>
              <li>Software issues, OS update failures, third-party app bugs, and gaming-related problems are not covered.</li>
              <li>Warranty activation is automatic from the date of purchase. No registration required.</li>
              <li>Codalina reserves the right to make the final decision on all warranty claims based on technical inspection.</li>
              <li>If a UV glass/screen protector has been applied and causes or conceals damage, warranty may be affected.</li>
              <li>Accidental damage (drops, pressure, liquid) is excluded from all standard warranty coverage.</li>
              <li>In the event a replacement unit is not available, Codalina may offer store credit of equal value.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">6. Frequently Asked Questions</h2>
            <div className="space-y-6">
              {[
                { q: 'Do I need a receipt to claim warranty?', a: 'Your order from Codalina serves as your proof of purchase. If you can share the Order ID, that is enough.' },
                { q: 'What if my product arrives damaged or defective?', a: 'We highly recommend recording a continuous unboxing video. If you find any defect or damage during unboxing, contact us immediately for an instant replacement.' },
                { q: 'Can I get a refund instead of a replacement?', a: 'Refunds are handled on a case-by-case basis. For DOA (Dead on Arrival) products or significantly misrepresented items, a full refund is possible.' },
                { q: 'Does the warranty transfer if I sell the product?', a: 'No. Warranty is valid only for the original buyer from Codalina. It cannot be transferred.' },
                { q: 'What if the same issue occurs after repair?', a: 'If the same hardware defect recurs within 90 days of repair, it will be fixed again at no charge.' },
                { q: 'How do I track my repair status?', a: 'We will keep you informed via phone throughout the repair process. You can also contact our support team anytime.' },
              ].map(({ q, a }) => (
                <div key={q}>
                  <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-1">{q}</h3>
                  <p className="text-[15px] text-[#86868b] leading-[1.5]">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-[32px]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">7. Need Help?</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              Our support team is real people who genuinely want to help. Reach out anytime — we typically respond within a few hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-[12px] font-[600] text-[#86868b] uppercase tracking-[.05em] mb-1">Email</p>
                <a href="mailto:support@codalina.com" className="text-[16px] text-[#0071e3] hover:underline">support@codalina.com</a>
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

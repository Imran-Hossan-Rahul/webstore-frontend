"use client";
import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="w-full min-h-screen bg-transparent" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      


      <div className="max-w-[980px] mx-auto px-6 pt-[100px] pb-[120px]">
        
        <header className="text-center mb-[64px]">
          <p className="uppercase tracking-[.12em] text-[12px] font-[600] text-[#0071e3] mb-[18px]">
            Data Protection
          </p>
          <h1 className="text-[40px] md:text-[56px] font-[700] text-[#1d1d1f] tracking-[-0.02em] leading-[1.1] mb-[20px]">
            Privacy Policy
          </h1>
          <p className="text-[17px] md:text-[21px] font-[400] text-[#86868b] max-w-[640px] mx-auto mb-[16px]">
            Your privacy matters to us. We believe in being transparent about how we collect, use, and protect your personal data.
          </p>
          <p className="text-[13px] text-[#86868b]">
            Last Updated: July 2026
          </p>
        </header>

        <div className="bg-transparent rounded-[18px] px-6 py-4 md:px-[60px] md:py-[40px]">
          
          <div className="bg-[#f5f5f7] border border-[#e8e8ed] rounded-[14px] p-6 mb-10">
            <h3 className="text-[16px] font-[700] text-[#1d1d1f] mb-2">Our Privacy Promise</h3>
            <p className="text-[15px] text-[#1d1d1f] leading-[1.5]">
              Codalina respects your personal data. We only collect what we need to serve you better, and we <strong>never</strong> sell your information to third parties.
            </p>
          </div>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li><strong>Personal Information:</strong> When you register or place an order, we collect your name, email address, phone number, and delivery address.</li>
              <li><strong>Usage Data:</strong> We automatically collect information about how you use our website, including your IP address, browser type, device information, and pages visited.</li>
              <li><strong>Communication Data:</strong> We retain records of your communications with our customer support team for quality assurance and issue resolution.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">2. How We Use Your Data</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>To process and fulfill your orders, including delivery and payment processing.</li>
              <li>To communicate with you regarding order updates, shipping status, and customer support.</li>
              <li>To improve our website, products, and services based on user behavior and feedback.</li>
              <li>To prevent fraud, abuse, and unauthorized access to our platform.</li>
            </ul>
            <p className="mt-4 text-[15px] text-[#86868b] leading-[1.5]">
              We will only use your data for the purposes outlined here. We do not use your personal information for unrelated marketing without your consent.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">3. Data Sharing & Disclosure</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li><strong>Service Providers:</strong> We share necessary details (like your name, phone, and address) with our trusted courier partners (e.g., Pathao, Steadfast) solely for delivering your order.</li>
              <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or government regulation.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred to the new owning entity.</li>
            </ul>
            <p className="mt-4 text-[16px] text-[#1d1d1f] leading-[1.5] font-[600]">
              We strictly do not sell, rent, or trade your personal information to third parties for their own marketing purposes.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">4. Data Security</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li>We implement industry-standard security measures, including encryption and secure servers, to protect your personal data from unauthorized access, alteration, or disclosure.</li>
              <li>While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure.</li>
              <li>You are responsible for keeping your account password confidential. Do not share it with anyone.</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">5. Cookies & Tracking Technologies</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-3">
              Codalina uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic.
            </p>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5]">
              You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our website may not function properly.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">6. Your Privacy Rights</h2>
            <ul className="list-disc pl-5 space-y-3 text-[16px] text-[#1d1d1f] leading-[1.5]">
              <li><strong>Access & Update:</strong> You can review and update your personal information at any time by logging into your account settings.</li>
              <li><strong>Data Deletion:</strong> You have the right to request the deletion of your account and personal data. Please contact support to initiate this process.</li>
              <li><strong>Opt-Out:</strong> You may opt-out of receiving non-essential promotional communications, though we will still send critical transactional messages (like order updates).</li>
            </ul>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">7. Children&apos;s Privacy</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-3">
              Codalina is not intended for use by children under the age of 13. We do not knowingly collect personal identifiable information from children under 13.
            </p>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5]">
              If we discover that a child under 13 has provided us with personal information, we will immediately delete such information from our servers.
            </p>
          </section>

          <section className="py-[32px] border-b border-[#e8e8ed]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">8. Changes to This Policy</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-3">
              We may update our Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5]">
              You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="pt-[32px]">
            <h2 className="text-[24px] md:text-[28px] font-[700] tracking-[-0.01em] mb-[16px] text-[#1d1d1f]">9. Contact Us</h2>
            <p className="text-[16px] text-[#1d1d1f] leading-[1.5] mb-6">
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-[12px] font-[600] text-[#86868b] uppercase tracking-[.05em] mb-1">Email</p>
                <a href="mailto:info@codalina.com" className="text-[16px] text-[#0071e3] hover:underline">info@codalina.com</a>
              </div>
              <div>
                <p className="text-[12px] font-[600] text-[#86868b] uppercase tracking-[.05em] mb-1">Support</p>
                <a href="tel:+8801951768360" className="text-[16px] text-[#0071e3] hover:underline">01951768360</a>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

"use client";
import React from 'react';
import { InfoLayout } from '@/components/ui/InfoLayout';

export default function PrivacyPage() {
  const sidebarLinks = [
    { label: 'Legal Hub', href: '/legal' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy', active: true },
    { label: 'End User License', href: '/eula' },
    { label: 'Warranty & Refunds', href: '/warranty' },
  ];

  return (
    <InfoLayout
      title="Privacy Policy"
      subtitle="Your privacy matters to us. We believe in being transparent about how we collect, use, and protect your personal data."
      eyebrow="Data Protection"
      lastUpdated="July 2026"
      sidebarLinks={sidebarLinks}
    >
      <div className="bg-brand-cloud dark:bg-brand-surface border border-brand-navy/[0.08] dark:border-white/10 rounded-[4px] p-6 md:p-8 mb-12 shadow-sm dark:shadow-none">
        <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white mt-0 mb-3">Our Privacy Promise</h3>
        <p className="m-0">
          Codalina respects your personal data. We only collect what we need to serve you better, and we <strong>never</strong> sell your information to third parties.
        </p>
      </div>

      <h2>1. Information We Collect</h2>
      <ul>
        <li><strong>Personal Information:</strong> When you register or place an order, we collect your name, email address, phone number, and billing/contact address.</li>
        <li><strong>Usage Data:</strong> We automatically collect information about how you use our website, including your IP address, browser type, device information, and pages visited.</li>
        <li><strong>Communication Data:</strong> We retain records of your communications with our customer support team for quality assurance and issue resolution.</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <ul>
        <li>To process and fulfill your orders, including digital delivery and payment processing.</li>
        <li>To communicate with you regarding order updates and customer support.</li>
        <li>To improve our website, products, and services based on user behavior and feedback.</li>
        <li>To prevent fraud, abuse, and unauthorized access to our platform.</li>
      </ul>
      <p>
        We will only use your data for the purposes outlined here. We do not use your personal information for unrelated marketing without your consent.
      </p>

      <h2>3. Data Sharing & Disclosure</h2>
      <ul>
        <li><strong>Service Providers:</strong> We may share necessary details with our trusted payment partners for processing transactions securely.</li>
        <li><strong>Legal Requirements:</strong> We may disclose your information if required by law, court order, or government regulation.</li>
        <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, user data may be transferred to the new owning entity.</li>
      </ul>
      <p>
        We strictly do not sell, rent, or trade your personal information to third parties for their own marketing purposes.
      </p>

      <h2>4. Data Security</h2>
      <ul>
        <li>We implement industry-standard security measures, including encryption and secure servers, to protect your personal data from unauthorized access, alteration, or disclosure.</li>
        <li>While we strive to use commercially acceptable means to protect your personal information, no method of transmission over the Internet or electronic storage is 100% secure.</li>
        <li>You are responsible for keeping your account password confidential. Do not share it with anyone.</li>
      </ul>

      <h2>5. Cookies & Tracking Technologies</h2>
      <p>
        Codalina uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyze site traffic.
      </p>
      <p>
        You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our website may not function properly.
      </p>

      <h2>6. Your Privacy Rights</h2>
      <ul>
        <li><strong>Access & Update:</strong> You can review and update your personal information at any time by logging into your account settings.</li>
        <li><strong>Data Deletion:</strong> You have the right to request the deletion of your account and personal data. Please contact support to initiate this process.</li>
        <li><strong>Opt-Out:</strong> You may opt-out of receiving non-essential promotional communications, though we will still send critical transactional messages (like order updates).</li>
      </ul>

      <h2>7. Children's Privacy</h2>
      <p>
        Codalina is not intended for use by children under the age of 13. We do not knowingly collect personal identifiable information from children under 13.
      </p>
      <p>
        If we discover that a child under 13 has provided us with personal information, we will immediately delete such information from our servers.
      </p>

      <h2>8. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
      </p>
      <p>
        You are advised to review this Privacy Policy periodically for any changes.
      </p>

      <h2>9. Contact Us</h2>
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 not-prose mt-8 p-6 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface">
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
          <a href="mailto:info@codalina.com" className="text-[14px] font-sans text-brand-blue hover:underline">info@codalina.com</a>
        </div>
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5">Support</p>
          <a href="tel:+8801951768360" className="text-[14px] font-sans text-brand-blue hover:underline">01951768360</a>
        </div>
      </div>
    </InfoLayout>
  );
}

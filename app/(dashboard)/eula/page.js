"use client";
import React from 'react';
import { InfoLayout } from '@/components/ui/InfoLayout';

export default function EULAPage() {
  const sidebarLinks = [
    { label: 'Legal Hub', href: '/legal' },
    { label: 'Terms & Conditions', href: '/terms' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'End User License', href: '/eula', active: true },
    { label: 'Warranty & Refunds', href: '/warranty' },
  ];

  return (
    <InfoLayout
      title="End User License Agreement (EULA)"
      subtitle="Standard licensing terms for digital products on Codalina."
      eyebrow="Codalina Marketplace"
      lastUpdated="July 2026"
      sidebarLinks={sidebarLinks}
    >
      <div className="bg-white/40 backdrop-blur-md border border-brand-navy/[0.08] shadow-sm rounded-[20px] p-6 md:p-8 mb-12">
        <h3 className="text-[18px] font-display font-medium text-brand-navy mt-0 mb-3">Introduction</h3>
        <p className="m-0">
          This End User License Agreement (EULA) is a legal agreement between you (the "Licensee") and Codalina (the "Licensor") governing the use of digital products (software, templates, UI kits, source code, scripts) purchased from our marketplace. By downloading and using the product, you agree to these terms.
        </p>
      </div>

      <h2>1. Personal License</h2>
      <p>
        The Personal License is designed for individuals and businesses building a website for their own use.
      </p>
      <ul>
        <li>You may use the product to create one (1) End Product for yourself or your own business.</li>
        <li>The End Product can be monetized, but you cannot use the product for client work.</li>
        <li>You may not distribute or publicly share the original source files.</li>
        <li><strong>Attribution:</strong> You must include a visible credit in your project footer (e.g., "Powered by Codalina" or similar) linking back to our platform.</li>
      </ul>

      <h2>2. Commercial License</h2>
      <p>
        The Commercial License is tailored for freelancers and agencies building a project for a single client.
      </p>
      <ul>
        <li>You may use the product to create one (1) End Product for one (1) client.</li>
        <li>The End Product may be sold or monetized, provided the end-user is not charged a fee strictly to access the product itself (e.g., a free website with ads is allowed).</li>
        <li>You cannot redistribute, resell, or lease the original source files as-is or modified.</li>
        <li>You cannot use the product to create a tool or service that competes with the original product.</li>
        <li><strong>Attribution:</strong> You must include a visible credit in your project footer (e.g., "Powered by Codalina" or similar) linking back to our platform.</li>
      </ul>

      <h2>3. Extended License</h2>
      <p>
        The Extended License provides maximum flexibility for freelancers, agencies, and scalable business applications.
      </p>
      <ul>
        <li>You may use the product to create an <strong>unlimited</strong> number of End Products for yourself or for multiple clients.</li>
        <li>You may use the product to create End Products where end-users are charged to access or use the product (e.g., a SaaS platform, paid app, or multiple commercial websites).</li>
        <li>You still may NOT resell, redistribute, or license the original source code or template itself. The value of your End Product must be significantly different from the original item.</li>
        <li><strong>Attribution:</strong> You must include a visible credit in your project footer (e.g., "Powered by Codalina" or similar) linking back to our platform.</li>
      </ul>

      <h2>4. Prohibited Uses (All Licenses)</h2>
      <p>Regardless of the license type purchased, the following actions are strictly prohibited:</p>
      <ul>
        <li>Reselling, sharing, transferring, or sub-licensing the original source files, download links, or license keys.</li>
        <li>Extracting a single component from a larger product (e.g., an icon from a UI kit) and redistributing it on its own.</li>
        <li>Using the product in applications that promote illegal activities, hate speech, or malicious intent.</li>
        <li>Claiming authorship or copyright over the original unedited product.</li>
      </ul>

      <h2>5. Intellectual Property</h2>
      <p>
        All digital products remain the intellectual property of their respective creators/authors. A license grants you the right to <i>use</i> the product according to the terms above; it does not transfer ownership or copyright of the product to you.
      </p>
      
      <h2>6. Governing Law</h2>
      <p>
        This Agreement shall be governed by and construed in accordance with the laws of Bangladesh. 
      </p>
    </InfoLayout>
  );
}

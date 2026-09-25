"use client";
import React from 'react';
import { InfoLayout } from '@/components/ui/InfoLayout';

export default function TermsPage() {
  const sidebarLinks = [
    { label: 'Legal Hub', href: '/legal' },
    { label: 'Terms & Conditions', href: '/terms', active: true },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'End User License', href: '/eula' },
    { label: 'Warranty & Refunds', href: '/warranty' },
  ];

  return (
    <InfoLayout
      title="Terms & Conditions"
      subtitle="By using Codalina, you agree to these terms. Please read them carefully — we've written them in plain language so they're easy to understand."
      eyebrow="Legal Document"
      lastUpdated="July 2026"
      sidebarLinks={sidebarLinks}
    >
      <div className="bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] p-6 md:p-8 mb-12 shadow-sm dark:shadow-none">
        <p className="m-0">
          <strong>Welcome to Codalina.</strong> These Terms & Conditions ("Terms") govern your use of our website, platform, and services. By accessing or using Codalina ("we", "us", "our"), you agree to be bound by these Terms. If you do not agree, please do not use our services.
        </p>
      </div>

      <h2>1. Acceptance of Terms</h2>
      <ul>
        <li>By creating an account, placing an order, or simply browsing Codalina, you confirm that you have read, understood, and agreed to these Terms and our Privacy Policy.</li>
        <li>These Terms apply to all visitors, users, and customers of Codalina — whether you are purchasing a product, using our community features, or just browsing the marketplace.</li>
        <li>We reserve the right to update these Terms at any time. Continued use of the platform after changes means you accept the updated Terms.</li>
      </ul>
      <p>
        <strong>Plain English:</strong> By using Codalina, you're agreeing to follow these rules. It's like agreeing to the house rules when you enter a store.
      </p>

      <h2>2. Eligibility & Account Registration</h2>
      <ul>
        <li>You must be at least 13 years old to use Codalina. If you are under 18, you should have parental or guardian consent for purchases.</li>
        <li>You agree to provide accurate, complete, and current information when creating an account. Providing false information may result in account suspension.</li>
        <li>You are responsible for maintaining the confidentiality of your account credentials. Do not share your password with anyone.</li>
        <li>You are responsible for all activity that occurs under your account. If you suspect unauthorized access, contact us immediately.</li>
        <li>Codalina reserves the right to refuse account registration or terminate accounts that violate these Terms, at our sole discretion.</li>
        <li>Each person may only hold one active account. Duplicate accounts may be merged or removed.</li>
      </ul>

      <h2>3. Purchases, Payments & Orders</h2>
      <ul>
        <li>All prices listed on Codalina are in Bangladeshi Taka (BDT) and are inclusive of applicable taxes unless stated otherwise.</li>
        <li>Codalina provides digital products. Payment is required in full before the download link or license is provided.</li>
        <li>By placing an order, you confirm that all information provided (such as your email address) is accurate.</li>
        <li>Orders for digital products are generally final and non-refundable once the file has been downloaded or license activated, unless stated otherwise.</li>
        <li>Codalina reserves the right to cancel or refuse any order at its discretion — for example, if a pricing error occurs. You will be notified promptly and refunded if charged.</li>
      </ul>
      <p>
        <strong>Note on Digital Delivery:</strong> All digital products will be accessible via your account immediately upon successful payment confirmation.
      </p>

      <h2>4. Products, Listings & Accuracy</h2>
      <ul>
        <li>Codalina strives to display product information, images, and specifications as accurately as possible. However, minor variations in color or appearance may occur due to screen settings.</li>
        <li>All products listed are subject to availability. Codalina does not guarantee that any product will remain in stock.</li>
        <li>Product specifications, pricing, and availability are subject to change without prior notice.</li>
        <li>If a product you ordered becomes unavailable after purchase, we will contact you to offer an alternative or full refund.</li>
        <li>Codalina does not sell counterfeit or unauthorized products. All items are sourced from legitimate suppliers.</li>
      </ul>

      <h2>5. Prohibited Activities</h2>
      <p>The following activities are strictly prohibited on Codalina:</p>
      <ul>
        <li>Placing fraudulent orders or providing false delivery information intentionally.</li>
        <li>Attempting to hack, reverse-engineer, or disrupt our platform or servers.</li>
        <li>Using automated bots or scrapers to access our website or data.</li>
        <li>Posting false reviews, misleading content, or spam.</li>
        <li>Attempting to resell products purchased from Codalina without authorization.</li>
        <li>Using Codalina to engage in any illegal activity under Bangladeshi law.</li>
        <li>Harassing, threatening, or abusing Codalina staff or other users.</li>
        <li>Creating multiple accounts to abuse promotions, discounts, or warranty claims.</li>
      </ul>
      <p>
        Violations may result in immediate account suspension, order cancellation, and — where applicable — legal action.
      </p>

      <h2>6. Privacy & Data</h2>
      <ul>
        <li>Codalina collects personal information (name, email, phone, address) solely to process orders, provide support, and improve our services.</li>
        <li>We do not sell, rent, or share your personal data with third parties for marketing purposes.</li>
        <li>Your data is stored securely and protected using industry-standard encryption practices.</li>
        <li>By placing an order, you consent to us processing your details to deliver digital products securely to your email address or account dashboard.</li>
        <li>You have the right to request deletion of your account and associated data at any time by contacting us.</li>
        <li>Codalina may use cookies to improve your browsing experience. You can disable cookies in your browser settings, though some features may not function correctly.</li>
        <li>We may send you transactional messages (order confirmation, digital delivery links) via email or SMS. These are not promotional and cannot be opted out of while an order is active.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <ul>
        <li>All content on Codalina — including logos, text, images, UI design, product descriptions, and code — is the intellectual property of Codalina or its respective licensors.</li>
        <li>You may not reproduce, copy, distribute, or use any Codalina content for commercial purposes without written permission.</li>
        <li>Product images provided by manufacturers or suppliers remain the property of their respective owners.</li>
        <li>User-submitted content (reviews, profile pictures) remains yours, but by submitting it you grant Codalina a non-exclusive license to display it on our platform.</li>
      </ul>

      <h2>8. Limitation of Liability & Disclaimers</h2>
      <ul>
        <li>Codalina provides its services "as is" without any express or implied warranties regarding uninterrupted access or error-free operation.</li>
        <li>To the fullest extent permitted by law, Codalina is not liable for any indirect, incidental, or consequential damages arising from the use of our platform or digital products.</li>
        <li>Codalina's maximum liability to any customer shall not exceed the total amount paid for the specific order in question.</li>
        <li>We are not responsible for delays in email delivery of license keys or download links caused by third-party email providers or spam filters.</li>
        <li>Codalina is not liable for data loss or system issues resulting from the use of our software products. Customers must back up their systems prior to installing any purchased source code or script.</li>
      </ul>

      <h2>9. Account Termination</h2>
      <ul>
        <li>You may deactivate your account at any time by contacting our support team or through your account settings.</li>
        <li>Codalina reserves the right to suspend or permanently terminate your account without prior notice if you violate these Terms.</li>
        <li>Upon termination, your right to use the platform ceases immediately. Outstanding orders will still be fulfilled unless there is an active dispute.</li>
        <li>We may retain certain data for legal or compliance purposes even after account termination, as required by law.</li>
      </ul>

      <h2>10. Governing Law & Disputes</h2>
      <ul>
        <li>These Terms are governed by and construed in accordance with the laws of the People's Republic of Bangladesh.</li>
        <li>Any disputes arising from the use of Codalina shall first be attempted to be resolved through good-faith negotiation between the parties.</li>
        <li>If a dispute cannot be resolved informally, it shall be subject to the exclusive jurisdiction of the courts of Dhaka, Bangladesh.</li>
        <li>Codalina is committed to fair resolution of any customer concern. Please reach out to us before pursuing formal legal action.</li>
      </ul>

      <h2>11. Changes to These Terms</h2>
      <ul>
        <li>Codalina may update these Terms from time to time. The "Last Updated" date at the top of this page will reflect the most recent revision.</li>
        <li>For significant changes, we will notify registered users via email or an in-platform notification at least 7 days before the changes take effect.</li>
        <li>Your continued use of Codalina after the effective date of updated Terms constitutes your acceptance of the changes.</li>
        <li>If you disagree with any changes, you may terminate your account before the changes take effect.</li>
      </ul>

      <h2>12. Contact Us</h2>
      <p>
        If you have any questions about these Terms, wish to report a violation, or need legal clarification, please contact us through any of the following channels:
      </p>
      
      <div className="flex flex-col sm:flex-row gap-8 not-prose mt-8 p-6 rounded-[4px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161B22]">
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1.5">Email</p>
          <a href="mailto:info@codalina.com" className="text-[14px] font-sans text-brand-blue hover:underline">info@codalina.com</a>
        </div>
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1.5">Phone</p>
          <a href="tel:+8801951768360" className="text-[14px] font-sans text-brand-blue hover:underline">01951768360</a>
        </div>
        <div>
          <p className="text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest mb-1.5">Registered In</p>
          <p className="text-[14px] font-sans text-brand-navy dark:text-white">Dhaka, Bangladesh</p>
        </div>
      </div>
    </InfoLayout>
  );
}

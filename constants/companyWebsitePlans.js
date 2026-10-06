/**
 * COMPANY WEBSITE PLANS — Edit all copy and prices here.
 * -------------------------------------------------------
 * Search for {{PLACEHOLDER}} to find any field still needing a real value.
 *
 * TODO checklist (remaining):
 *  [ ] Replace {{BUSINESS_PRICE}}   — set your real Business tier starting price
 *  [ ] Replace {{PREMIUM_PRICE}}    — set your real Premium tier starting price
 *  [ ] Replace {{DELIVERY_TIME}}    — e.g. "2–4 weeks"
 *  [ ] Set QUOTE_LINK to your real quote/contact page route
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SUPPORT_DAYS   = "30";         // ✅ Confirmed — 30 days free support
const BUSINESS_PRICE = "BDT 29,999";    // ✅ Confirmed — discounted launch price
const PREMIUM_PRICE  = "BDT 49,999";    // ✅ Confirmed — discounted launch price

// TODO: Update to your actual quote/contact page route
const QUOTE_LINK = "/book-call";  // ✅ Confirmed — routes to Book a Call page

// ─── OUTCOME-FOCUSED DESCRIPTION ─────────────────────────────────────────────

const CARD_DESC =
  "A fast, SEO-ready website that builds trust and brings customer inquiries straight to your business.";

// ─── TRUST / DELIVERY LINE ───────────────────────────────────────────────────

// Card-level fallback — each tier overrides this with its own delivery window
const TRUST_LINE_BASE =
  `Free SSL · ${SUPPORT_DAYS} days free support · You own the source code`;

// ─── TIERS ───────────────────────────────────────────────────────────────────
//
//  PAGE DISTRIBUTION LOGIC
//  ─────────────────────────────────────────────────────────────────────────────
//  Starter  (6 pages)  — Core pages every company site needs
//  Business (10 pages) — Starter + conversion & content marketing pages
//  Premium  (15 pages) — Business + employer branding & resources
//
//  Legal pages (Privacy Policy, Terms of Service) are included in ALL tiers.

export const COMPANY_WEBSITE_PLANS = {
  title:     "Company Website",
  isTiered:  true,
  glow:      "from-green-500/20 to-transparent",
  storeLink: QUOTE_LINK,
  desc:      CARD_DESC,
  trustLine: TRUST_LINE_BASE,   // per-tier trustLine (with delivery time) overrides this

  // ── License protection note ───────────────────────────────────────────────
  // `short` is shown directly on the card (always visible, subtle).
  // `full`  is shown on hover/focus as a tooltip (complete plain-language terms).
  // The platform enforces this via domain-locked licenses + BuildFingerprint watermarks.
  licenseNote: {
    short: "1 license = 1 business only. Reselling prohibited.",
    full:  "Each website is licensed for a single business or end-client only. " +
           "You may not resell, redistribute, or deploy this website for multiple clients under one purchase. " +
           "Every delivery includes a domain-locked license key and a unique digital watermark. " +
           "Violation results in immediate license suspension and loss of support & updates.",
  },

  tiers: [
    // ── STARTER ─────────────────────────────────────────────────────────────
    // 6 pages. Priced at BDT 17,999 (displayed from BDT 24,999) to attract local
    // clients while staying clearly above low-quality freelancers.
    {
      id:            "starter",
      name:          "Starter",
      price:         "BDT 17,999",
      originalPrice: "BDT 24,999",
      isPopular:     false,
      trustLine:     `Delivery: 10–14 days · Free SSL · ${SUPPORT_DAYS} days free support · You own the source code`,
      bullets: [
        // ── 6 included pages ──
        "6 custom pages: Home, About, Services, Portfolio, Contact + Legal (Privacy & Terms)",
        // ── Design & Performance ──
        "Mobile-first design, loads in under 2 seconds",
        // ── SEO Foundation ──
        "SEO setup: Google Search Console + Analytics (GA4)",
        // ── Self-managed content ──
        "Easy CMS: update text, images & pages yourself — no developer needed",
        // ── Lead generation ──
        "Lead capture: contact form, WhatsApp button & email notifications",
        // ── Language ──
        "Bangla + English language support",
        // ── Post-launch care ──
        `${SUPPORT_DAYS} days free support after launch`,
      ],
    },

    // ── BUSINESS ────────────────────────────────────────────────────────────
    // 10 pages. Priced at BDT 29,999 (displayed from BDT 39,999).
    // Anchor effect: only BDT 10K–12K more than Starter, but delivers CMS blog,
    // Facebook Pixel, Google Ads tracking, advanced SEO — clients pick this.
    {
      id:            "business",
      name:          "Business",
      price:         BUSINESS_PRICE,          // BDT 29,999
      originalPrice: "BDT 39,999",              // ✅ Shown crossed-out
      isPopular:     true,  // "Most Popular" badge
      trustLine:     `Delivery: 14–21 days · Free SSL · ${SUPPORT_DAYS} days free support · You own the source code`,
      bullets: [
        "Everything in Starter, plus:",
        // ── +4 extra pages (total 10) ──
        "4 extra pages: Testimonials / Clients, Blog / Insights, FAQ + Careers teaser",
        // ── Blog & content ──
        "Blog setup with CMS: publish posts yourself, no developer needed",
        // ── Social proof ──
        "Testimonials & client logos section to build buyer trust",
        // ── FAQ ──
        "FAQ page: answer common questions, reduce inbox volume",
        // ── Tracking & ads ──
        "Facebook Pixel + Google Ads conversion tracking",
        // ── SEO upgrade ──
        "Advanced on-page & technical SEO (schema markup, XML sitemap)",
      ],
    },

    // ── PREMIUM ─────────────────────────────────────────────────────────────
    // 15 pages — adds employer branding and resource pages for growing teams.
    {
      id:            "premium",
      name:          "Premium",
      price:         PREMIUM_PRICE,           // BDT 49,999
      originalPrice: "BDT 65,000",              // ✅ Shown crossed-out
      isPopular:     false,
      trustLine:     `Delivery: 21–30 days · Free SSL · ${SUPPORT_DAYS} days free support · You own the source code`,
      bullets: [
        "Everything in Business, plus:",
        // ── +5 extra pages (total 15) ──
        "5 extra pages: Careers / Join Us (with application form), Resources, Case Studies, Team, Sitemap",
        // ── Careers & hiring ──
        "Careers page with job listing CMS + application form & email alerts",
        // ── Resources ──
        "Resources / Downloads section: PDFs, brochures, whitepapers",
        // ── Premium design ──
        "Animation-heavy premium design with custom micro-interactions",
        // ── Ongoing care ──
        "1st month maintenance & security check included free",
        // ── Dedicated support ──
        "Dedicated account manager + priority support queue",
      ],
    },
  ],

  // ─── OPTIONAL ADD-ONS ─────────────────────────────────────────────────────
  // Prices show a range — the exact quote depends on the client's requirement.
  // Delete any row for a service you do NOT offer.
  addons: [
    {
      name:  "Extra pages (beyond plan limit)",
      price: "BDT 1,500 – BDT 2,000 / page",
      // Design + content placement for each page beyond the included 6.
    },
    {
      name:  "Online payment gateway",
      price: "BDT 4,000 – BDT 6,000",
      // bKash, Nagad, Rocket or SSLCommerz / AamarPay merchant integration.
    },
    {
      name:  "Booking / appointment system",
      price: "BDT 2,500 – BDT 4,000",
      // Calendly, Cal.com or an in-site calendar scheduling setup.
    },
    {
      name:  "Monthly blog / content writing",
      price: "BDT 3,500 – BDT 6,000 / month",
      // 3–4 SEO-friendly blog posts or articles written and published monthly.
    },
    {
      name:  "Professional copywriting",
      price: "BDT 3,000 – BDT 5,000",
      // Sales-focused content and headlines written for all 6 pages.
    },
    {
      name:  "AI chatbot / live chat",
      price: "BDT 2,500 – BDT 4,500",
      // Tidio / Crisp live chat or a custom AI bot integration.
    },
  ],
};


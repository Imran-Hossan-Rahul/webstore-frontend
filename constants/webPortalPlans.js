/**
 * CUSTOM WEB PORTALS PLANS — Edit all copy and prices here.
 * ----------------------------------------------------------
 * Search for {{PLACEHOLDER}} to find every field you must fill in
 * before going live. Do NOT delete placeholder strings; replace them
 * with your real values.
 *
 * TODO checklist:
 *  [ ] Replace {{PAGE_COUNT}}        — e.g. "up to 20"
 *  [ ] Replace {{ADVANCED_PRICE}}    — e.g. "Starts at BDT 3,00,000"
 *  [ ] Replace {{CUSTOM_PRICE}}      — e.g. "Starts at BDT 4,50,000"
 *  [ ] Replace {{DELIVERY_TIME}}     — e.g. "4–8 weeks"
 *  [ ] Replace {{SUPPORT_DAYS}}      — e.g. "30"
 *  [ ] Replace {{ADDON_PRICE_*}}     — per add-on, or keep null → shows "Ask for quote"
 *  [ ] Set PORTAL_QUOTE_LINK to your real quote/contact page route
 *  [ ] Remove any features below you do NOT offer
 *  [ ] Remove any use-case chips you do NOT build
 *  [ ] Confirm that BDT 2,00,000 belongs to Business Portal (currently assumed)
 */

// ─── CONFIG (edit these) ─────────────────────────────────────────────────────

const PAGE_COUNT      = "{{PAGE_COUNT}}";       // TODO: e.g. "up to 20"
const ADVANCED_PRICE  = "{{ADVANCED_PRICE}}";   // TODO: e.g. "Starts at BDT 3,00,000"
const CUSTOM_PRICE    = "{{CUSTOM_PRICE}}";     // TODO: e.g. "Starts at BDT 4,50,000"
const DELIVERY_TIME   = "{{DELIVERY_TIME}}";    // TODO: e.g. "4–8 weeks"
const SUPPORT_DAYS    = "{{SUPPORT_DAYS}}";     // TODO: e.g. "30"

// TODO: Update this to your real quote/contact page route
const PORTAL_QUOTE_LINK = "/store?category_name=Custom+Web+Platforms";

// ─── OUTCOME-FOCUSED DESCRIPTION ─────────────────────────────────────────────

const CARD_DESC =
  "A custom-built website with features your business actually needs — logins, search, listings, and more — beyond what any template can do.";

// ─── TRUST / DELIVERY LINE ───────────────────────────────────────────────────

const TRUST_LINE =
  `Delivery: ${DELIVERY_TIME} · Free SSL · ${SUPPORT_DAYS} days free support · You own the source code`;

// ─── USE-CASE CHIPS (remove any you don't build) ─────────────────────────────

const USE_CASES = [
  "Business Portal",
  "Directory / Listing",
  "Membership",
  "News / Magazine",
  "Real Estate",
  "Education",
];

// ─── POSITIONING HINT (shown in italic below description) ────────────────────
// Guides buyers to the right card. Remove positionHint entirely if not needed.

const POSITION_HINT = {
  text: "Need only a simple company website?",
  link: {
    // TODO: Update href to the anchor or section ID for the Company Website card
    href:  "/store?category_name=Company+Website",
    label: "See Company Website →",
  },
};

// ─── TIERS ───────────────────────────────────────────────────────────────────

export const WEB_PORTAL_PLANS = {
  /** Shape that matches the services[] entry in ServicesStoryteller */
  title:        "Custom Web Portals",   // Renamed from "Custom Web Platforms"
  isTiered:     true,
  glow:         "from-brand-cyan/20 to-transparent",
  storeLink:    PORTAL_QUOTE_LINK,
  desc:         CARD_DESC,
  trustLine:    TRUST_LINE,
  useCases:     USE_CASES,
  positionHint: POSITION_HINT,
  techLabel:    "Built with Next.js, React, Tailwind CSS",

  tiers: [
    {
      id:        "business",
      name:      "Business Portal",
      // TODO: Confirm that BDT 2,00,000 belongs here
      price:     "Starts at BDT 2,00,000",
      isPopular: false,
      bullets: [
        // TODO: Remove any feature below you do NOT offer
        `Custom features: user accounts, search & filters, up to ${PAGE_COUNT} pages`,
        "Admin panel: update content, users, and pages yourself",
        "SEO-ready structure for sites with many pages",
        "Multi-language: Bangla + English",
        "Fast and secure: loads in under 2 seconds, SSL included",
        `${SUPPORT_DAYS} days free support after launch`,
      ],
    },
    {
      id:        "advanced",
      name:      "Advanced Portal",
      price:     ADVANCED_PRICE,
      isPopular: true,   // "Most Popular" badge
      bullets: [
        "Everything in Business Portal, plus:",
        "Multiple user roles & member areas (staff, customers, editors)",
        // TODO: Remove third-party integrations if you don't offer them
        "Third-party integrations: payment, CRM, email, maps",
        "Advanced SEO structure for large sites (sitemaps, structured data)",
        // TODO: Remove booking / payment if you don't offer it
        "Online booking or payment option",
        "Built to grow: add new sections later without rebuilding",
      ],
    },
    {
      id:        "custom",
      name:      "Custom Platform",
      price:     CUSTOM_PRICE,
      isPopular: false,
      bullets: [
        "Everything in Advanced Portal, plus:",
        "Fully custom workflows tailored to your business process",
        // TODO: Remove CRM/API integrations if you don't offer them
        "CRM / API integrations with your existing tools",
        "Multi-language: 3 or more languages",
        "High-traffic scaling: handles thousands of visitors",
        "Priority support + dedicated account manager",
      ],
    },
  ],

  // ─── OPTIONAL ADD-ONS ─────────────────────────────────────────────────────
  // Set `price` to a BDT string, or null → shows "Ask for quote"
  addons: [
    { name: "Extra language",                   price: null },  // TODO: {{ADDON_PRICE_LANG}}
    { name: "Online payment gateway",           price: null },  // TODO: {{ADDON_PRICE_PAYMENT}}
    { name: "Booking system",                   price: null },  // TODO: {{ADDON_PRICE_BOOKING}}
    { name: "AI chatbot / live chat",           price: null },  // TODO: {{ADDON_PRICE_CHATBOT}}
    { name: "Monthly maintenance & security",   price: null },  // TODO: {{ADDON_PRICE_MAINTENANCE}}
    { name: "Content writing",                  price: null },  // TODO: {{ADDON_PRICE_CONTENT}}
    { name: "Mobile app",                       price: null },  // TODO: {{ADDON_PRICE_APP}}
  ],
};


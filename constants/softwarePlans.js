/**
 * CUSTOM SOFTWARE & WEB APPS PLANS — Edit all copy and prices here.
 * -----------------------------------------------------------------
 * Search for {{PLACEHOLDER}} to find every field you must fill in
 * before going live.
 *
 * TODO checklist:
 *  [ ] Replace {{ADDON_PRICE_*}} — per add-on, or keep null → shows "Ask for quote"
 */

// ─── CONFIG (edit these numbers/strings) ─────────────────────────────────────

const MVP_PRICE     = "BDT 60,000";
const GROWTH_PRICE  = "BDT 1,49,999";

// Route to booking/consultation page
export const SOFTWARE_QUOTE_LINK = "/book-call";

// ─── OUTCOME-FOCUSED DESCRIPTION ─────────────────────────────────────────────

const CARD_DESC =
  "Custom software that automates your operations or turns your product idea into a working, scalable platform.";

// Card-level fallback
const TRUST_LINE_BASE =
  `Free discovery call · You own the source code`;

// ─── USE-CASE CHIPS ──────────────────────────────────────────────────────────

const USE_CASES = [
  "CRM",
  "HRM",
  "Inventory",
  "Booking",
  "School / LMS",
  "Marketplace",
];

// ─── HOW WE WORK (4-step process) ────────────────────────────────────────────

const PROCESS_STEPS = [
  { label: "Discovery",    desc: "understand your goals and map out the scope" },
  { label: "Design",       desc: "wireframes and UI prototype before a line of code" },
  { label: "Development",  desc: "iterative builds with regular progress updates" },
  { label: "Launch & Support", desc: "live deployment + post-launch care included" },
];

// ─── TIERS ───────────────────────────────────────────────────────────────────

export const SOFTWARE_PLANS = {
  /** Shape that matches the services[] entry in ServicesStoryteller */
  title:     "Custom Software & Web Apps",
  isTiered:  true,
  glow:      "from-brand-teal/20 to-transparent",
  storeLink: SOFTWARE_QUOTE_LINK,
  desc:      CARD_DESC,
  trustLine: TRUST_LINE_BASE,
  useCases:  USE_CASES,
  process:   PROCESS_STEPS,

  // CTA overrides
  ctaText:  "Book a Free Consultation",
  ctaLabel: "Book a free consultation for your custom software project",

  // Tech stack tooltip text
  techLabel: "Built with Node.js, Docker, PostgreSQL",

  // ── License protection note ───────────────────────────────────────────────
  licenseNote: {
    short: "1 license = 1 business only. Reselling prohibited.",
    full:  "Each software instance is licensed for a single business or end-client only. " +
           "You may not resell, redistribute, or deploy this software for multiple clients under one purchase. " +
           "Every delivery includes a domain-locked license key and a unique digital watermark. " +
           "Violation results in immediate license suspension and loss of support & updates.",
  },

  tiers: [
    {
      id:            "mvp",
      name:          "MVP Launch",
      price:         MVP_PRICE,               // BDT 60,000
      originalPrice: "BDT 85,000",               // ✅ Shown crossed-out
      isPopular:     false,
      trustLine:     `Delivery: 4–6 weeks · Free discovery call · 45 days free support · You own the source code`,
      bullets: [
        "Core features built for your main use case",
        "1–2 user roles (e.g. admin + staff)",
        "Basic dashboard: key stats at a glance",
        "Cloud deployment: live and ready to use from day one",
        "45 days free support after launch",
      ],
    },
    {
      id:            "growth",
      name:          "Growth",
      price:         GROWTH_PRICE,            // BDT 1,49,999
      originalPrice: "BDT 1,80,000",             // ✅ Shown crossed-out
      isPopular:     true,   // "Most Popular" badge
      trustLine:     `Delivery: 8–10 weeks · Free discovery call · 90 days free support · You own the source code`,
      bullets: [
        "Everything in MVP Launch, plus:",
        "Full dashboard: live reports, charts, and insights",
        "Multiple user roles & permissions (admin, staff, customer)",
        "Third-party integrations: payment gateway, SMS, email & more",
        "Subscription & billing system (for SaaS products)",
        "Real-time updates: notifications and live data without refreshing",
        "Secure by design: encrypted data, daily backups",
      ],
    },
    {
      id:            "custom",
      name:          "Custom Platform",
      price:         "From BDT 3.5 Lakh",
      priceSuffix:   "(depending on scope of work)",
      isPopular:     false,
      trustLine:     `Delivery: 12–16 weeks · Free discovery call · Priority 180 days support · You own the source code`,
      bullets: [
        "Everything in Growth, plus:",
        "Multi-tenant SaaS (each client gets their own workspace)",
        "Public API for connecting with other tools",
        "Custom mobile app (Android & iOS)",
        "High-traffic scaling: handles thousands of concurrent users",
        "Advanced security audit & compliance",
        "Dedicated account manager + VIP priority support",
      ],
    },
  ],

  // ─── OPTIONAL ADD-ONS ─────────────────────────────────────────────────────
  // Set `price` to a BDT string, or null → shows "Ask for quote"
  addons: [
    { name: "Mobile app (Android & iOS)",                 price: null },  // TODO: {{ADDON_PRICE_APP}}
    { name: "AI features (chatbot, recommendations)",     price: null },  // TODO: {{ADDON_PRICE_AI}}
    { name: "UI/UX design sprint (prototype first)",      price: null },  // TODO: {{ADDON_PRICE_UX}}
    { name: "Third-party API integration",                price: null },  // TODO: {{ADDON_PRICE_API}}
    { name: "Monitoring + monthly maintenance retainer",  price: null },  // TODO: {{ADDON_PRICE_MAINTENANCE}}
    { name: "API documentation",                          price: null },  // TODO: {{ADDON_PRICE_DOCS}}
    { name: "Dedicated developer / hourly team extension",price: null },  // TODO: {{ADDON_PRICE_TEAM}}
  ],
};

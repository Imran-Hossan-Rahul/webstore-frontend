/**
 * E-COMMERCE STORE PLANS — Edit all copy and prices here.
 * ---------------------------------------------------------
 * Search for {{PLACEHOLDER}} to find every field you must fill in
 * before going live.
 *
 * TODO checklist:
 *  [ ] Replace {{ADDON_PRICE_*}} — per add-on, or keep null → shows "Ask for quote"
 */

// ─── CONFIG (edit these numbers/strings) ─────────────────────────────────────

const PRODUCT_LIMIT  = "200";            // ✅ Starter product limit
const STARTER_PRICE  = "BDT 35,000";        // ✅ Starter launch price
const BUSINESS_PRICE = "BDT 75,000";        // ✅ Business launch price

// Route to Book a Call page
const ECOMMERCE_QUOTE_LINK = "/book-call";

// ─── OUTCOME-FOCUSED DESCRIPTION ─────────────────────────────────────────────

const CARD_DESC =
  "A fast, secure online store that makes ordering easy for your customers and managing orders easy for you.";

// Card-level fallback — each tier overrides this with its own delivery window
const TRUST_LINE_BASE =
  `Free SSL · You own the source code`;

export const ECOMMERCE_PLANS = {
  /** Shape that matches the services[] entry in ServicesStoryteller */
  title:     "E-Commerce Store",
  isTiered:  true,
  glow:      "from-brand-blue/20 to-transparent",
  storeLink: ECOMMERCE_QUOTE_LINK,
  desc:      CARD_DESC,
  trustLine: TRUST_LINE_BASE,   // per-tier trustLine overrides this

  // ── License protection note ───────────────────────────────────────────────
  licenseNote: {
    short: "1 license = 1 business only. Reselling prohibited.",
    full:  "Each website is licensed for a single business or end-client only. " +
           "You may not resell, redistribute, or deploy this website for multiple clients under one purchase. " +
           "Every delivery includes a domain-locked license key and a unique digital watermark. " +
           "Violation results in immediate license suspension and loss of support & updates.",
  },

  tiers: [
    {
      id:            "starter",
      name:          "Starter Store",
      price:         STARTER_PRICE,          // BDT 35,000
      originalPrice: "BDT 45,000",              // ✅ Shown crossed-out
      isPopular:     false,
      trustLine:     `Delivery: 3–4 weeks · Free SSL · 30 days free support · You own the source code`,
      bullets: [
        "10 core store pages (Home, Shop, Product Details, Cart, Checkout, Profile + Legal)",
        `Product catalog: Up to ${PRODUCT_LIMIT} products with categories & photos`,
        "Local payments: bKash, Nagad, SSLCommerz + Cash on Delivery",
        "One-page fast checkout — fewer abandoned carts",
        "Admin dashboard: manage products, orders & customers in one place",
        "Order notifications via SMS & email to your customers",
      ],
    },
    {
      id:            "business",
      name:          "Business",
      price:         BUSINESS_PRICE,         // BDT 75,000
      originalPrice: "BDT 90,000",              // ✅ Shown crossed-out
      isPopular:     true,  // "Most Popular" badge
      trustLine:     `Delivery: 5–6 weeks · Free SSL · 90 days free support · You own the source code`,
      bullets: [
        "Everything in Starter Store, plus:",
        "5 extra pages (Advanced User Dashboard, Wishlist, Order Tracking, Blog, FAQ)",
        "Unlimited product uploads",
        "Courier integration: auto parcel booking (Pathao / Steadfast / RedX)",
        "Abandoned cart recovery — remind customers to complete their order",
        "Coupon & discount engine for campaigns and sales",
        "Facebook Pixel + Conversion API + GA4 for accurate ad tracking",
      ],
    },
    {
      id:            "enterprise",
      name:          "Enterprise",
      price:         "BDT 3,00,000",
      originalPrice: "BDT 5,00,000",
      isPopular:     false,
      trustLine:     `Delivery: 10–12 weeks · Free SSL · Priority 180 days support · You own the source code`,
      bullets: [
        "Everything in Business, plus:",
        "10+ advanced views (Vendor Panel, B2B Portal, Return/Refund center)",
        "Multi-vendor architecture (allow other sellers to join & take commissions)",
        "B2B Wholesale Portal with custom tiered pricing & bulk ordering",
        "ERP / POS integration (sync live with your offline shop/warehouse)",
        "High-Traffic AWS Architecture with load balancing for big campaigns",
        "Dedicated account manager + VIP priority support",
      ],
    },
  ],

  // ─── OPTIONAL ADD-ONS ─────────────────────────────────────────────────────
  // Set `price` to a BDT string, or null → shows "Ask for quote"
  addons: [
    { name: "POS integration (offline shop sync)",    price: null },  // TODO: {{ADDON_PRICE_POS}}
    { name: "Loyalty points / referral system",       price: null },  // TODO: {{ADDON_PRICE_LOYALTY}}
    { name: "SMS / email marketing automation",       price: null },  // TODO: {{ADDON_PRICE_MARKETING}}
    { name: "AI product recommendation / chatbot",    price: null },  // TODO: {{ADDON_PRICE_AI}}
    { name: "Global payments (Stripe / PayPal)",      price: null },  // TODO: {{ADDON_PRICE_GLOBAL_PAY}}
  ],
};


/**
 * digitalProducts.js — Codalina
 *
 * Central enums, constants, and helpers for the digital products marketplace.
 * All references to product types, license types, and tech stack tags should
 * import from here so that adding a new value is a single-place change.
 */

// ─── Currency ────────────────────────────────────────────────────────────────
// Change this to 'USD' (and update formatPrice callers) when going global.
const CURRENCY = 'BDT';
const CURRENCY_SYMBOL = '৳';

// ─── Product Types ───────────────────────────────────────────────────────────
export const PRODUCT_TYPES = [
  'SaaS Tool',
  'Web Template',
  'Script/Automation',
  'Source Code',
  'UI Kit/Plugin',
];

// ─── License Types ───────────────────────────────────────────────────────────
export const LICENSE_TYPES = [
  { value: 'Personal',   label: 'Single License',   description: 'Use for 1 project/domain (Yourself or 1 Client).' },
  { value: 'Commercial', label: 'Commercial License',  description: 'Use for up to 3 projects/domains (Clients or Yourself).' },
  { value: 'Extended',   label: 'Extended License', description: 'Unlimited projects/domains and full resell rights.' },
];

// ─── Tech Stack Tags ────────────────────────────────────────────────────────
export const TECH_STACK_OPTIONS = [
  'React', 'Next.js', 'Vue', 'Nuxt.js', 'Angular', 'Svelte',
  'Node.js', 'Express', 'NestJS',
  'Python', 'Django', 'FastAPI', 'Flask',
  'PHP', 'Laravel', 'WordPress', 'Shopify',
  'TypeScript', 'JavaScript',
  'Tailwind CSS', 'SCSS/Sass', 'CSS3',
  'Figma', 'Adobe XD', 'Sketch',
  'Flutter', 'React Native', 'Swift', 'Kotlin',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Supabase', 'Firebase',
  'Framer', 'Webflow',
  'Python Script', 'Bash/Shell', 'PowerShell',
  'n8n', 'Make/Integromat', 'Zapier',
];

// ─── Product Type Icons (Lucide icon names as strings) ──────────────────────
// Used in category/filter displays.
const PRODUCT_TYPE_ICONS = {
  'SaaS Tool':          'Globe',
  'Web Template':       'Layout',
  'Script/Automation':  'Zap',
  'Source Code':        'Code2',
  'UI Kit/Plugin':      'Package',
};

// ─── Product Type Badge Colors ───────────────────────────────────────────────
export const PRODUCT_TYPE_COLORS = {
  'SaaS Tool':          'bg-[#E6E9ED] text-[#111418] dark:bg-white/10 dark:text-white',
  'Web Template':       'bg-[#E6E9ED] text-[#111418] dark:bg-white/10 dark:text-white',
  'Script/Automation':  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Source Code':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'UI Kit/Plugin':      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

// ─── License Badge Colors ────────────────────────────────────────────────────
const LICENSE_COLORS = {
  'Personal':   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  'Commercial': 'bg-[#E6E9ED] text-[#111418] dark:bg-white/10 dark:text-white',
  'Extended':   'bg-gold-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true if the product has a productType set — meaning it is a
 * digital product as opposed to a legacy physical product.
 */
export function isDigitalProduct(product) {
  return Boolean(product?.productType);
}

/**
 * Formats a price number with the site currency symbol.
 */
export function formatDigitalPrice(price) {
  const num = new Intl.NumberFormat('en-IN').format(price || 0);
  return `${CURRENCY_SYMBOL} ${num}`;
}

/**
 * Parses a JSON string safely, returning fallback on failure.
 */
export function safeParseJSON(str, fallback = []) {
  if (!str) return fallback;
  if (typeof str !== 'string') return str; // already parsed
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}



/**
 * digitalProducts.js — Codalina
 *
 * Central enums, constants, and helpers for the digital products marketplace.
 * All references to product types, license types, and tech stack tags should
 * import from here so that adding a new value is a single-place change.
 */

// ─── Currency ────────────────────────────────────────────────────────────────
// Change this to 'USD' (and update formatPrice callers) when going global.
export const CURRENCY = 'BDT';
export const CURRENCY_SYMBOL = '৳';

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
  { value: 'Personal',   label: 'Personal Use',   description: 'For personal, non-commercial projects only.' },
  { value: 'Commercial', label: 'Commercial Use',  description: 'Use in client projects and commercial products.' },
  { value: 'Extended',   label: 'Extended License', description: 'Resell or include in products sold to end users.' },
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
export const PRODUCT_TYPE_ICONS = {
  'SaaS Tool':          'Globe',
  'Web Template':       'Layout',
  'Script/Automation':  'Zap',
  'Source Code':        'Code2',
  'UI Kit/Plugin':      'Package',
};

// ─── Product Type Badge Colors ───────────────────────────────────────────────
export const PRODUCT_TYPE_COLORS = {
  'SaaS Tool':          'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  'Web Template':       'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  'Script/Automation':  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Source Code':        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'UI Kit/Plugin':      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
};

// ─── License Badge Colors ────────────────────────────────────────────────────
export const LICENSE_COLORS = {
  'Personal':   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  'Commercial': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
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

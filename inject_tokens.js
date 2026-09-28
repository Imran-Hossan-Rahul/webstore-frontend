const fs = require('fs');

const globalsPath = 'app/globals.css';
let css = fs.readFileSync(globalsPath, 'utf8');

// Replace the :root block
const rootRegex = /:root\s*\{[\s\S]*?--apple-accent-ondark:[^}]*\}/;
const newRoot = `:root {
  /* Codalina Global Background System */
  --bg-main: #F4F7FB;
  --bg-surface: #FFFFFF;
  --bg-dark-section: #0B2545;
  --bg-primary-interaction: #1D5FD1;
  --bg-tech-accent: #22C7E8;
  --bg-important-cta: #F5A623;
  --bg-success: #0B7A68;
  
  /* Codalina Typography */
  --text-primary: #0B2545;
  --text-secondary: #34435A;

  /* Legacy Fallbacks */
  --background: var(--bg-main);
  --foreground: var(--text-primary);
  --clr: rgba(228, 228, 228, 0.5);
  --font-inter: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* Apple Design Tokens */
  --apple-ink: #1d1d1f;
  --apple-text-secondary: #6e6e73;
  --apple-text-muted: #86868b;
  --apple-canvas: #ffffff;
  --apple-parchment: #f5f5f7;
  --apple-surface-dark: #272729;
  --apple-hairline: #d2d2d7;
  --apple-accent: #0066cc;
  --apple-accent-ondark: #2997ff;
}`;

css = css.replace(rootRegex, newRoot);

// Replace the dark mode header
const darkRegex = /\[data-theme="dark"\]\s*\{\s*--background:\s*#0B2545;\s*--foreground:\s*#F4F7FB;/;
const newDark = `[data-theme="dark"] {
  /* Codalina Global Background System (Dark Mode) */
  --bg-main: #0B2545;
  --bg-surface: #123058;
  --bg-dark-section: #06172E;
  --bg-primary-interaction: #1D5FD1;
  --bg-tech-accent: #22C7E8;
  --bg-important-cta: #F5A623;
  --bg-success: #0B7A68;
  
  /* Codalina Typography (Dark Mode) */
  --text-primary: #FFFFFF;
  --text-secondary: #8DA4C4;

  /* Legacy Fallbacks */
  --background: var(--bg-main);
  --foreground: var(--text-primary);`;

css = css.replace(darkRegex, newDark);

fs.writeFileSync(globalsPath, css, 'utf8');

const tailwindPath = 'tailwind.config.js';
let tw = fs.readFileSync(tailwindPath, 'utf8');

// Inject the semantic tokens into tailwind.config.js under extend.colors.brand
const brandRegex = /brand:\s*\{/;
const newBrand = `brand: {
          /* New Semantic Tokens */
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          dark: 'var(--bg-dark-section)',
          interaction: 'var(--bg-primary-interaction)',
          accent: 'var(--bg-tech-accent)',
          cta: 'var(--bg-important-cta)',
          success: 'var(--bg-success)',
          text: 'var(--text-primary)',
          muted: 'var(--text-secondary)',
          `;

tw = tw.replace(brandRegex, newBrand);
fs.writeFileSync(tailwindPath, tw, 'utf8');

console.log("Tokens generated successfully in globals.css and tailwind.config.js");

const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'components/dashboard/GlassNavbar.jsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// Replace excessive glassmorphism in search dropdowns with solid surface
content = content.replace(
  /bg-brand-surface\/95 dark:bg-brand-surface\/95 backdrop-blur-3xl border border-brand-navy\/\[0\.10\]\/60 dark:border-white\/10 rounded-\[4px\] shadow-sm/g,
  'bg-brand-surface dark:bg-brand-dark border border-brand-navy/[0.10] dark:border-white/10 rounded-[4px] shadow-[0_8px_32px_rgba(11,37,69,0.08)]'
);

fs.writeFileSync(navbarPath, content, 'utf8');
console.log('Updated GlassNavbar.jsx search dropdowns');

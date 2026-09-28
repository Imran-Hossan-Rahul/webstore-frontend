const fs = require('fs');
const path = require('path');

const layoutPath = path.join(__dirname, 'app/(dashboard)/layout.js');
let content = fs.readFileSync(layoutPath, 'utf8');

// 1. Fix Left Sidebar wrapper
// hover:bg-brand-cloud hover:dark:bg-brand-navy border-brand-navy/[0.08] dark:border-white/10
content = content.replace(
  /hover:bg-brand-cloud hover:dark:bg-brand-navy/g,
  'bg-brand-surface dark:bg-brand-dark'
);

// We should also remove `style={{ background: 'transparent' }}` because that makes the sidebar invisible against the background, violating "Use #FFFFFF as the primary background."
content = content.replace(
  /style={{ background: 'transparent' }}/g,
  ''
);

// Ensure it has a border right
content = content.replace(
  /border-r border-brand-navy\/\[0\.08\]/g,
  'border-r border-brand-navy/[0.08] shadow-[1px_0_10px_rgba(11,37,69,0.02)]' // very subtle depth
);

// 2. Fix Right Sidebar wrapper if it exists in layout.js
// Actually, RightSidebar might be rendered inside the pages, e.g. MarketClientView.jsx or layout.js.
// Let's just run a generic replace for right sidebar styles in layout.js if they are there.

fs.writeFileSync(layoutPath, content, 'utf8');
console.log('Updated app/(dashboard)/layout.js sidebars');

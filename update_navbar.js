const fs = require('fs');
const path = require('path');

const navbarPath = path.join(__dirname, 'components/dashboard/GlassNavbar.jsx');
let content = fs.readFileSync(navbarPath, 'utf8');

// 1. Change Background and Border of Navbar
content = content.replace(
  /bg-brand-navy border-b border-white\/10/g,
  'bg-brand-surface dark:bg-brand-dark border-b border-brand-navy/[0.08] dark:border-white/10 shadow-sm'
);

// 2. Change Text Colors in Navbar
// "text-white" in navbar icons and text should become "text-brand-navy dark:text-white"
// Let's replace specific known parts.
content = content.replace(
  /<Menu strokeWidth={1.5} className="w-\[22px\] h-\[22px\] text-white" \/>/g,
  '<Menu strokeWidth={1.5} className="w-[22px] h-[22px] text-brand-navy dark:text-white" />'
);
content = content.replace(
  /<X strokeWidth={1.5} className="w-\[22px\] h-\[22px\] text-white" \/>/g,
  '<X strokeWidth={1.5} className="w-[22px] h-[22px] text-brand-navy dark:text-white" />'
);
content = content.replace(
  /className="font-medium text-xl tracking-tight text-white font-sans"/g,
  'className="font-medium text-xl tracking-tight text-brand-navy dark:text-white font-sans"'
);
content = content.replace(
  /className="text-\[10px\] font-bold uppercase tracking-wider bg-white\/10 text-white\/90/g,
  'className="text-[10px] font-bold uppercase tracking-wider bg-brand-cyan/10 text-brand-cyan'
);

// Fix Notification/Chat icon buttons which might be text-white
content = content.replace(
  /text-white\/80 hover:text-white hover:bg-white\/10/g,
  'text-brand-slate hover:text-brand-navy hover:bg-brand-main dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10'
);
content = content.replace(
  /text-white hover:bg-white\/10/g,
  'text-brand-navy dark:text-white hover:bg-brand-main dark:hover:bg-white/10'
);
content = content.replace(
  /className="text-white"/g,
  'className="text-brand-navy dark:text-white"'
);

fs.writeFileSync(navbarPath, content, 'utf8');
console.log('Updated GlassNavbar.jsx');

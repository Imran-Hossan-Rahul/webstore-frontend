const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const components = {
  'FooterSection.jsx': `
import React from 'react';
import Link from 'next/link';

export const FooterSection = ({ className = '', logo, links = [], bottomText }) => (
  <footer className={\`w-full bg-white dark:bg-[#0D1117] border-t border-slate-200 dark:border-white/10 pt-16 pb-8 \${className}\`}>
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between gap-12 mb-16">
        <div className="max-w-xs">
          {logo || <div className="text-[20px] font-display font-bold text-brand-navy dark:text-white mb-4">Codalina</div>}
          <p className="text-[13px] font-sans text-slate-500">
            Premium digital assets, tools, and UI kits for elite developers and designers.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
          {links.map((group, idx) => (
            <div key={idx}>
              <h4 className="text-[11px] font-mono tracking-widest uppercase text-brand-navy dark:text-white mb-6">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-4">
                {group.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link href={item.href} className="text-[13px] font-sans text-slate-500 hover:text-brand-blue transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[12px] font-sans text-slate-400">
          {bottomText || \`© \${new Date().getFullYear()} Codalina. All rights reserved.\`}
        </p>
        <div className="flex items-center gap-6 text-[12px] font-sans text-slate-400">
          <Link href="/terms" className="hover:text-brand-navy dark:hover:text-white transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-brand-navy dark:hover:text-white transition-colors">Privacy</Link>
        </div>
      </div>
    </div>
  </footer>
);
`,

  'CTASection.jsx': `
import React from 'react';
import { Button } from './Button';

export const CTASection = ({ 
  title, 
  description, 
  primaryAction, 
  secondaryAction, 
  className = '' 
}) => (
  <div className={\`w-full bg-brand-navy dark:bg-[#161B22] border-y border-brand-navy dark:border-white/10 py-24 \${className}\`}>
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-[32px] md:text-[40px] font-display font-medium text-white mb-6 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[16px] md:text-[18px] font-sans text-slate-300 mb-10 max-w-2xl mx-auto">
          {description}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {primaryAction && (
          <Button size="lg" className="w-full sm:w-auto" onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 dark:border-white/10 dark:text-white dark:hover:bg-white/5" 
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  </div>
);
`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(uiDir, name), content.trim() + '\n', 'utf-8');
  console.log('Created:', name);
}

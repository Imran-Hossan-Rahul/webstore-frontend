const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const components = {
  'PageContainer.jsx': `
import React from 'react';

export const PageContainer = ({ children, className = '', maxWidth = 'max-w-[1400px]', ...props }) => {
  return (
    <div className={\`w-full \${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-8 \${className}\`} {...props}>
      {children}
    </div>
  );
};
`,
  
  'PageHeader.jsx': `
import React from 'react';

export const PageHeader = ({ title, description, actions, className = '', ...props }) => {
  return (
    <div className={\`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 \${className}\`} {...props}>
      <div>
        <h1 className="text-[24px] md:text-[28px] font-display font-medium text-brand-navy dark:text-white leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] font-sans text-slate-500 mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
`,
  
  'SectionHeader.jsx': `
import React from 'react';

export const SectionHeader = ({ title, badge, action, className = '', ...props }) => {
  return (
    <div className={\`flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-6 \${className}\`} {...props}>
      <div className="flex items-center gap-3">
        <h2 className="text-[18px] md:text-[20px] font-display font-medium text-brand-navy dark:text-white">
          {title}
        </h2>
        {badge && (
          <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[11px] font-mono tracking-widest uppercase rounded-[4px] border border-brand-blue/20">
            {badge}
          </span>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
`,

  'Tabs.jsx': `
import React from 'react';

export const Tabs = ({ tabs, activeTab, onChange, className = '', ...props }) => {
  return (
    <div className={\`flex overflow-x-auto scrollbar-hide border-b border-slate-200 dark:border-white/10 \${className}\`} {...props}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={\`px-6 py-3 text-[14px] font-sans font-medium whitespace-nowrap border-b-2 transition-colors \${
              isActive 
                ? 'border-brand-blue text-brand-blue' 
                : 'border-transparent text-slate-500 hover:text-brand-navy dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30'
            }\`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={\`ml-2 text-[11px] font-mono px-2 py-0.5 rounded-[4px] \${isActive ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 dark:bg-white/5 text-slate-500'}\`}>
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
`,

  'StatusBadge.jsx': `
import React from 'react';
import { Badge } from './Badge';

export const StatusBadge = ({ status, ...props }) => {
  const normalizedStatus = status?.toLowerCase();
  
  let variant = 'default';
  
  if (['active', 'delivered', 'paid', 'success', 'verified'].includes(normalizedStatus)) {
    variant = 'success';
  } else if (['pending', 'processing', 'in review'].includes(normalizedStatus)) {
    variant = 'warning';
  } else if (['cancelled', 'failed', 'rejected', 'error'].includes(normalizedStatus)) {
    variant = 'danger';
  } else if (['new', 'open'].includes(normalizedStatus)) {
    variant = 'primary';
  }
  
  return (
    <Badge variant={variant} {...props}>
      {status || 'Unknown'}
    </Badge>
  );
};
`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(uiDir, name), content.trim() + '\n', 'utf-8');
  console.log('Created:', name);
}

const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const components = {
  'Select.jsx': `
import React from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = React.forwardRef(({ 
  className = '', 
  label, 
  error, 
  options = [],
  id,
  ...props 
}, ref) => {
  const generatedId = id || React.useId();
  
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={generatedId} className="block text-[11px] font-mono tracking-widest text-slate-500 uppercase mb-1">
          {label}
        </label>
      )}
      <div className="relative w-full">
        <select 
          id={generatedId}
          ref={ref}
          className={\`appearance-none w-full bg-white dark:bg-[#0D1117] border \${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-[4px] h-10 px-3 pr-10 text-[14px] font-sans text-brand-navy dark:text-white focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors \${className}\`}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown size={16} />
        </div>
      </div>
      {error && <span className="text-[12px] font-sans text-red-500 mt-1">{error}</span>}
    </div>
  );
});
Select.displayName = 'Select';
`,

  'SearchInput.jsx': `
import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = React.forwardRef(({ 
  className = '', 
  onClear,
  value,
  ...props 
}, ref) => {
  return (
    <div className="relative w-full group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
        <Search size={16} />
      </div>
      <input 
        ref={ref}
        value={value}
        className={\`w-full bg-white dark:bg-[#0D1117] border border-slate-200 dark:border-white/10 rounded-[4px] h-10 pl-10 pr-10 text-[14px] font-sans text-brand-navy dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors \${className}\`}
        {...props}
      />
      {value && onClear && (
        <button 
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-navy dark:hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
});
SearchInput.displayName = 'SearchInput';
`,

  'Breadcrumbs.jsx': `
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs = ({ items, className = '', ...props }) => {
  return (
    <nav className={\`flex items-center text-[11px] font-mono tracking-widest uppercase text-slate-500 \${className}\`} {...props}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center">
            {isLast ? (
              <span className="text-brand-navy dark:text-white font-medium">{item.label}</span>
            ) : (
              <Link href={item.href || '#'} className="hover:text-brand-blue transition-colors">
                {item.label}
              </Link>
            )}
            {!isLast && <ChevronRight size={14} className="mx-2 opacity-50" />}
          </div>
        );
      })}
    </nav>
  );
};
`,

  'Pagination.jsx': `
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from './IconButton';

export const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  // Simplified logic: show max 5 pages around current
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={\`flex items-center justify-center gap-2 mt-8 \${className}\`}>
      <IconButton 
        icon={<ChevronLeft size={16} />} 
        variant="outline" 
        size="sm" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      
      {pages.map((p, i) => (
        p === '...' ? (
          <span key={i} className="px-2 text-slate-400">...</span>
        ) : (
          <button
            key={i}
            onClick={() => onPageChange(p)}
            className={\`w-8 h-8 flex items-center justify-center rounded-[4px] text-[13px] font-sans font-medium transition-colors \${
              p === currentPage
                ? 'bg-brand-blue text-white'
                : 'bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 text-brand-navy dark:text-white hover:border-brand-blue hover:text-brand-blue'
            }\`}
          >
            {p}
          </button>
        )
      ))}

      <IconButton 
        icon={<ChevronRight size={16} />} 
        variant="outline" 
        size="sm" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
};
`,

  'Table.jsx': `
import React from 'react';

export const Table = ({ className = '', children, ...props }) => (
  <div className="w-full overflow-x-auto rounded-[4px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161B22]">
    <table className={\`w-full text-left border-collapse \${className}\`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ className = '', children, ...props }) => (
  <thead className={\`bg-slate-50 dark:bg-[#0D1117] border-b border-slate-200 dark:border-white/10 \${className}\`} {...props}>
    {children}
  </thead>
);

export const TableRow = ({ className = '', children, ...props }) => (
  <tr className={\`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors last:border-0 \${className}\`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ className = '', children, ...props }) => (
  <th className={\`px-6 py-4 text-[11px] font-mono font-medium text-slate-500 uppercase tracking-widest \${className}\`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ className = '', children, ...props }) => (
  <td className={\`px-6 py-4 text-[14px] font-sans text-brand-navy dark:text-slate-300 \${className}\`} {...props}>
    {children}
  </td>
);
`,

  'States.jsx': `
import React from 'react';
import { AlertCircle, Loader2, FileX } from 'lucide-react';
import { Button } from './Button';

export const LoadingState = ({ message = 'Loading...', className = '' }) => (
  <div className={\`flex flex-col items-center justify-center p-12 text-slate-500 \${className}\`}>
    <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
    <p className="text-[14px] font-sans">{message}</p>
  </div>
);

export const ErrorState = ({ title = 'Something went wrong', message, onRetry, className = '' }) => (
  <div className={\`flex flex-col items-center justify-center p-12 text-center bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-[4px] \${className}\`}>
    <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
    <h3 className="text-[16px] font-display font-medium text-brand-navy dark:text-white mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500 mb-6 max-w-md">{message}</p>}
    {onRetry && <Button variant="outline" onClick={onRetry}>Try Again</Button>}
  </div>
);

export const EmptyState = ({ title = 'No Data Found', message, icon, action, className = '' }) => (
  <div className={\`flex flex-col items-center justify-center p-16 text-center bg-brand-cloud dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] \${className}\`}>
    <div className="text-slate-300 dark:text-slate-600 mb-6">
      {icon || <FileX size={48} />}
    </div>
    <h3 className="text-[18px] font-display font-medium text-brand-navy dark:text-white mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500 mb-6 max-w-md">{message}</p>}
    {action && <div>{action}</div>}
  </div>
);
`,

  'Drawer.jsx': `
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export const Drawer = ({ isOpen, onClose, title, children, position = 'right', width = 'w-96' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const positionClasses = {
    right: 'right-0 border-l',
    left: 'left-0 border-r',
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className={\`absolute top-0 bottom-0 bg-white dark:bg-[#0D1117] \${width} \${positionClasses[position]} border-slate-200 dark:border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out\`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-[18px] font-display font-medium text-brand-navy dark:text-white">{title}</h2>
          <IconButton icon={<X size={18} />} variant="ghost" size="sm" onClick={onClose} />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
};
`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(uiDir, name), content.trim() + '\n', 'utf-8');
  console.log('Created:', name);
}

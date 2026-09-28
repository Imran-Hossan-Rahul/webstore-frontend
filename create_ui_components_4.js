const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'components', 'ui');
if (!fs.existsSync(uiDir)) fs.mkdirSync(uiDir, { recursive: true });

const components = {
  'Dropdown.jsx': `
import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({ trigger, children, align = 'right', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div className={\`relative inline-block text-left \${className}\`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={\`absolute z-50 mt-2 w-48 rounded-[4px] shadow-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 \${alignmentClass}\`}>
          <div className="py-1" role="menu" aria-orientation="vertical">
            {React.Children.map(children, child => {
              if (React.isValidElement(child)) {
                return React.cloneElement(child, {
                  onClick: (e) => {
                    if (child.props.onClick) child.props.onClick(e);
                    setIsOpen(false);
                  }
                });
              }
              return child;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({ children, onClick, className = '', ...props }) => (
  <button
    onClick={onClick}
    className={\`w-full text-left px-4 py-2 text-[13px] font-sans text-brand-navy dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors \${className}\`}
    role="menuitem"
    {...props}
  >
    {children}
  </button>
);
`,

  'SidebarItem.jsx': `
import React from 'react';
import Link from 'next/link';

export const SidebarItem = ({ icon, label, href, isActive, badge, ...props }) => {
  return (
    <Link 
      href={href}
      className={\`flex items-center justify-between px-4 py-2.5 rounded-[4px] transition-all group \${
        isActive 
          ? 'bg-slate-100 dark:bg-white/5 text-brand-navy dark:text-white' 
          : 'text-slate-500 hover:text-brand-navy dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'
      }\`}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && React.cloneElement(icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
        <span className={\`text-[13px] font-bold tracking-tight \${isActive ? 'opacity-100' : 'opacity-80'}\`}>
          {label}
        </span>
      </div>
      {badge > 0 && (
        <span className="w-5 h-5 flex items-center justify-center bg-brand-blue text-white text-[9px] font-bold rounded-[4px]">
          {badge}
        </span>
      )}
    </Link>
  );
};
`,

  'NavigationGroup.jsx': `
import React from 'react';

export const NavigationGroup = ({ title, children, className = '' }) => {
  return (
    <div className={\`mb-6 \${className}\`}>
      {title && (
        <h4 className="px-4 mb-2 text-[10px] font-mono tracking-widest uppercase text-slate-400">
          {title}
        </h4>
      )}
      <div className="flex flex-col gap-1">
        {children}
      </div>
    </div>
  );
};
`,

  'ProductCard.jsx': `
import React from 'react';
import Link from 'next/link';

export const ProductCard = ({ product, getOptimizedUrl, formatPrice, className = '' }) => {
  let coverImage = '';
  try {
    const photos = typeof product.photos === 'string' ? JSON.parse(product.photos) : product.photos;
    if (photos && photos.length > 0) coverImage = getOptimizedUrl(photos[0]);
  } catch(e) {}

  return (
    <Link href={\`/product/\${product.id}\`} className={\`group flex flex-col bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 rounded-[4px] overflow-hidden hover:border-brand-blue dark:hover:border-brand-blue/50 transition-all \${className}\`}>
      {/* Cover Image */}
      <div className="aspect-[4/3] w-full bg-brand-cloud dark:bg-[#0D1117] border-b border-slate-200 dark:border-white/10 relative overflow-hidden flex items-center justify-center p-4">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">No Image</span>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isFeatured && (
            <span className="bg-brand-blue text-white text-[10px] font-mono font-medium tracking-widest uppercase px-2 py-1 rounded-[4px]">
              Featured
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-[14px] font-sans font-medium text-brand-navy dark:text-white line-clamp-1 mb-1 group-hover:text-brand-blue transition-colors">
          {product.title}
        </h3>
        
        <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500 line-clamp-1 mb-4">
          {[product.category, product.sub_category].filter(Boolean).join(' • ')}
        </div>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-end gap-2">
            <span className="text-[15px] font-mono font-medium text-brand-navy dark:text-white">
              BDT {formatPrice(product.selling_price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
`
};

for (const [name, content] of Object.entries(components)) {
  fs.writeFileSync(path.join(uiDir, name), content.trim() + '\n', 'utf-8');
  console.log('Created:', name);
}

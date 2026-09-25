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
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={`absolute z-50 mt-2 w-48 rounded-[4px] shadow-lg bg-white dark:bg-[#161B22] border border-slate-200 dark:border-white/10 ${alignmentClass}`}>
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
    className={`w-full text-left px-4 py-2 text-[13px] font-sans text-brand-navy dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${className}`}
    role="menuitem"
    {...props}
  >
    {children}
  </button>
);

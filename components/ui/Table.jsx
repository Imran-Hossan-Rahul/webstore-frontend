import React from 'react';

export const Table = ({ className = '', children, ...props }) => (
  <div className="w-full overflow-x-auto rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 bg-brand-surface dark:bg-brand-surface">
    <table className={`w-full text-left border-collapse ${className}`} {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader = ({ className = '', children, ...props }) => (
  <thead className={`bg-slate-50 dark:bg-brand-surface border-b border-brand-navy/[0.08] dark:border-white/10 ${className}`} {...props}>
    {children}
  </thead>
);

export const TableRow = ({ className = '', children, ...props }) => (
  <tr className={`border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:bg-brand-surface dark:hover:bg-brand-surface/5 transition-colors last:border-0 ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead = ({ className = '', children, ...props }) => (
  <th className={`px-6 py-4 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-widest ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell = ({ className = '', children, ...props }) => (
  <td className={`px-6 py-4 text-[14px] font-sans text-brand-navy dark:text-slate-300 ${className}`} {...props}>
    {children}
  </td>
);

import React from 'react';
import { AlertCircle, Loader2, FileX, CheckCircle, Clock, XCircle, Ban, ServerCrash } from 'lucide-react';
import { Button } from './Button';
import { EmptyState as BaseEmptyState } from './EmptyState';

// ─── Loading & Processing States ──────────────────────────────────────────────

export const LoadingState = ({ message = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-brand-cloud/50  rounded-[4px] border border-brand-navy/[0.08]/50  ${className}`}>
    <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-4" />
    <p className="text-[13px] font-mono text-slate-500  uppercase tracking-widest">{message}</p>
  </div>
);

export const ProcessingState = ({ message = 'Processing your request...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-brand-cloud/50  rounded-[4px] border border-brand-navy/[0.08]/50  ${className}`}>
    <div className="relative mb-6">
      <div className="w-10 h-10 rounded-[4px] bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
        <Loader2 className="w-5 h-5 animate-spin text-brand-blue" />
      </div>
    </div>
    <h3 className="text-[16px] font-display font-medium text-brand-navy  mb-2">{message}</h3>
    <p className="text-[14px] font-sans text-slate-500  max-w-sm leading-relaxed">
      Please do not close this window or refresh the page while we process your request.
    </p>
  </div>
);

// ─── Error & Unavailable States ───────────────────────────────────────────────

export const ErrorState = ({ title = 'An issue occurred', message, onRetry, actionLabel = 'Try Again', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-brand-surface  border border-brand-navy/[0.08]  rounded-[4px] ${className}`}>
    <div className="w-10 h-10 rounded-[4px] bg-red-50  flex items-center justify-center border border-red-100  mb-5">
      <AlertCircle className="w-5 h-5 text-red-500" />
    </div>
    <h3 className="text-[16px] font-display font-medium text-brand-navy  mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500  max-w-md leading-relaxed mb-6">{message}</p>}
    {onRetry && <Button variant="outline" onClick={onRetry}>{actionLabel}</Button>}
  </div>
);

export const UnavailableState = ({ title = 'Service Unavailable', message = 'This service or resource is currently unavailable. Please try again later.', className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-slate-50  border border-brand-navy/[0.08]  rounded-[4px] ${className}`}>
    <div className="w-10 h-10 rounded-[4px] bg-slate-100  flex items-center justify-center border border-brand-navy/[0.08]  mb-5">
      <ServerCrash className="w-5 h-5 text-slate-400" />
    </div>
    <h3 className="text-[16px] font-display font-medium text-slate-700  mb-2">{title}</h3>
    <p className="text-[14px] font-sans text-slate-500  max-w-md leading-relaxed">{message}</p>
  </div>
);

export const DisabledState = ({ title = 'Access Disabled', message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-brand-cloud  border border-brand-navy/[0.08]  rounded-[4px] opacity-75 ${className}`}>
    <div className="w-10 h-10 rounded-[4px] bg-slate-200  flex items-center justify-center mb-5">
      <Ban className="w-5 h-5 text-slate-500 " />
    </div>
    <h3 className="text-[16px] font-display font-medium text-brand-navy  mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500  max-w-md leading-relaxed">{message}</p>}
  </div>
);

// ─── Success & Status States ──────────────────────────────────────────────────

export const SuccessState = ({ title = 'Completed Successfully', message, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-brand-teal/5 border border-brand-teal/20 rounded-[4px] ${className}`}>
    <div className="w-10 h-10 rounded-[4px] bg-brand-teal/10 flex items-center justify-center border border-brand-teal/30 mb-5">
      <CheckCircle className="w-5 h-5 text-brand-teal" />
    </div>
    <h3 className="text-[16px] font-display font-medium text-brand-navy  mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500  max-w-md leading-relaxed mb-6">{message}</p>}
    {action && <div>{action}</div>}
  </div>
);

export const PendingState = ({ title = 'Pending Approval', message, className = '' }) => (
  <div className={`flex flex-col items-center justify-center p-12 text-center w-full min-h-[200px] bg-amber-50  border border-amber-200  rounded-[4px] ${className}`}>
    <div className="w-10 h-10 rounded-[4px] bg-amber-100  flex items-center justify-center border border-amber-200  mb-5">
      <Clock className="w-5 h-5 text-amber-500" />
    </div>
    <h3 className="text-[16px] font-display font-medium text-brand-navy  mb-2">{title}</h3>
    {message && <p className="text-[14px] font-sans text-slate-500  max-w-md leading-relaxed">{message}</p>}
  </div>
);

// We export the existing EmptyState for backwards compatibility
export const EmptyState = BaseEmptyState;


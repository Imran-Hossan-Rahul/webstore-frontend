// AutoSaveIndicator.jsx - Auto-save Status Indicator

import React from 'react';
import { Check, Loader2, AlertCircle } from "lucide-react";

export default function AutoSaveIndicator({ saveState, lastSaved }) {
  const getTimeAgo = (date) => {
    if (!date) return '';
    
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (saveState === 'idle') return null;

  return (
    <div className="auto-save-indicator">
      {saveState === 'saving' && (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
          <span className="text-slate-600">Saving...</span>
        </>
      )}
      
      {saveState === 'saved' && (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-slate-600">Saved {getTimeAgo(lastSaved)}</span>
        </>
      )}
      
      {saveState === 'error' && (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-600">Save failed</span>
        </>
      )}
    </div>
  );
}

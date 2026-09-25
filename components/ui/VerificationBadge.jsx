import React from 'react';
import { CheckCircle2 } from "lucide-react";

const VerificationBadge = ({ size = 16, className = "" }) => {
  return (
    <div className={`inline-flex items-center justify-center text-brand-blue ${className}`} title="Verified Account">
      <CheckCircle2 size={size} strokeWidth={1.5} fill="currentColor" className="text-white fill-blue-500" />
    </div>
  );
};

export default VerificationBadge;

"use client";

import React from 'react';
import VerificationRequests from '@/components/AdminComponents/VerificationRequests';

export default function AdminVerificationPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Verification</h1>
        <p className="text-slate-500">Manage enterprise authorization and identity verification</p>
      </div>
      
      <VerificationRequests />
    </div>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProcurementDashboard() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    // In a real app, this points to process.env.NEXT_PUBLIC_API_URL
    axios.get('http://localhost:5000/api/v1/market/procurement/candidates')
      .then(res => setCandidates(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleProcure = async (wholesalerId, orderItemIds) => {
    try {
      await axios.post('http://localhost:5000/api/v1/market/procurement/run', {
        wholesaler_id: wholesalerId,
        order_item_ids: orderItemIds
      });
      alert('Procurement run created!');
      setCandidates(candidates.filter(c => c.wholesaler_id !== wholesalerId));
    } catch (err) {
      console.error(err);
      alert('Failed to procure');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-brand-navy dark:text-white">
      <h1 className="text-3xl font-bold mb-6 text-blue-400">Procurement Dashboard</h1>
      <p className="mb-8 text-slate-500 dark:text-slate-400">Products that have crossed their threshold and are ready to be procured from wholesalers.</p>
      
      <div className="grid gap-6">
        {candidates.map(product => (
          <div key={product.id} className="bg-brand-cloud dark:bg-brand-surface p-6 rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10">
            <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Wholesaler: <span className="text-brand-navy dark:text-white">{product.wholesaler?.name}</span>
            </p>
            <div className="flex justify-between items-center bg-brand-surface dark:bg-brand-surface p-4 rounded mb-4">
              <div>
                <span className="block text-sm text-slate-500 dark:text-slate-400">Confirmed Orders</span>
                <span className="text-[24px] font-display font-medium text-green-400">{product.orderItems.length}</span>
              </div>
              <div>
                <span className="block text-sm text-slate-500 dark:text-slate-400">Threshold</span>
                <span className="text-[24px] font-display font-medium">{product.procurement_threshold}</span>
              </div>
            </div>
            <button 
              onClick={() => handleProcure(product.wholesaler_id, product.orderItems.map(i => i.id))}
              className="bg-brand-blue hover:bg-blue-700 text-white px-4 py-2 rounded transition"
            >
              Generate Pick List & Procure
            </button>
          </div>
        ))}
        
        {candidates.length === 0 && (
          <div className="text-center p-12 bg-brand-cloud dark:bg-brand-surface rounded-[4px] border border-brand-navy/[0.08] dark:border-white/10 text-slate-500 dark:text-slate-400">
            No products have reached their procurement threshold yet.
          </div>
        )}
      </div>
    </div>
  );
}

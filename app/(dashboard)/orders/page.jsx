import React from 'react';
import OrdersList from '@/components/orders/OrdersList';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black pt-20 pb-16 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6 text-[#1d1d1f] dark:text-white">Your Orders</h1>
        <OrdersList />
      </div>
    </div>
  );
}

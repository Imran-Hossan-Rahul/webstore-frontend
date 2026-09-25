import React from 'react';
import OrdersList from '@/components/orders/OrdersList';
import { PageContainer } from '@/components/ui/PageContainer';
import { PageHeader } from '@/components/ui/PageHeader';

export default function OrdersPage() {
  return (
    <PageContainer>
      <PageHeader title="Your Orders" />
      <OrdersList />
    </PageContainer>
  );
}

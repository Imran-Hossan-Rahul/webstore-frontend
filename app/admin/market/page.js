import { redirect } from 'next/navigation';

export default function MarketAdminIndex() {
  redirect('/admin/market/products');
}

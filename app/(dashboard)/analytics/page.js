import CraftsmanAnalytics from '@/components/dashboard/analytics/CreatorAnalytics';

export const metadata = {
  title: 'Analytics | Craftsman Dashboard',
  description: 'View your content performance and audience insights',
};

export default function AnalyticsPage() {
  return (
    <div className="w-full h-full pb-20">
      <CraftsmanAnalytics />
    </div>
  );
}


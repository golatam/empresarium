import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getOrders } from '@/lib/queries/orders';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { AdminOrdersTable } from '@/components/admin/admin-orders-table';

export default async function AdminOrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);
  if (user.profile.role !== 'admin') return redirect(`/${locale}/dashboard`);

  const orders = await getOrders();

  return (
    <div>
      <PageHeader title={t('ordersManagement')} />
      <AdminOrdersTable orders={orders} locale={locale} />
    </div>
  );
}

import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getOrders } from '@/lib/queries/orders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { OrderCard } from '@/components/orders/order-card';

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('orders');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);

  const { profile } = user;

  const filters: Record<string, string> = {};
  if (profile.role === 'client') filters.clientId = user.id;
  if (profile.role === 'partner') filters.partnerId = user.id;

  const orders = await getOrders(
    profile.role === 'client'
      ? { clientId: user.id }
      : profile.role === 'partner'
        ? { partnerId: user.id }
        : undefined
  );

  return (
    <div>
      <PageHeader
        title={t('title')}
        action={
          profile.role === 'client' ? (
            <Link href={`/${locale}/orders/new`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                {t('newOrder')}
              </Button>
            </Link>
          ) : undefined
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t('title')}
          description="No orders found"
          action={
            profile.role === 'client' ? (
              <Link href={`/${locale}/orders/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('newOrder')}
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

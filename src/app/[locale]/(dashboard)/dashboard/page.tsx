import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getOrdersCount } from '@/lib/queries/orders';
import { getUnreadCount } from '@/lib/queries/messages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, MessageSquare, CheckCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const user = await getCurrentUser();

  if (!user) return redirect(`/${locale}/login`);

  const { profile } = user;

  // Fetch stats based on role
  let activeOrders = 0;
  let completedOrders = 0;
  let totalOrders = 0;
  let unreadMessages = 0;

  if (profile.role === 'client') {
    [activeOrders, completedOrders, totalOrders, unreadMessages] = await Promise.all([
      getOrdersCount({ clientId: user.id, status: undefined }).then((c) => c), // we'll count non-draft, non-completed
      getOrdersCount({ clientId: user.id, status: 'completed' }),
      getOrdersCount({ clientId: user.id }),
      getUnreadCount(user.id),
    ]);
  } else if (profile.role === 'partner') {
    [activeOrders, completedOrders, totalOrders, unreadMessages] = await Promise.all([
      getOrdersCount({ partnerId: user.id }),
      getOrdersCount({ partnerId: user.id, status: 'completed' }),
      getOrdersCount({ partnerId: user.id }),
      getUnreadCount(user.id),
    ]);
  } else {
    // Admin sees all
    [totalOrders, completedOrders, unreadMessages] = await Promise.all([
      getOrdersCount(),
      getOrdersCount({ status: 'completed' }),
      getUnreadCount(user.id),
    ]);
    activeOrders = totalOrders - completedOrders;
  }

  const stats = [
    { label: t('totalOrders'), value: totalOrders, icon: FileText },
    { label: t('activeOrders'), value: activeOrders, icon: Clock },
    { label: t('completedOrders'), value: completedOrders, icon: CheckCircle },
    { label: t('unreadMessages'), value: unreadMessages, icon: MessageSquare },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('welcome', { name: profile.full_name || '' })}
          </h1>
          <p className="text-muted-foreground">
            {profile.role === 'client' && t('clientTitle')}
            {profile.role === 'partner' && t('partnerTitle')}
            {profile.role === 'admin' && t('adminTitle')}
          </p>
        </div>
        {profile.role === 'client' && (
          <Link href={`/${locale}/orders/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t('createOrder')}
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('quickActions')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href={`/${locale}/orders`}>
              <Button variant="outline">{t('viewOrders')}</Button>
            </Link>
            {profile.role === 'client' && (
              <Link href={`/${locale}/orders/new`}>
                <Button variant="outline">{t('createOrder')}</Button>
              </Link>
            )}
            {profile.role === 'admin' && (
              <Link href={`/${locale}/admin/orders`}>
                <Button variant="outline">Admin Panel</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

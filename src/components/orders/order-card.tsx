import { useTranslations } from 'next-intl';
import type { OrderWithRelations } from '@/types/order';
import { getLocalizedName } from '@/types/country';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from './status-badge';

interface OrderCardProps {
  order: OrderWithRelations;
  locale: string;
  onClick?: () => void;
}

export function OrderCard({ order, locale, onClick }: OrderCardProps) {
  const t = useTranslations('orders');

  const formattedDate = new Date(order.created_at).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const countryName = order.country ? getLocalizedName(order.country, locale) : '';

  return (
    <Card
      className={onClick ? 'cursor-pointer transition-shadow hover:shadow-md' : ''}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {t('orderNumber', { number: order.order_number })}
          </CardTitle>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('companyName')}</span>
            <span className="font-medium">{order.company_name}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('country')}</span>
            <span className="flex items-center gap-1.5">
              {order.country?.flag_url && (
                <img
                  src={order.country.flag_url}
                  alt={countryName}
                  className="h-4 w-5 rounded-sm object-cover"
                />
              )}
              <span>{countryName}</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('createdAt')}</span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{t('assignedPartner')}</span>
            <span>
              {order.partner?.full_name ?? (
                <span className="italic text-muted-foreground">{t('unassigned')}</span>
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

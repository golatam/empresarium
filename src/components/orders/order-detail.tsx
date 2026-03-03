import { getTranslations } from 'next-intl/server';
import type { OrderWithRelations } from '@/types/order';
import type { OrderStatus } from '@/types/database';
import { getLocalizedName, getLocalizedDescription } from '@/types/country';
import { getOrderStatusHistory } from '@/lib/queries/orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from './status-badge';
import { OrderTimeline } from './order-timeline';

interface OrderDetailProps {
  order: OrderWithRelations;
  locale: string;
}

const STATUS_TRANSLATION_KEYS: Record<OrderStatus, string> = {
  draft: 'statusDraft',
  submitted: 'statusSubmitted',
  under_review: 'statusUnderReview',
  documents_requested: 'statusDocumentsRequested',
  documents_received: 'statusDocumentsReceived',
  in_progress: 'statusInProgress',
  government_filing: 'statusGovernmentFiling',
  completed: 'statusCompleted',
  cancelled: 'statusCancelled',
};

export async function OrderDetail({ order, locale }: OrderDetailProps) {
  const t = await getTranslations('orders');
  const tWizard = await getTranslations('wizard');

  const statusHistory = await getOrderStatusHistory(order.id);
  const countryName = order.country ? getLocalizedName(order.country, locale) : '';
  const entityTypeName = order.entity_type ? getLocalizedName(order.entity_type, locale) : '';
  const entityTypeDesc = order.entity_type
    ? getLocalizedDescription(order.entity_type, locale)
    : undefined;

  const getStatusLabel = (status: OrderStatus): string => {
    const key = STATUS_TRANSLATION_KEYS[status];
    return key ? t(key) : status;
  };

  const formData = (order.form_data as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('orderNumber', { number: order.order_number })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('createdAt')}: {new Date(order.created_at).toLocaleDateString(locale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <StatusBadge
          status={order.status}
          label={getStatusLabel(order.status)}
          className="text-sm px-3 py-1 self-start"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - left 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle>{tWizard('companyDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{tWizard('companyName')}</p>
                  <p className="font-medium">{order.company_name}</p>
                </div>
                {order.company_activity && (
                  <div>
                    <p className="text-sm text-muted-foreground">{tWizard('companyActivity')}</p>
                    <p className="font-medium">{order.company_activity}</p>
                  </div>
                )}
                {order.company_address && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">{tWizard('companyAddress')}</p>
                    <p className="font-medium">{order.company_address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Country & Entity Type */}
          <Card>
            <CardHeader>
              <CardTitle>{t('country')} &amp; {t('entityType')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">{t('country')}</p>
                  <div className="flex items-center gap-2 font-medium">
                    {order.country?.flag_url && (
                      <img
                        src={order.country.flag_url}
                        alt={countryName}
                        className="h-4 w-5 rounded-sm object-cover"
                      />
                    )}
                    <span>{countryName}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('entityType')}</p>
                  <p className="font-medium">{entityTypeName}</p>
                  {entityTypeDesc && (
                    <p className="mt-1 text-xs text-muted-foreground">{entityTypeDesc}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Founders */}
          {order.founders && order.founders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('founders')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.founders.map((founder, index) => (
                    <div key={founder.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-sm text-muted-foreground">{tWizard('founderName')}</p>
                          <p className="font-medium">{founder.full_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{tWizard('founderEmail')}</p>
                          <p className="font-medium">{founder.email}</p>
                        </div>
                        {founder.phone && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderPhone')}</p>
                            <p className="font-medium">{founder.phone}</p>
                          </div>
                        )}
                        {founder.nationality && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderNationality')}</p>
                            <p className="font-medium">{founder.nationality}</p>
                          </div>
                        )}
                        {founder.date_of_birth && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderDOB')}</p>
                            <p className="font-medium">{founder.date_of_birth}</p>
                          </div>
                        )}
                        {founder.document_type && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderDocType')}</p>
                            <p className="font-medium">{founder.document_type}</p>
                          </div>
                        )}
                        {founder.document_number && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderDocNumber')}</p>
                            <p className="font-medium">{founder.document_number}</p>
                          </div>
                        )}
                        {founder.tax_id && (
                          <div>
                            <p className="text-sm text-muted-foreground">{tWizard('founderTaxId')}</p>
                            <p className="font-medium">{founder.tax_id}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">{tWizard('founderOwnership')}</p>
                          <p className="font-medium">{founder.ownership_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{tWizard('founderIsDirector')}</p>
                          <p className="font-medium">{founder.is_director ? '✓' : '-'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Country-Specific Form Data */}
          {Object.keys(formData).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{tWizard('countryFields')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(formData).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-muted-foreground">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <p className="font-medium">
                        {typeof value === 'boolean'
                          ? value ? '✓' : '-'
                          : String(value ?? '-')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add-ons */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addons')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className={order.has_nominee_director ? 'text-green-600' : 'text-muted-foreground'}>
                    {order.has_nominee_director ? '✓' : '✗'}
                  </span>
                  <span className={!order.has_nominee_director ? 'text-muted-foreground' : ''}>
                    {tWizard('nomineeDirector')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={order.has_nominee_shareholder ? 'text-green-600' : 'text-muted-foreground'}>
                    {order.has_nominee_shareholder ? '✓' : '✗'}
                  </span>
                  <span className={!order.has_nominee_shareholder ? 'text-muted-foreground' : ''}>
                    {tWizard('nomineeShareholder')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={order.has_accounting ? 'text-green-600' : 'text-muted-foreground'}>
                    {order.has_accounting ? '✓' : '✗'}
                  </span>
                  <span className={!order.has_accounting ? 'text-muted-foreground' : ''}>
                    {tWizard('accounting')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={order.has_bookkeeping ? 'text-green-600' : 'text-muted-foreground'}>
                    {order.has_bookkeeping ? '✓' : '✗'}
                  </span>
                  <span className={!order.has_bookkeeping ? 'text-muted-foreground' : ''}>
                    {tWizard('bookkeeping')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - right column */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <CardHeader>
              <CardTitle>{t('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('client')}</p>
                <p className="font-medium">{order.client?.full_name ?? '-'}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('assignedPartner')}</p>
                <p className="font-medium">
                  {order.partner?.full_name ?? (
                    <span className="italic text-muted-foreground">{t('unassigned')}</span>
                  )}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">{t('updatedAt')}</p>
                <p className="font-medium">
                  {new Date(order.updated_at).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>{t('timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline
                orderId={order.id}
                initialStatus={order.status}
                statusHistory={statusHistory}
                locale={locale}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

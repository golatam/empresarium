import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getOrderById, getOrderStatusHistory } from '@/lib/queries/orders';
import { getDocuments } from '@/lib/queries/documents';
import { getConversationByOrderId, getMessages } from '@/lib/queries/messages';
import { redirect, notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderDetail } from '@/components/orders/order-detail';
import { OrderTimeline } from '@/components/orders/order-timeline';
import { StatusChangeDialog } from '@/components/orders/status-change-dialog';
import { StatusBadge } from '@/components/orders/status-badge';
import { MessageThread } from '@/components/messages/message-thread';
import { DocumentList } from '@/components/documents/document-list';
import { DocumentUpload } from '@/components/documents/document-upload';
import type { OrderStatus } from '@/types/database';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; orderId: string }>;
}) {
  const { locale, orderId } = await params;
  const t = await getTranslations('orders');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);

  const order = await getOrderById(orderId).catch(() => null);
  if (!order) notFound();

  const [statusHistory, documents, conversation] = await Promise.all([
    getOrderStatusHistory(orderId),
    getDocuments(orderId),
    getConversationByOrderId(orderId),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let messages: any[] = [];
  if (conversation && conversation.id) {
    messages = await getMessages(conversation.id);
  }

  const canChangeStatus =
    user.profile.role === 'admin' ||
    (user.profile.role === 'partner' && order.partner_id === user.id) ||
    (user.profile.role === 'client' && order.client_id === user.id && order.status === 'draft');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('orderNumber', { number: order.order_number })}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={order.status as OrderStatus} />
            <span className="text-sm text-muted-foreground">
              {order.company_name}
            </span>
          </div>
        </div>
        {canChangeStatus && (
          <StatusChangeDialog
            orderId={order.id}
            currentStatus={order.status as OrderStatus}
          />
        )}
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">{t('details')}</TabsTrigger>
          <TabsTrigger value="timeline">{t('timeline')}</TabsTrigger>
          {conversation && (
            <TabsTrigger value="messages">{t('messagesTab')}</TabsTrigger>
          )}
          <TabsTrigger value="documents">{t('documentsTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <OrderDetail
            order={order}
            locale={locale}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <OrderTimeline
            statusHistory={statusHistory}
            initialStatus={order.status as OrderStatus}
            orderId={order.id}
            locale={locale}
          />
        </TabsContent>

        {conversation && (
          <TabsContent value="messages">
            <MessageThread
              conversationId={conversation.id}
              initialMessages={messages}
              currentUserId={user.id}
            />
          </TabsContent>
        )}

        <TabsContent value="documents">
          <div className="space-y-4">
            <DocumentUpload orderId={order.id} isClient={order.client_id === user.id} />
            <DocumentList documents={documents} locale={locale} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

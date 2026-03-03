'use client';

import { useTranslations } from 'next-intl';
import type { OrderStatus } from '@/types/database';
import type { OrderStatusHistory } from '@/types/order';
import { useRealtimeOrderStatus } from '@/lib/hooks/use-realtime-order-status';
import { StatusBadge } from './status-badge';

interface StatusHistoryEntry extends OrderStatusHistory {
  changed_by_profile?: {
    full_name: string | null;
    role: string;
  } | null;
}

interface OrderTimelineProps {
  orderId: string;
  initialStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
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

export function OrderTimeline({
  orderId,
  initialStatus,
  statusHistory,
  locale,
}: OrderTimelineProps) {
  const t = useTranslations('orders');
  const currentStatus = useRealtimeOrderStatus(orderId, initialStatus);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const key = STATUS_TRANSLATION_KEYS[status];
    return key ? t(key) : status;
  };

  return (
    <div className="space-y-4">
      {/* Current status indicator */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
        <div className="flex h-3 w-3 items-center justify-center">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{t('status')}</p>
        </div>
        <StatusBadge status={currentStatus} label={getStatusLabel(currentStatus)} />
      </div>

      {/* Timeline */}
      <div className="relative ml-4 border-l border-border pl-6">
        {statusHistory.map((entry, index) => {
          const isLast = index === statusHistory.length - 1;

          return (
            <div key={entry.id} className="relative pb-6 last:pb-0">
              {/* Timeline dot */}
              <div
                className={`absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-background ${
                  isLast ? 'bg-primary' : 'bg-muted-foreground/40'
                }`}
              />

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {entry.old_status && (
                    <>
                      <StatusBadge
                        status={entry.old_status}
                        label={getStatusLabel(entry.old_status)}
                        className="text-xs"
                      />
                      <span className="text-muted-foreground">→</span>
                    </>
                  )}
                  <StatusBadge
                    status={entry.new_status}
                    label={getStatusLabel(entry.new_status)}
                    className="text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTimestamp(entry.created_at)}</span>
                  {entry.changed_by_profile?.full_name && (
                    <>
                      <span>&middot;</span>
                      <span>{entry.changed_by_profile.full_name}</span>
                    </>
                  )}
                </div>

                {entry.note && (
                  <p className="mt-1 text-sm text-muted-foreground italic">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {statusHistory.length === 0 && (
          <div className="pb-2">
            <p className="text-sm text-muted-foreground">
              {t('statusDraft')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

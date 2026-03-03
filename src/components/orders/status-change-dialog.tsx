'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import type { OrderStatus } from '@/types/database';
import { ORDER_STATUS_FLOW } from '@/types/order';
import { updateOrderStatus } from '@/lib/actions/orders';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from './status-badge';
import { ArrowRightLeft } from 'lucide-react';

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

export interface StatusChangeDialogProps {
  orderId: string;
  currentStatus: OrderStatus;
}

export function StatusChangeDialog({ orderId, currentStatus }: StatusChangeDialogProps) {
  const t = useTranslations('orders');
  const tCommon = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const availableStatuses = ORDER_STATUS_FLOW[currentStatus] ?? [];

  const getStatusLabel = (status: OrderStatus): string => {
    const key = STATUS_TRANSLATION_KEYS[status];
    return key ? t(key) : status;
  };

  const handleConfirm = () => {
    if (!newStatus) return;

    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.error) {
        setError(result.error);
      } else {
        setNewStatus('');
        setNote('');
        setOpen(false);
      }
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setNewStatus('');
      setNote('');
      setError(null);
    }
    setOpen(isOpen);
  };

  if (availableStatuses.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          {t('changeStatus')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('changeStatus')}</DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-2 mt-2">
              <span className="text-sm">{t('status')}:</span>
              <StatusBadge status={currentStatus} label={getStatusLabel(currentStatus)} />
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>{t('status')}</Label>
            <Select
              value={newStatus}
              onValueChange={(val) => setNewStatus(val as OrderStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('changeStatus')} />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-note">
              {t('notes')} ({tCommon('optional')})
            </Label>
            <Textarea
              id="status-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('notes')}
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
            {tCommon('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={!newStatus || isPending}>
            {isPending ? tCommon('loading') : tCommon('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/orders/status-badge';
import { Badge } from '@/components/ui/badge';
import { formatRelative } from '@/lib/utils/format';
import { getLocalizedName } from '@/types/country';
import type { OrderStatus } from '@/types/database';

interface AdminOrdersTableProps {
  orders: any[];
  locale: string;
}

export function AdminOrdersTable({ orders, locale }: AdminOrdersTableProps) {
  const t = useTranslations('orders');

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('orderNumber', { number: '' })}</TableHead>
            <TableHead>{t('companyName')}</TableHead>
            <TableHead>{t('country')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('client')}</TableHead>
            <TableHead>{t('assignedPartner')}</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>
                <Link
                  href={`/${locale}/orders/${order.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {order.order_number}
                </Link>
              </TableCell>
              <TableCell>{order.company_name}</TableCell>
              <TableCell>
                {order.country && getLocalizedName(order.country, locale)}
              </TableCell>
              <TableCell>
                <StatusBadge status={order.status as OrderStatus} />
              </TableCell>
              <TableCell>{order.client?.full_name || '—'}</TableCell>
              <TableCell>
                {order.partner?.full_name || (
                  <Badge variant="outline">{t('unassigned')}</Badge>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelative(order.created_at, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

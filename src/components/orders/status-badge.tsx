import type { OrderStatus } from '@/types/database';
import { ORDER_STATUS_COLORS } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const colorClasses = ORDER_STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800';
  const displayLabel = label ?? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <Badge
      variant="outline"
      className={cn('border-transparent', colorClasses, className)}
    >
      {displayLabel}
    </Badge>
  );
}

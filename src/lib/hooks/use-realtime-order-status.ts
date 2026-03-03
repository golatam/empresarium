'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { OrderStatus } from '@/types/database';

export function useRealtimeOrderStatus(orderId: string, initialStatus: OrderStatus) {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`order-status:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const updated = payload.new as { status: OrderStatus };
          setStatus(updated.status);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return status;
}

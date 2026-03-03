import { createClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOrders(filters?: {
  status?: OrderStatus;
  countryId?: string;
  clientId?: string;
  partnerId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): Promise<any[]> {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select(`
      *,
      country:countries(*),
      entity_type:entity_types(*),
      client:profiles!orders_client_id_fkey(*),
      partner:profiles!orders_partner_id_fkey(*)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.countryId) query = query.eq('country_id', filters.countryId);
  if (filters?.clientId) query = query.eq('client_id', filters.clientId);
  if (filters?.partnerId) query = query.eq('partner_id', filters.partnerId);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOrderById(id: string): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      country:countries(*),
      entity_type:entity_types(*),
      client:profiles!orders_client_id_fkey(*),
      partner:profiles!orders_partner_id_fkey(*),
      founders(*),
      conversation:conversations(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOrderStatusHistory(orderId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('order_status_history')
    .select(`
      *,
      changed_by_profile:profiles!order_status_history_changed_by_fkey(full_name, role)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getOrdersCount(filters?: {
  status?: OrderStatus;
  clientId?: string;
  partnerId?: string;
}): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from('orders')
    .select('id', { count: 'exact', head: true });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.clientId) query = query.eq('client_id', filters.clientId);
  if (filters?.partnerId) query = query.eq('partner_id', filters.partnerId);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

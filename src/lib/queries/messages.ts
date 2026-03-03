import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getConversations(userId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      order:orders!inner(
        id, order_number, company_name, client_id, partner_id,
        client:profiles!orders_client_id_fkey(id, full_name, avatar_url),
        partner:profiles!orders_partner_id_fkey(id, full_name, avatar_url)
      ),
      messages(id, content, message_type, sender_id, is_read, created_at)
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  // Filter client-side since complex OR on joined tables is not supported
  return (data ?? []).filter((c) => {
    const order = c.order;
    return order && (order.client_id === userId || order.partner_id === userId);
  });
}

export async function getConversationByOrderId(orderId: string): Promise<{ id: string; order_id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMessages(conversationId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, role)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false)
    .neq('sender_id', userId);

  if (error) throw error;
  return count ?? 0;
}

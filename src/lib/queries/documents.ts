import { createClient } from '@/lib/supabase/server';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDocuments(orderId: string): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      uploader:profiles!documents_uploaded_by_fkey(id, full_name, role)
    `)
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDocumentById(id: string): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

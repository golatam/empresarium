'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { STORAGE_BUCKETS } from '@/lib/utils/constants';

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const file = formData.get('file') as File;
  const orderId = formData.get('orderId') as string;
  const documentType = formData.get('documentType') as string;
  const isFromClient = formData.get('isFromClient') === 'true';

  if (!file || !orderId || !documentType) {
    return { error: 'Missing required fields' };
  }

  const bucket = isFromClient ? STORAGE_BUCKETS.ORDER_DOCUMENTS : STORAGE_BUCKETS.DELIVERABLES;
  const filePath = `${orderId}/${Date.now()}-${file.name}`;

  // Upload to storage
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) return { error: uploadError.message };

  // Create document record
  const { data: document, error: dbError } = await supabase
    .from('documents')
    .insert({
      order_id: orderId,
      uploaded_by: user.id,
      document_type: documentType,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      is_from_client: isFromClient,
    })
    .select()
    .single();

  if (dbError) return { error: dbError.message };

  revalidatePath(`/[locale]/orders/${orderId}`, 'page');
  return { success: true, document };
}

export async function getDocumentDownloadUrl(documentId: string) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (!doc) return { error: 'Document not found' };

  const bucket = doc.is_from_client ? STORAGE_BUCKETS.ORDER_DOCUMENTS : STORAGE_BUCKETS.DELIVERABLES;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(doc.file_path, 3600);

  if (error) return { error: error.message };

  return { url: data.signedUrl };
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient();

  const { data: doc } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (!doc) return { error: 'Document not found' };

  const bucket = doc.is_from_client ? STORAGE_BUCKETS.ORDER_DOCUMENTS : STORAGE_BUCKETS.DELIVERABLES;

  // Delete from storage
  await supabase.storage.from(bucket).remove([doc.file_path]);

  // Delete record
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) return { error: error.message };

  revalidatePath(`/[locale]/orders/${doc.order_id}`, 'page');
  return { success: true };
}

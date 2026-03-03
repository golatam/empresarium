'use server';

import { createClient } from '@/lib/supabase/server';
import type { MessageType } from '@/types/database';

export async function sendMessage(data: {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  fileUrl?: string;
  fileName?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: data.conversationId,
      sender_id: user.id,
      content: data.content,
      message_type: data.messageType || 'text',
      file_url: data.fileUrl || null,
      file_name: data.fileName || null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update conversation updated_at
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', data.conversationId);

  return { success: true, message };
}

export async function markMessagesAsRead(conversationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', user.id)
    .eq('is_read', false);

  if (error) return { error: error.message };

  return { success: true };
}

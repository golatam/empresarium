'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database';

type Message = Database['public']['Tables']['messages']['Row'] & {
  sender?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
};

export function useRealtimeMessages(conversationId: string, initialMessages: Message[]) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message;

          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role')
            .eq('id', newMessage.sender_id)
            .single();

          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, { ...newMessage, sender: sender ?? undefined }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return messages;
}

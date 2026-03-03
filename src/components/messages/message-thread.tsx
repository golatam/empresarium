'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/shared/empty-state';
import { useRealtimeMessages } from '@/lib/hooks/use-realtime-messages';
import { markMessagesAsRead } from '@/lib/actions/messages';
import { MessageBubble } from './message-bubble';
import { MessageInput } from './message-input';

interface MessageThreadProps {
  conversationId: string;
  initialMessages: any[];
  currentUserId: string;
}

export function MessageThread({
  conversationId,
  initialMessages,
  currentUserId,
}: MessageThreadProps) {
  const t = useTranslations('messages');
  const messages = useRealtimeMessages(conversationId, initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(initialMessages.length);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Mark messages as read on mount
  useEffect(() => {
    markMessagesAsRead(conversationId);
  }, [conversationId]);

  // Auto-scroll and mark-as-read when new messages arrive
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      scrollToBottom();
      markMessagesAsRead(conversationId);
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length, conversationId, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    // Use a short timeout to ensure the DOM has rendered
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = useCallback(() => {
    // Scroll to bottom after sending
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  }, [scrollToBottom]);

  return (
    <div className="flex h-full flex-col">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-4">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={t('noMessages')}
            description={t('noMessagesDescription')}
            className="h-full min-h-[300px]"
          />
        ) : (
          <div className="space-y-1 py-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                content={message.content}
                senderName={message.sender?.full_name ?? null}
                senderRole={message.sender?.role ?? 'client'}
                isOwn={message.sender_id === currentUserId}
                messageType={message.message_type}
                fileUrl={message.file_url}
                fileName={message.file_name}
                timestamp={message.created_at}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input area */}
      <MessageInput conversationId={conversationId} onSend={handleSend} />
    </div>
  );
}

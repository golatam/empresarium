'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelative } from '@/lib/utils/format';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { EmptyState } from '@/components/shared/empty-state';

interface ConversationListProps {
  conversations: any[];
  currentUserId: string;
  locale: string;
}

function getInitials(name: string | null): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function ConversationList({
  conversations,
  currentUserId,
  locale,
}: ConversationListProps) {
  const t = useTranslations('messages');
  const searchParams = useSearchParams();
  const activeOrderId = searchParams.get('orderId');

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title={t('noConversations')}
        description={t('noConversationsDescription')}
      />
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col">
        {conversations.map((conversation, index) => {
          const order = conversation.order;
          const messages = conversation.messages ?? [];

          // Determine the other party in the conversation
          const isClient = currentUserId === order?.client_id;
          const otherParty = isClient ? order?.partner : order?.client;
          const otherName = otherParty?.full_name ?? t('unknownUser');
          const otherAvatar = otherParty?.avatar_url ?? null;

          // Last message
          const sortedMessages = [...messages].sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          const lastMessage = sortedMessages[0];

          // Unread count (messages not from the current user that are unread)
          const unreadCount = messages.filter(
            (m: any) => !m.is_read && m.sender_id !== currentUserId
          ).length;

          // Build last message preview
          let lastMessagePreview = '';
          if (lastMessage) {
            if (lastMessage.message_type === 'system') {
              lastMessagePreview = lastMessage.content;
            } else if (lastMessage.message_type === 'file') {
              lastMessagePreview = lastMessage.sender_id === currentUserId
                ? `${t('you')}: ${t('sentFile')}`
                : t('sentFile');
            } else {
              lastMessagePreview = lastMessage.sender_id === currentUserId
                ? `${t('you')}: ${lastMessage.content}`
                : lastMessage.content;
            }
          }

          const isActive = activeOrderId === order?.id;

          return (
            <div key={conversation.id}>
              <Link
                href={`/${locale}/orders/${order?.id}?tab=messages`}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50',
                  isActive && 'bg-muted'
                )}
              >
                {/* Avatar */}
                <Avatar className="h-10 w-10 shrink-0">
                  {otherAvatar && <AvatarImage src={otherAvatar} alt={otherName} />}
                  <AvatarFallback className="text-xs">
                    {getInitials(otherName)}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Top row: order number + timestamp */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground">
                      {order?.order_number
                        ? `#${order.order_number}`
                        : t('conversation')}
                    </span>
                    {lastMessage && (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {formatRelative(lastMessage.created_at, locale)}
                      </span>
                    )}
                  </div>

                  {/* Other party name */}
                  <p className="truncate text-xs text-muted-foreground">
                    {otherName}
                    {order?.company_name && (
                      <span className="ml-1 text-muted-foreground/60">
                        -- {order.company_name}
                      </span>
                    )}
                  </p>

                  {/* Bottom row: last message + unread badge */}
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        'truncate text-xs',
                        unreadCount > 0
                          ? 'font-medium text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {lastMessagePreview || t('noMessagesYet')}
                    </p>
                    {unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="h-5 min-w-[20px] shrink-0 justify-center rounded-full px-1.5 text-[10px]"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>

              {index < conversations.length - 1 && <Separator />}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

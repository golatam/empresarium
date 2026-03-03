'use client';

import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils/format';
import { useTranslations } from 'next-intl';
import { FileDown } from 'lucide-react';

interface MessageBubbleProps {
  content: string;
  senderName: string | null;
  senderRole: string;
  isOwn: boolean;
  messageType: 'text' | 'file' | 'system';
  fileUrl?: string | null;
  fileName?: string | null;
  timestamp: string;
}

export function MessageBubble({
  content,
  senderName,
  senderRole,
  isOwn,
  messageType,
  fileUrl,
  fileName,
  timestamp,
}: MessageBubbleProps) {
  const t = useTranslations('messages');

  // System messages: centered, muted styling
  if (messageType === 'system') {
    return (
      <div className="flex justify-center py-2">
        <div className="max-w-md rounded-md bg-muted px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">{content}</p>
          <span className="mt-1 block text-[10px] text-muted-foreground/60">
            {formatDateTime(timestamp)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex w-full py-1', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div className={cn('max-w-[75%] space-y-1', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender name for non-own messages */}
        {!isOwn && senderName && (
          <p className="px-1 text-xs font-medium text-muted-foreground">
            {senderName}
            <span className="ml-1 text-[10px] text-muted-foreground/60">
              ({senderRole})
            </span>
          </p>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted text-foreground rounded-bl-md'
          )}
        >
          {/* File message */}
          {messageType === 'file' && fileUrl ? (
            <div className="space-y-1">
              {content && <p className="text-sm whitespace-pre-wrap">{content}</p>}
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={fileName || undefined}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:opacity-80',
                  isOwn
                    ? 'border-primary-foreground/20 text-primary-foreground'
                    : 'border-border text-foreground'
                )}
              >
                <FileDown className="h-4 w-4 shrink-0" />
                <span className="truncate max-w-[200px]">
                  {fileName || t('downloadFile')}
                </span>
              </a>
            </div>
          ) : (
            /* Text message */
            <p className="text-sm whitespace-pre-wrap">{content}</p>
          )}
        </div>

        {/* Timestamp */}
        <p
          className={cn(
            'px-1 text-[10px] text-muted-foreground/60',
            isOwn ? 'text-right' : 'text-left'
          )}
        >
          {formatDateTime(timestamp)}
        </p>
      </div>
    </div>
  );
}

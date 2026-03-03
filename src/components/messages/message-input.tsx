'use client';

import { useRef, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Send, Paperclip, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { sendMessage } from '@/lib/actions/messages';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  conversationId: string;
  onSend?: () => void;
}

export function MessageInput({ conversationId, onSend }: MessageInputProps) {
  const t = useTranslations('messages');
  const [content, setContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBusy = isPending || isUploading;
  const canSend = (content.trim().length > 0 || attachedFile) && !isBusy;

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const supabase = createClient();
      const timestamp = Date.now();
      const filePath = `${conversationId}/${timestamp}_${file.name}`;

      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(data.path);

      setAttachedFile({
        name: file.name,
        url: urlData.publicUrl,
      });
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setIsUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  function handleRemoveAttachment() {
    setAttachedFile(null);
  }

  function handleSubmit() {
    if (!canSend) return;

    const messageContent = content.trim();
    const file = attachedFile;

    // Clear input immediately for responsiveness
    setContent('');
    setAttachedFile(null);

    startTransition(async () => {
      if (file) {
        // Send as a file-type message
        await sendMessage({
          conversationId,
          content: messageContent || file.name,
          messageType: 'file',
          fileUrl: file.url,
          fileName: file.name,
        });
      } else {
        // Send as a text-type message
        await sendMessage({
          conversationId,
          content: messageContent,
          messageType: 'text',
        });
      }

      onSend?.();
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="border-t bg-background p-4">
      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm">
          <Paperclip className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-foreground">{attachedFile.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto h-5 w-5"
            onClick={handleRemoveAttachment}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
        />

        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Paperclip className="h-5 w-5" />
          )}
          <span className="sr-only">{t('attachFile')}</span>
        </Button>

        {/* Text input */}
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('typeMessage')}
          disabled={isBusy}
          className="flex-1"
          autoComplete="off"
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className={cn('shrink-0', !canSend && 'opacity-50')}
          disabled={!canSend}
          onClick={handleSubmit}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">{t('send')}</span>
        </Button>
      </div>
    </div>
  );
}

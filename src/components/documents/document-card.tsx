'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { FileText, FileImage, File, Download, Loader2 } from 'lucide-react';

import { getDocumentDownloadUrl } from '@/lib/actions/documents';
import { formatFileSize, formatRelative } from '@/lib/utils/format';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DocumentCardProps {
  document: {
    id: string;
    file_name: string;
    document_type: string;
    mime_type: string;
    file_size: number;
    created_at: string;
    is_from_client: boolean;
    uploader?: {
      id: string;
      full_name: string;
      role: string;
    } | null;
  };
  locale: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return FileImage;
  }
  if (mimeType === 'application/pdf') {
    return FileText;
  }
  return File;
}

export function DocumentCard({ document, locale }: DocumentCardProps) {
  const t = useTranslations('documents');
  const [isDownloading, setIsDownloading] = useState(false);

  const Icon = getFileIcon(document.mime_type);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await getDocumentDownloadUrl(document.id);
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch {
      // Error is silently handled; the button returns to its default state
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{document.file_name}</p>
            <Badge variant="secondary" className="shrink-0">
              {t(`types.${document.document_type}`)}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{formatFileSize(document.file_size)}</span>
            <span>{formatRelative(document.created_at, locale)}</span>
            {document.uploader?.full_name && (
              <span>{document.uploader.full_name}</span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="shrink-0"
          onClick={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

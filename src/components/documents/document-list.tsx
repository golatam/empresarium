'use client';

import { useTranslations } from 'next-intl';
import { FileText, Package } from 'lucide-react';

import { EmptyState } from '@/components/shared/empty-state';
import { DocumentCard } from './document-card';

interface Document {
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
}

interface DocumentListProps {
  documents: Document[];
  locale: string;
}

export function DocumentList({ documents, locale }: DocumentListProps) {
  const t = useTranslations('documents');

  const clientDocuments = documents.filter((doc) => doc.is_from_client);
  const deliverables = documents.filter((doc) => !doc.is_from_client);

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t('emptyTitle')}
        description={t('emptyDescription')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Client Documents Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('clientDocuments')}</h3>
          <span className="text-sm text-muted-foreground">
            ({clientDocuments.length})
          </span>
        </div>

        {clientDocuments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {t('noClientDocuments')}
          </p>
        ) : (
          <div className="grid gap-3">
            {clientDocuments.map((doc) => (
              <DocumentCard key={doc.id} document={doc} locale={locale} />
            ))}
          </div>
        )}
      </section>

      {/* Deliverables Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">{t('deliverables')}</h3>
          <span className="text-sm text-muted-foreground">
            ({deliverables.length})
          </span>
        </div>

        {deliverables.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">
            {t('noDeliverables')}
          </p>
        ) : (
          <div className="grid gap-3">
            {deliverables.map((doc) => (
              <DocumentCard key={doc.id} document={doc} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

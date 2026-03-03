'use client';

import { useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Upload, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

import { uploadDocument } from '@/lib/actions/documents';
import { MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from '@/lib/utils/constants';
import { formatFileSize } from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const DOCUMENT_TYPES = [
  'passport',
  'id_card',
  'proof_of_address',
  'tax_certificate',
  'incorporation',
  'articles',
  'power_of_attorney',
  'other',
] as const;

type DocumentType = (typeof DOCUMENT_TYPES)[number];

interface DocumentUploadProps {
  orderId: string;
  isClient: boolean;
}

export function DocumentUpload({ orderId, isClient }: DocumentUploadProps) {
  const t = useTranslations('documents');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType | ''>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateFile = useCallback(
    (selectedFile: File): string | null => {
      if (selectedFile.size > MAX_FILE_SIZE) {
        return t('errorFileSize', { maxSize: formatFileSize(MAX_FILE_SIZE) });
      }
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        return t('errorFileType');
      }
      return null;
    },
    [t]
  );

  const handleFileSelect = useCallback(
    (selectedFile: File) => {
      setError(null);
      setSuccess(false);

      const validationError = validateFile(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setFile(selectedFile);
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleUpload = async () => {
    if (!file || !documentType) {
      setError(t('errorMissingFields'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setSuccess(false);

    // Simulate progress since server actions don't support streaming progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('orderId', orderId);
      formData.append('documentType', documentType);
      formData.append('isFromClient', String(isClient));

      const result = await uploadDocument(formData);

      clearInterval(progressInterval);

      if (result.error) {
        setUploadProgress(0);
        setError(result.error);
      } else {
        setUploadProgress(100);
        setSuccess(true);
        setFile(null);
        setDocumentType('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(t('errorUploadFailed'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Document type select */}
      <div className="space-y-2">
        <Label>{t('documentType')}</Label>
        <Select
          value={documentType}
          onValueChange={(value) => setDocumentType(value as DocumentType)}
          disabled={isUploading}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('selectDocumentType')} />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drag and drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragOver
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${isUploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={handleInputChange}
          disabled={isUploading}
        />

        <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm font-medium">{t('dragDropLabel')}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('dragDropHint', { maxSize: formatFileSize(MAX_FILE_SIZE) })}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-3"
          disabled={isUploading}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          {t('browseFiles')}
        </Button>
      </div>

      {/* Selected file info */}
      {file && (
        <div className="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
          {!isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="ml-2 shrink-0"
              onClick={handleRemoveFile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-xs text-muted-foreground text-center">
            {t('uploading')} {uploadProgress}%
          </p>
        </div>
      )}

      {/* Success alert */}
      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{t('uploadSuccess')}</AlertTitle>
          <AlertDescription>{t('uploadSuccessDescription')}</AlertDescription>
        </Alert>
      )}

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('uploadError')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !documentType || isUploading}
        className="w-full"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('uploading')}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {t('uploadDocument')}
          </>
        )}
      </Button>
    </div>
  );
}

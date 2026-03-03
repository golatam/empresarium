export const APP_NAME = 'Empresarium';

export const LOCALES = ['en', 'es', 'pt', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  ru: 'Русский',
};

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const STORAGE_BUCKETS = {
  ORDER_DOCUMENTS: 'order-documents',
  DELIVERABLES: 'deliverables',
  MESSAGE_ATTACHMENTS: 'message-attachments',
  AVATARS: 'avatars',
} as const;

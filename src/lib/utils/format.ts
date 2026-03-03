import { format, formatDistanceToNow } from 'date-fns';
import { enUS, es, pt, ru } from 'date-fns/locale';

const localeMap: Record<string, Locale> = { en: enUS, es, pt, ru };
type Locale = typeof enUS;

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'PPP', { locale: localeMap[locale] || enUS });
}

export function formatDateTime(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'PPp', { locale: localeMap[locale] || enUS });
}

export function formatRelative(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: localeMap[locale] || enUS });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

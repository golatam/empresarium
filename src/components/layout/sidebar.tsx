'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  User,
  Shield,
  Plus,
} from 'lucide-react';
import type { UserRole } from '@/types/database';

interface SidebarProps {
  role: UserRole;
  className?: string;
}

export function Sidebar({ role, className }: SidebarProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();

  const baseItems = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/orders`, label: t('orders'), icon: FileText },
    { href: `/${locale}/messages`, label: t('messages'), icon: MessageSquare },
    { href: `/${locale}/profile`, label: t('profile'), icon: User },
  ];

  const adminItems = [
    { href: `/${locale}/admin/orders`, label: t('admin'), icon: Shield },
  ];

  const items = role === 'admin' ? [...baseItems, ...adminItems] : baseItems;

  return (
    <aside className={cn('flex flex-col w-64 bg-white border-r min-h-screen', className)}>
      <div className="p-6">
        <Link href={`/${locale}/dashboard`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">E</span>
          </div>
          <span className="font-bold text-xl">Empresarium</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {role === 'client' && (
        <div className="p-3">
          <Link
            href={`/${locale}/orders/new`}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('newOrder')}
          </Link>
        </div>
      )}

      <div className="p-3 border-t" />
    </aside>
  );
}

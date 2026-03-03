'use client';

import { useTranslations } from 'next-intl';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from './locale-switcher';
import { signOut } from '@/lib/actions/auth';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Sidebar } from './sidebar';
import type { UserRole } from '@/types/database';

interface TopbarProps {
  userName: string | null;
  role: UserRole;
}

export function Topbar({ userName, role }: TopbarProps) {
  const t = useTranslations('nav');

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar role={role} />
            </SheetContent>
          </Sheet>

          {userName && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {userName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <form action={signOut}>
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">{t('logout')}</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

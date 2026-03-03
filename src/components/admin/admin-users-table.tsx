'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { updateUserRole } from '@/lib/actions/admin';
import { formatRelative } from '@/lib/utils/format';
import type { UserRole } from '@/types/database';

interface AdminUsersTableProps {
  users: any[];
  locale: string;
}

const ROLE_COLORS: Record<UserRole, string> = {
  client: 'bg-blue-100 text-blue-800',
  partner: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
};

export function AdminUsersTable({ users, locale }: AdminUsersTableProps) {
  const t = useTranslations('admin');
  const [updating, setUpdating] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: UserRole) {
    setUpdating(userId);
    await updateUserRole(userId, role);
    setUpdating(null);
  }

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('userName')}</TableHead>
            <TableHead>{t('userEmail')}</TableHead>
            <TableHead>{t('userRole')}</TableHead>
            <TableHead>{t('userCreated')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.full_name || '—'}
              </TableCell>
              <TableCell>{user.id.slice(0, 8)}...</TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                  disabled={updating === user.id}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue>
                      <Badge className={ROLE_COLORS[user.role as UserRole]} variant="secondary">
                        {user.role}
                      </Badge>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelative(user.created_at, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

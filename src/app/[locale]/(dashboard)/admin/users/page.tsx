import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getAllUsers } from '@/lib/queries/admin';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { AdminUsersTable } from '@/components/admin/admin-users-table';

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);
  if (user.profile.role !== 'admin') return redirect(`/${locale}/dashboard`);

  const users = await getAllUsers();

  return (
    <div>
      <PageHeader title={t('usersManagement')} />
      <AdminUsersTable users={users} locale={locale} />
    </div>
  );
}

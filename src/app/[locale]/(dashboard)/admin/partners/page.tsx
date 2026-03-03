import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getPartners } from '@/lib/queries/admin';
import { getCountries } from '@/lib/queries/countries';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { AdminPartnersTable } from '@/components/admin/admin-partners-table';

export default async function AdminPartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);
  if (user.profile.role !== 'admin') return redirect(`/${locale}/dashboard`);

  const [partners, countries] = await Promise.all([
    getPartners(),
    getCountries(),
  ]);

  return (
    <div>
      <PageHeader title={t('partnersManagement')} />
      <AdminPartnersTable partners={partners} countries={countries} locale={locale} />
    </div>
  );
}

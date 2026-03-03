import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getCountriesWithEntityTypes } from '@/lib/queries/countries';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { CountryConfigList } from '@/components/admin/country-config-list';

export default async function AdminCountriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);
  if (user.profile.role !== 'admin') return redirect(`/${locale}/dashboard`);

  const countries = await getCountriesWithEntityTypes();

  return (
    <div>
      <PageHeader title={t('countriesConfig')} />
      <CountryConfigList countries={countries} locale={locale} />
    </div>
  );
}

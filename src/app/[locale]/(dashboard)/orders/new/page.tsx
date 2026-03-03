import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getCountries } from '@/lib/queries/countries';
import { redirect } from 'next/navigation';
import { OrderWizard } from '@/components/orders/order-wizard';

export default async function NewOrderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('wizard');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);

  const countries = await getCountries();

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-6">{t('title')}</h1>
      <OrderWizard countries={countries} locale={locale} />
    </div>
  );
}

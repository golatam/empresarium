import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile/profile-form';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('profile');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight mb-6">{t('title')}</h1>
      <ProfileForm profile={user.profile} email={user.email!} />
    </div>
  );
}

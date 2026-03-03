import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/queries/profile';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={user.profile.role} className="hidden md:flex" />
      <div className="flex-1 flex flex-col">
        <Topbar userName={user.profile.full_name} role={user.profile.role} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

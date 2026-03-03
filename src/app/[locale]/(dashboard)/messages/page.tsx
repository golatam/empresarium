import { getTranslations } from 'next-intl/server';
import { getCurrentUser } from '@/lib/queries/profile';
import { getConversations } from '@/lib/queries/messages';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { ConversationList } from '@/components/messages/conversation-list';

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('messages');
  const user = await getCurrentUser();
  if (!user) return redirect(`/${locale}/login`);

  const conversations = await getConversations(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight mb-6">{t('title')}</h1>

      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={t('noConversations')}
          description={t('noConversationsDesc')}
        />
      ) : (
        <ConversationList
          conversations={conversations}
          currentUserId={user.id}
          locale={locale}
        />
      )}
    </div>
  );
}

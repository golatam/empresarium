'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
  fullName: string;
  phone?: string;
  companyName?: string;
  bio?: string;
  preferredLocale: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      phone: data.phone || null,
      company_name: data.companyName || null,
      bio: data.bio || null,
      preferred_locale: data.preferredLocale,
    })
    .eq('id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/[locale]/profile', 'page');
  return { success: true };
}

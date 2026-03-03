'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/email';

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signUp(formData: {
  email: string;
  password: string;
  fullName: string;
  role: 'client' | 'partner';
  locale?: string;
}) {
  const admin = createAdminClient();
  const locale = formData.locale || 'en';

  // generateLink creates the user AND returns the confirmation link
  // without sending an email through Supabase (bypasses rate limits)
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        preferred_locale: locale,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Update role if partner (using admin client since user hasn't confirmed yet)
  if (formData.role === 'partner' && data.user) {
    await admin
      .from('profiles')
      .update({ role: 'partner' })
      .eq('id', data.user.id);
  }

  // Send confirmation email via Resend
  const actionLink = data.properties?.action_link;
  if (actionLink) {
    try {
      await sendConfirmationEmail(formData.email, actionLink, locale);
    } catch {
      console.error('[Auth] Failed to send confirmation email, but user was created');
    }
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function resetPassword(email: string, locale: string = 'en') {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback?type=recovery`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('rate limit')) {
      return { error: 'RATE_LIMIT' };
    }
    return { error: error.message };
  }

  const actionLink = data.properties?.action_link;
  if (actionLink) {
    try {
      await sendPasswordResetEmail(email, actionLink, locale);
    } catch {
      return { error: 'Failed to send email' };
    }
  }

  return { success: true };
}

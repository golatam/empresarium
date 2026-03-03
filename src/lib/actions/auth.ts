'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendConfirmationEmail, sendPasswordResetEmail } from '@/lib/email';

// Build verification link ourselves instead of using action_link from generateLink().
// action_link uses Supabase's Site URL setting as redirect base, which may be localhost.
function buildVerifyLink(hashedToken: string, type: string, redirectTo: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${hashedToken}&type=${type}&redirect_to=${encodeURIComponent(redirectTo)}`;
}

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  console.log('[signIn] result:', {
    hasSession: !!data?.session,
    hasUser: !!data?.user,
    userId: data?.user?.id,
    error: error?.message,
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
  const token = data.properties?.hashed_token;
  if (token) {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback`;
    const verifyLink = buildVerifyLink(token, 'signup', redirectTo);
    try {
      await sendConfirmationEmail(formData.email, verifyLink, locale);
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

export async function updatePasswordWithToken(accessToken: string, newPassword: string) {
  const admin = createAdminClient();

  // Verify the recovery access token and get the user
  const { data: { user }, error: verifyError } = await admin.auth.getUser(accessToken);
  if (verifyError || !user) {
    return { error: 'Invalid or expired recovery link' };
  }

  // Update password via admin API (bypasses client-side session issues)
  const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });
  if (updateError) {
    return { error: updateError.message };
  }

  // Sign in with new password to establish session cookies
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: newPassword,
  });
  if (signInError) {
    // Password was updated but auto-login failed — user can log in manually
    return { success: true, autoLogin: false };
  }

  return { success: true, autoLogin: true };
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

  const token = data.properties?.hashed_token;
  if (token) {
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/auth/callback?type=recovery`;
    const verifyLink = buildVerifyLink(token, 'recovery', redirectTo);
    try {
      await sendPasswordResetEmail(email, verifyLink, locale);
    } catch {
      return { error: 'Failed to send email' };
    }
  }

  return { success: true };
}

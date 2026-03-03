'use server';

import crypto from 'crypto';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOtpEmail } from '@/lib/email';

function hashCode(code: string, email: string): string {
  return crypto.createHash('sha256').update(code + email.toLowerCase()).digest('hex');
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(email: string, locale: string = 'en') {
  const admin = createAdminClient();
  const normalizedEmail = email.toLowerCase().trim();

  // Rate limit: check if an OTP was sent less than 60s ago
  const { data: recent } = await admin
    .from('otp_codes')
    .select('created_at')
    .eq('email', normalizedEmail)
    .eq('used', false)
    .gte('created_at', new Date(Date.now() - 60_000).toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (recent && recent.length > 0) {
    return { error: 'RATE_LIMIT' };
  }

  // Invalidate any existing OTPs for this email
  await admin
    .from('otp_codes')
    .update({ used: true })
    .eq('email', normalizedEmail)
    .eq('used', false);

  // Generate and store new OTP
  const code = generateCode();
  const codeHash = hashCode(code, normalizedEmail);
  const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString(); // 10 minutes

  const { error: insertError } = await admin
    .from('otp_codes')
    .insert({
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
    });

  if (insertError) {
    return { error: 'Failed to generate code' };
  }

  // Send OTP email via Resend
  try {
    await sendOtpEmail(normalizedEmail, code, locale);
  } catch {
    return { error: 'Failed to send email' };
  }

  return { success: true };
}

async function verifyOtpCode(email: string, code: string) {
  const admin = createAdminClient();
  const normalizedEmail = email.toLowerCase().trim();
  const now = new Date().toISOString();

  // Find the latest active OTP for this email
  const { data: otps, error: fetchError } = await admin
    .from('otp_codes')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('used', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError || !otps || otps.length === 0) {
    return { error: 'CODE_EXPIRED' };
  }

  const otp = otps[0];

  // Check max attempts
  if (otp.attempts >= otp.max_attempts) {
    await admin.from('otp_codes').update({ used: true }).eq('id', otp.id);
    return { error: 'TOO_MANY_ATTEMPTS' };
  }

  // Increment attempts
  await admin
    .from('otp_codes')
    .update({ attempts: otp.attempts + 1 })
    .eq('id', otp.id);

  // Verify hash
  const codeHash = hashCode(code, normalizedEmail);
  if (codeHash !== otp.code_hash) {
    const remaining = otp.max_attempts - (otp.attempts + 1);
    return { error: 'INVALID_CODE', remaining };
  }

  // Mark as used
  await admin.from('otp_codes').update({ used: true }).eq('id', otp.id);

  return { success: true };
}

async function createSessionForEmail(email: string) {
  const admin = createAdminClient();
  const supabase = await createClient();

  // Generate a magic link token via admin API (doesn't send email)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkError || !linkData) {
    console.error('[auth] generateLink failed:', linkError?.message);
    return { error: 'Failed to create session' };
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    console.error('[auth] generateLink returned no hashed_token:', JSON.stringify(linkData.properties));
    return { error: 'Failed to create session' };
  }

  // Verify the OTP token to create a real Supabase session (sets cookies via SSR client)
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });

  if (verifyError) {
    console.error('[auth] verifyOtp failed:', verifyError.message);
    return { error: 'Failed to create session' };
  }

  // Verify the session was actually established (catches silent cookie failures)
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    console.error('[auth] Session not established after verifyOtp:', userError?.message);
    return { error: 'Failed to create session' };
  }

  return { success: true };
}

export async function verifyOtpAndSignIn(email: string, code: string) {
  const verification = await verifyOtpCode(email, code);
  if (!verification.success) {
    return verification;
  }

  const session = await createSessionForEmail(email);
  if (!session.success) {
    return session;
  }

  return { success: true };
}

export async function verifyOtpAndSignUp(data: {
  email: string;
  code: string;
  fullName: string;
  role: 'client' | 'partner';
  locale: string;
}) {
  const verification = await verifyOtpCode(data.email, data.code);
  if (!verification.success) {
    return verification;
  }

  const admin = createAdminClient();
  const normalizedEmail = data.email.toLowerCase().trim();

  // Create user without password
  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email: normalizedEmail,
    email_confirm: true,
    user_metadata: {
      full_name: data.fullName,
      preferred_locale: data.locale,
    },
  });

  if (createError) {
    // Check if user already exists
    if (createError.message?.includes('already been registered')) {
      return { error: 'User already exists. Please sign in instead.' };
    }
    return { error: createError.message };
  }

  // Update role if partner (handle_new_user trigger creates profile as 'client' by default)
  if (data.role === 'partner' && userData.user) {
    await admin
      .from('profiles')
      .update({ role: 'partner' })
      .eq('id', userData.user.id);
  }

  // Create session
  const session = await createSessionForEmail(normalizedEmail);
  if (!session.success) {
    return session;
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function hashCode(code: string, email: string): string {
  return crypto.createHash('sha256').update(code + email.toLowerCase()).digest('hex');
}

/**
 * POST /api/auth/session
 *
 * Verifies custom OTP, creates Supabase session, and returns Set-Cookie headers.
 * Route Handlers can set cookies reliably (unlike Server Actions in Next.js 14).
 *
 * Body: { email, code, action: 'login' | 'register', fullName?, role?, locale? }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, code, action } = body;
  const normalizedEmail = email.toLowerCase().trim();

  // Admin client for DB operations and magic link generation
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // --- Verify custom OTP code ---
  const now = new Date().toISOString();
  const { data: otps, error: fetchError } = await admin
    .from('otp_codes')
    .select('*')
    .eq('email', normalizedEmail)
    .eq('used', false)
    .gt('expires_at', now)
    .order('created_at', { ascending: false })
    .limit(1);

  if (fetchError || !otps || otps.length === 0) {
    return NextResponse.json({ error: 'CODE_EXPIRED' }, { status: 400 });
  }

  const otp = otps[0];

  if (otp.attempts >= otp.max_attempts) {
    await admin.from('otp_codes').update({ used: true }).eq('id', otp.id);
    return NextResponse.json({ error: 'TOO_MANY_ATTEMPTS' }, { status: 400 });
  }

  await admin
    .from('otp_codes')
    .update({ attempts: otp.attempts + 1 })
    .eq('id', otp.id);

  const codeHash = hashCode(code, normalizedEmail);
  if (codeHash !== otp.code_hash) {
    return NextResponse.json({ error: 'INVALID_CODE' }, { status: 400 });
  }

  await admin.from('otp_codes').update({ used: true }).eq('id', otp.id);

  // --- Handle registration (create user first) ---
  if (action === 'register') {
    const { fullName, role, locale } = body;

    const { data: userData, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        preferred_locale: locale,
      },
    });

    if (createError) {
      if (createError.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'User already exists. Please sign in instead.' },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    if (role === 'partner' && userData.user) {
      await admin.from('profiles').update({ role: 'partner' }).eq('id', userData.user.id);
    }
  }

  // --- Generate magic link and create session ---
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalizedEmail,
  });

  if (linkError || !linkData) {
    console.error('[auth/session] generateLink failed:', linkError?.message);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    console.error('[auth/session] no hashed_token');
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  // Create SSR client that captures cookie mutations
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
        },
      },
    }
  );

  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });

  if (verifyError) {
    console.error('[auth/session] verifyOtp failed:', verifyError.message);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  // Build response with Set-Cookie headers
  const response = NextResponse.json({ success: true });
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options as Record<string, unknown>);
  }

  return response;
}

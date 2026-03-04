import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function hashCode(code: string, email: string): string {
  return crypto.createHash('sha256').update(code + email.toLowerCase()).digest('hex');
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/**
 * POST /api/auth/session
 *
 * Step 1: Verifies custom OTP code and generates a one-time token hash.
 * Does NOT create a session or set cookies (fetch responses can't reliably
 * set cookies in Next.js 14). Returns { tokenHash } for step 2.
 *
 * Body: { email, code, action: 'login' | 'register', fullName?, role?, locale? }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, code, action } = body;
  const normalizedEmail = email.toLowerCase().trim();

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

  // --- Generate magic link token (but don't create session yet) ---
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalizedEmail,
  });

  if (linkError || !linkData) {
    console.error('[auth/session] POST generateLink failed:', linkError?.message);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) {
    console.error('[auth/session] POST no hashed_token in generateLink response');
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }

  console.log('[auth/session] POST success — tokenHash generated for', normalizedEmail);
  return NextResponse.json({ tokenHash });
}

/**
 * GET /api/auth/session?token_hash=...&redirect=...
 *
 * Step 2: Exchanges the token hash for a Supabase session and sets cookies
 * via a redirect response. This is a full-page navigation (not fetch), so
 * Set-Cookie headers are reliably processed by the browser.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const redirectTo = searchParams.get('redirect') || '/en/dashboard';
  const baseUrl = getBaseUrl();

  if (!tokenHash) {
    console.error('[auth/session] GET missing token_hash');
    return NextResponse.redirect(`${baseUrl}/en/login`);
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

  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: 'magiclink',
  });

  if (verifyError || !data.session) {
    console.error('[auth/session] GET verifyOtp failed:', verifyError?.message, '| session:', !!data?.session);
    return NextResponse.redirect(`${baseUrl}/en/login`);
  }

  console.log('[auth/session] GET verifyOtp success — cookies to set:', cookiesToSet.length);

  // Build redirect response with Set-Cookie headers
  const response = NextResponse.redirect(`${baseUrl}${redirectTo}`);
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options as Record<string, unknown>);
  }

  return response;
}

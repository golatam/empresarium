import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const type = searchParams.get('type');

  // Extract locale from the URL path (e.g., /en/auth/callback)
  const pathname = new URL(request.url).pathname;
  const locale = pathname.split('/')[1] || 'en';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If this is a password recovery flow, redirect to a reset-password page
      if (type === 'recovery') {
        return NextResponse.redirect(
          `${origin}/${locale}/reset-password`
        );
      }

      // Default: redirect to dashboard after successful auth
      return NextResponse.redirect(`${origin}/${locale}/dashboard`);
    }
  }

  // If something went wrong, redirect to login
  return NextResponse.redirect(`${origin}/${locale}/login`);
}

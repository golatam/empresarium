import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Use the public app URL for redirects — request.url contains the internal
// container URL on Railway (e.g. http://localhost:8080), not the public domain.
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  // Extract locale from the URL path (e.g., /en/auth/callback)
  const pathname = new URL(request.url).pathname;
  const locale = pathname.split('/')[1] || 'en';
  const baseUrl = getBaseUrl();

  // Handle PKCE code exchange (for any in-transit confirmation links)
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${baseUrl}/${locale}/dashboard`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/${locale}/login`);
}

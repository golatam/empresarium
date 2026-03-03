import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

const publicPages = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/auth/callback'];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale from path
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  const pathWithoutLocale = pathnameHasLocale
    ? pathname.replace(/^\/[a-z]{2}/, '')
    : pathname;

  const isPublicPage = publicPages.some(
    (page) => pathWithoutLocale === page || pathWithoutLocale.startsWith('/auth/')
  );

  // Always run intl middleware to handle locale detection/redirect
  const intlResponse = intlMiddleware(request);

  if (isPublicPage) {
    return intlResponse;
  }

  // For protected pages, check auth
  const sbCookies = request.cookies.getAll().filter(c => c.name.includes('sb-'));
  console.log('[middleware]', pathname, 'sb-cookies:', sbCookies.length, sbCookies.map(c => c.name));

  const { user, supabaseResponse } = await updateSession(request);

  console.log('[middleware] user:', user ? user.id : 'null');

  if (!user) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Merge cookies from supabase session refresh into intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value, cookie);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|flags|logo.svg).*)'],
};

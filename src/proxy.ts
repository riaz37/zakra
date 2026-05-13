import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const AUTH_COOKIE = 'kb-auth';

// Paths that are always public (no auth required), relative to the locale prefix.
// e.g. /en/login, /ar/privacy
const PUBLIC_PREFIXES: string[] = ['/login', '/privacy', '/terms', '/cookies'];

const intlMiddleware = createIntlMiddleware(routing);

function stripLocale(pathname: string): string {
  // Remove leading /en or /ar prefix
  return pathname.replace(/^\/(en|ar)/, '') || '/';
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let next-intl handle locale detection and routing first
  const intlResponse = intlMiddleware(request);

  // Determine the path without locale prefix for auth checks
  const localelessPath = stripLocale(pathname);
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE);

  const isRootOrLanding = localelessPath === '/' || localelessPath === '';
  const isPublic =
    isRootOrLanding ||
    PUBLIC_PREFIXES.some((p) => localelessPath.startsWith(p));

  // Redirect unauthenticated users to /login (locale-prefixed)
  if (!hasAuthCookie && !isPublic) {
    // Detect locale from URL or use default
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Redirect authenticated users away from public auth pages to dashboard
  if (
    hasAuthCookie &&
    PUBLIC_PREFIXES.some((p) => localelessPath.startsWith(p))
  ) {
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/overview`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'kb-auth';

const ALWAYS_PUBLIC: string[] = ['/'];
const PUBLIC_PREFIXES: string[] = ['/login', '/privacy', '/terms', '/cookies'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE);

  const isAlwaysPublic = ALWAYS_PUBLIC.includes(pathname);
  const isPublic = isAlwaysPublic || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  if (!hasAuthCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect authenticated users away from login to the dashboard
  if (hasAuthCookie && PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

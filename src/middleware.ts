import { NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'kb-auth';
const PUBLIC_PATHS = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE);

  if (!hasAuthCookie && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasAuthCookie && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

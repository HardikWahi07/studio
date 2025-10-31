
import { NextRequest, NextResponse } from 'next/server';
 
const locales = ['en', 'es', 'fr', 'de', 'hi', 'ur', 'ar', 'bn', 'pa', 'pt', 'ru', 'zh', 'ta', 'te', 'mr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // You can implement more sophisticated locale detection here,
  // e.g., from headers, cookies, etc.
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  
  return NextResponse.redirect(request.nextUrl);
}
 
export const config = {
  matcher: [
    // Skip all internal paths (_next) and static assets
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};

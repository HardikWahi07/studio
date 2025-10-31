
import { NextRequest, NextResponse } from 'next/server';
 
const locales = ['en', 'es', 'fr', 'de', 'hi', 'ur', 'ar', 'bn', 'pa', 'pt', 'ru', 'zh', 'ta', 'te', 'mr'];
const defaultLocale = 'en';

function getLocale(request: NextRequest): string {
  // 1. Check for a locale in the cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  if (localeCookie && locales.includes(localeCookie.value)) {
    return localeCookie.value;
  }
  
  // 2. Check the Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage.split(',').map(l => l.split(';')[0].trim());
    for (const locale of preferredLocales) {
        if (locales.includes(locale)) {
            return locale;
        }
        // Also check for language codes without region (e.g., 'es' from 'es-ES')
        const langCode = locale.split('-')[0];
        if (locales.includes(langCode)) {
            return langCode;
        }
    }
  }

  // 3. Fallback to default
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

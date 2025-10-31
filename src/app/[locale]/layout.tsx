
import type { Metadata } from 'next';
import '../globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { SettingsProvider } from '@/context/settings-context';
import { ThemeProvider } from '@/components/theme-provider';
import { I18nProvider } from '@/context/i18n-provider';
 
export const metadata: Metadata = {
  title: 'TripMind',
  description: 'The smarter, greener, easier way to explore.',
};
 
export default function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
 
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SettingsProvider>
              <FirebaseClientProvider>
                <I18nProvider locale={locale}>
                  <AppLayout>
                    {children}
                  </AppLayout>
                </I18nProvider>
              </FirebaseClientProvider>
            </SettingsProvider>
          </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

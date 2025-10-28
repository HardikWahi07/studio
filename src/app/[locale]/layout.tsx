
import type { Metadata } from 'next';
import '../globals.css';
import { AppLayout } from '@/components/app-layout';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { SettingsProvider } from '@/context/settings-context';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import {getMessages} from 'next-intl/server';
 
export const metadata: Metadata = {
  title: 'TripMind',
  description: 'The smarter, greener, easier way to explore.',
};
 
export default async function RootLayout({
  children,
  params: {locale}
}: Readonly<{
  children: React.ReactNode;
  params: {locale: string};
}>) {
  const messages = await getMessages();
 
  return (
    <html lang={locale} suppressHydrationWarning className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          <SettingsProvider>
            <FirebaseClientProvider>
              <AppLayout>
                {children}
              </AppLayout>
            </FirebaseClientProvider>
          </SettingsProvider>
        </NextIntlClientProvider>
        <Toaster />
      </body>
    </html>
  );
}

import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { DirectionProvider } from '@/components/ui/direction';
import { QueryProvider } from "@/lib/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { LocaleHtmlAttrs } from "@/components/locale-html-attrs";
import "@/app/globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <>
      <LocaleHtmlAttrs locale={locale} dir={dir} />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        forcedTheme="dark"
        disableTransitionOnChange
      >
        <DirectionProvider direction={dir}>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              {children}
              <Toaster position="bottom-right" />
              <CookieConsentBanner />
            </QueryProvider>
          </NextIntlClientProvider>
        </DirectionProvider>
      </ThemeProvider>
    </>
  );
}

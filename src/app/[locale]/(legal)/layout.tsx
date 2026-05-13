import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LegalLayout({ children, params }: LegalLayoutProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background-translucent backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <Link href={`/${locale}`} className="flex items-center">
            <Image
              src="/logo/zakralogo.png"
              alt="Zakra"
              width={88}
              height={26}
              priority
              className="object-contain"
            />
          </Link>
          <Link
            href={`/${locale}/login`}
            className="flex items-center gap-1.5 font-sans text-sm text-muted transition-colors hover:text-foreground"
          >
            {isAr ? (
              <>
                العودة إلى الرئيسية
                <ArrowLeft size={14} strokeWidth={1.5} className="rotate-180" />
              </>
            ) : (
              <>
                <ArrowLeft size={14} strokeWidth={1.5} />
                Back to login
              </>
            )}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-6 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <p className="font-sans text-xs text-muted">
            © {new Date().getFullYear()} Empowering Energy (trading as ESAP AI).{' '}
            {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <nav className="flex gap-5">
            <Link
              href={`/${locale}/privacy`}
              className="font-sans text-xs text-muted transition-colors hover:text-foreground"
            >
              {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
            </Link>
            <Link
              href={`/${locale}/terms`}
              className="font-sans text-xs text-muted transition-colors hover:text-foreground"
            >
              {isAr ? 'شروط الخدمة' : 'Terms of Service'}
            </Link>
            <Link
              href={`/${locale}/cookies`}
              className="font-sans text-xs text-muted transition-colors hover:text-foreground"
            >
              {isAr ? 'سياسة ملفات تعريف الارتباط' : 'Cookie Policy'}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

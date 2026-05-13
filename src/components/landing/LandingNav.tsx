"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";

export function LandingNav() {
  const t = useTranslations("landing.nav");
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = useAuthStore((s) => !!s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_LINKS = [
    { label: t("features"), href: "#features" },
    { label: t("demo"), href: "#demo" },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-[120ms]",
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="flex items-center transition-opacity duration-[120ms] hover:opacity-80"
          >
            <Image
              src="/logo/zakralogo.png"
              alt="Zakra"
              width={90}
              height={28}
              priority
              className="object-contain"
            />
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] font-medium text-muted transition-colors duration-[120ms] hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <LanguageSwitcher variant="icon" />
          {isAuthenticated ? (
            <Link
              href="/overview"
              className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-[13px]")}
            >
              {t("dashboard")}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-[13px] text-muted hover:text-foreground")}
              >
                {t("signIn")}
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "default", size: "sm" }), "text-[13px]")}
              >
                {t("getStarted")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

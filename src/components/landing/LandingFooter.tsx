"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ArrowRight, ExternalLink, Globe, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const SOCIAL = [
  { icon: ExternalLink, labelKey: "github", href: "#" },
  { icon: Globe, labelKey: "website", href: "#" },
  { icon: Mail, labelKey: "contact", href: "#" },
];

const LEGAL_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "security", href: "/privacy#security" },
  { key: "cookies", href: "/cookies" },
] as const;

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row gap-12 md:gap-20">
          {/* Brand */}
          <div className="w-44 shrink-0">
            <Link
              href="/"
              className="flex items-center mb-4 transition-opacity duration-[120ms] hover:opacity-80"
            >
              <Image
                src="/logo/zakralogo.png"
                alt="Zakra"
                width={80}
                height={24}
                priority
                className="object-contain"
              />
            </Link>
            <p className="text-[12px] leading-relaxed text-fg-subtle">
              {t("tagline")}
            </p>
          </div>

          {/* Legal */}
          <div className="shrink-0">
            <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
              {t("legal.heading")}
            </p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(({ key, href }) => (
                <li key={key}>
                  <Link
                    href={href}
                    className="text-[13px] text-muted hover:text-foreground transition-colors duration-[120ms]"
                  >
                    {t(`legal.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="flex-1 md:max-w-sm ml-auto">
            <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.08em] text-fg-subtle">
              {t("newsletter.heading")}
            </p>
            <p className="text-[13px] text-muted leading-relaxed mb-4">
              {t("newsletter.description")}
            </p>

            {submitted ? (
              <p className="text-[13px] text-accent">
                {t("newsletter.success")}
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("newsletter.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={cn(
                    "flex-1 h-9 rounded-md px-3 text-[13px] text-foreground",
                    "bg-surface-200 border border-border-medium",
                    "placeholder:text-fg-subtle",
                    "focus:outline-none focus:border-accent",
                    "transition-colors duration-[120ms]"
                  )}
                />
                <button
                  type="submit"
                  className={cn(
                    "h-9 px-3 rounded-md inline-flex items-center gap-1.5",
                    "text-[13px] font-medium bg-accent text-accent-fg",
                    "transition-opacity duration-[120ms] hover:opacity-90 shrink-0"
                  )}
                >
                  {t("newsletter.subscribe")}
                  <ArrowRight size={13} strokeWidth={2} className="rtl:rotate-180" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[12px] text-fg-subtle">
            {t("copyright")}
          </p>

          <div className="flex items-center gap-0.5">
            {SOCIAL.map(({ icon: Icon, labelKey, href }) => (
              <Link
                key={labelKey}
                href={href}
                aria-label={labelKey}
                className="size-8 inline-flex items-center justify-center rounded-md transition-colors duration-[120ms] text-fg-subtle hover:text-foreground hover:bg-surface-300"
              >
                <Icon size={14} strokeWidth={1.5} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

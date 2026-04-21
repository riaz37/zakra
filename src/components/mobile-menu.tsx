"use client";

import { useState } from "react";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#docs", label: "Docs" },
  { href: "#changelog", label: "Changelog" },
  { href: "/login", label: "Sign in" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
  };
  const openMenu = () => {
    setOpen(true);
    document.body.style.overflow = "hidden";
  };

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className="btn btn-secondary btn-sm md:hidden"
        aria-label="Open menu"
      >
        Menu
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-[var(--surface)] px-8 py-6"
          aria-hidden={!open}
        >
          <div className="mb-10 flex h-10 items-center justify-between">
            <a href="#" className="inline-flex items-center gap-[10px] font-display text-[18px] font-semibold tracking-[-0.01em] text-[var(--fg)]">
              <span className="inline-flex h-[26px] w-[26px] items-center justify-center rounded-[7px] bg-[var(--primary)] font-display text-[15px] font-bold text-[var(--primary-fg)]">
                Z
              </span>
              <span>Zakra</span>
            </a>
            <button
              type="button"
              onClick={close}
              className="btn btn-secondary btn-sm"
              aria-label="Close menu"
            >
              Close
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                className="border-b border-[var(--border)] py-3 font-display text-[28px] font-semibold tracking-[-0.01em] text-[var(--fg)]"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-[10px] pb-6">
            <a href="/dashboard" onClick={close} className="btn btn-primary btn-lg">
              Open admin
            </a>
          </div>
        </div>
      )}
    </>
  );
}

import { AnimateIn } from "@/components/landing/AnimateIn";

const LOGOS = [
  "Acme Corp",
  "Veritas Systems",
  "Meridian Health",
  "Quantum Labs",
  "Atlas Finance",
  "Nexus Group",
];

export function LogoBar() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <p className="text-center mb-7 text-fg-subtle text-[11px] uppercase tracking-[0.08em]">
            Trusted by teams at
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {LOGOS.map((name) => (
              <span
                key={name}
                className="text-[13px] font-semibold tracking-[-0.01em] text-fg-subtle opacity-60 select-none"
              >
                {name}
              </span>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

import { AnimateIn } from "@/components/landing/AnimateIn";
import Image from "next/image";

const PARTNER_LOGOS = [
  { name: "Partner 1", src: "/partners/EMp.svg" },
  { name: "Partner 2", src: "/partners/EMp-1.svg" },
  { name: "Partner 3", src: "/partners/EMp-2-1.svg" },
  { name: "Partner 4", src: "/partners/EMp-3.svg" },
  { name: "Partner 5", src: "/partners/EMp-4.svg" },
  { name: "Partner 6", src: "/partners/EMp-5.svg" },
];

export function LogoBar() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <AnimateIn>
          <p className="text-center mb-8 text-fg-subtle text-[11px] uppercase tracking-[0.08em]">
            Trusted by industry leaders
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {PARTNER_LOGOS.map((partner) => (
              <div
                key={partner.src}
                className="opacity-40 hover:opacity-100 transition-opacity duration-300 grayscale brightness-0 invert"
              >
                <Image
                  src={partner.src}
                  alt={partner.name}
                  width={120}
                  height={40}
                  className="h-7 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}

interface ZakraMarkProps {
  size?: number;
}

export function ZakraMark({ size = 28 }: ZakraMarkProps) {
  return (
    <div
      className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        width={size * 0.57}
        height={size * 0.57}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 7l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 17l8 4 8-4" />
      </svg>
    </div>
  );
}

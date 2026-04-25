interface AvatarInitialProps {
  name: string;
  email: string;
}

export function AvatarInitial({ name, email }: AvatarInitialProps) {
  const initial = (name.trim().charAt(0) || email.charAt(0)).toUpperCase();
  return (
    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-surface-300 font-sans text-caption font-medium text-foreground">
      {initial}
    </span>
  );
}

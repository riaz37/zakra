"use client";

import { Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  /** Controlled value from the parent. Acts as the canonical search term. */
  value: string;
  /** Called with the debounced value once the user stops typing. */
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce in ms before `onChange` fires. Default 300. */
  debounceMs?: number;
  /** Accessible label — required when no surrounding <label> is present. */
  ariaLabel?: string;
  className?: string;
}

/**
 * Debounced search input with a clear affordance.
 *
 * The internal state is the source of truth while the user is typing; the
 * parent only sees the debounced value, so callers can safely wire it into
 * a query hook without thrashing the network.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounceMs = 300,
  ariaLabel = "Search",
  className,
}: SearchInputProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Parent → child sync: when the canonical `value` prop changes externally
  // (route change, reset), mirror it into internal state during render rather
  // than in an effect. This avoids the cascading-render anti-pattern.
  const [internalValue, setInternalValue] = useState(value);
  const [lastExternalValue, setLastExternalValue] = useState(value);
  if (value !== lastExternalValue) {
    setLastExternalValue(value);
    setInternalValue(value);
  }

  const debouncedValue = useDebounce(internalValue, debounceMs);

  // Child → parent: once the debounce settles, emit the new value. We read
  // the latest `value` and `onChange` through a ref so this effect only
  // re-runs when the debounced value actually changes.
  const latestRef = useRef({ value, onChange });
  useEffect(() => {
    latestRef.current = { value, onChange };
  });

  useEffect(() => {
    const { value: currentExternal, onChange: emit } = latestRef.current;
    if (debouncedValue !== currentExternal) {
      emit(debouncedValue);
    }
  }, [debouncedValue]);

  function handleClear() {
    setInternalValue("");
    onChange("");
    inputRef.current?.focus();
  }

  const hasValue = internalValue.length > 0;

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={inputId} className="sr-only">
        {ariaLabel}
      </label>

      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
      />

      <input
        ref={inputRef}
        id={inputId}
        type="search"
        role="searchbox"
        value={internalValue}
        onChange={(event) => setInternalValue(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "w-full rounded-lg border border-border bg-transparent py-2 pl-9 pr-9",
          "font-sans text-button text-foreground outline-none",
          "placeholder:text-subtle",
          "transition-colors focus:border-border-medium",
          // Strip the UA reveal/cancel button on WebKit so our own button is the only one.
          "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none",
        )}
      />

      {hasValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 inline-flex size-6 items-center justify-center",
            "rounded-md text-muted transition-colors",
            "hover:text-foreground focus-visible:text-foreground focus-visible:outline-none",
            "focus-visible:border focus-visible:border-border-medium",
          )}
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </div>
  );
}

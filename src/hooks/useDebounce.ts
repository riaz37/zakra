import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value`, updated only after `delay` ms have
 * elapsed without changes. Useful for throttling search-as-you-type queries.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

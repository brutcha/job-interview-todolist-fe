import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebouncedCallbackOptions {
  minLoadingTime?: number;
}

/**
 * Core primitive for non-blocking async callbacks with minimum loading time.
 *
 * Executes callback immediately (non-blocking) but maintains loading state
 * for minimum duration to prevent UI flicker on fast responses.
 *
 * Perfect for preventing flickering while allowing rapid successive calls.
 *
 * @example
 * const [handleSubmit, isSubmitting] = useDebouncedCallback(
 *   async (data) => await api.submit(data),
 *   { minLoadingTime: 250 }
 * );
 */
export const useDebouncedCallback = <TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
  options: UseDebouncedCallbackOptions = {},
) => {
  const { minLoadingTime = 250 } = options;

  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      loadingStartTimeRef.current = Date.now();
      setIsLoading(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      try {
        const result = await callback(...args);

        const elapsed = Date.now() - (loadingStartTimeRef.current || 0);
        const remaining = Math.max(0, minLoadingTime - elapsed);

        if (remaining > 0) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              setIsLoading(false);
              resolve();
            }, remaining);
          });
        } else {
          setIsLoading(false);
        }

        return result;
      } catch (error) {
        const elapsed = Date.now() - (loadingStartTimeRef.current || 0);
        const remaining = Math.max(0, minLoadingTime - elapsed);

        if (remaining > 0) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              setIsLoading(false);
              resolve();
            }, remaining);
          });
        } else {
          setIsLoading(false);
        }

        throw error;
      }
    },
    [callback, minLoadingTime],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [debouncedCallback, isLoading] as const;
};

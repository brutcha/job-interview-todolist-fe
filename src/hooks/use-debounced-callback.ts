import { useCallback, useEffect, useRef, useState } from "react";

import { Either } from "effect";

import {
  CallFailed,
  ConcurrentCallBlocked,
  type DebouncedCallError,
} from "@/schemas/model";

interface UseDebouncedCallbackOptions {
  minLoadingTime?: number;
  blocking?: boolean;
}

/**
 * Core primitive for non-blocking async callbacks with minimum loading time.
 *
 * Executes callback immediately (non-blocking) but maintains loading state
 * for minimum duration to prevent UI flicker on fast responses.
 *
 * Returns Either<TResult, DebouncedCallError> for type-safe error handling.
 * When blocking is enabled, concurrent calls return Left(ConcurrentCallBlocked).
 *
 * @example
 * const [handleSubmit, isSubmitting] = useDebouncedCallback(
 *   async (data) => await api.submit(data),
 *   { minLoadingTime: 250, blocking: true }
 * );
 *
 * const result = await handleSubmit(data);
 * Either.match(result, {
 *   onLeft: (error) => console.error(error),
 *   onRight: (data) => console.log(data)
 * });
 */
export const useDebouncedCallback = <TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => Promise<TResult>,
  options: UseDebouncedCallbackOptions = {},
) => {
  const { minLoadingTime = 250, blocking = false } = options;

  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExecutingRef = useRef(false);

  const debouncedCallback = useCallback(
    async (
      ...args: TArgs
    ): Promise<Either.Either<TResult, DebouncedCallError>> => {
      if (blocking && isExecutingRef.current) {
        return Either.left(new ConcurrentCallBlocked());
      }

      isExecutingRef.current = true;
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
              isExecutingRef.current = false;
              resolve();
            }, remaining);
          });
        } else {
          setIsLoading(false);
          isExecutingRef.current = false;
        }

        return Either.right(result);
      } catch (error) {
        const elapsed = Date.now() - (loadingStartTimeRef.current || 0);
        const remaining = Math.max(0, minLoadingTime - elapsed);

        if (remaining > 0) {
          await new Promise<void>((resolve) => {
            timeoutRef.current = setTimeout(() => {
              setIsLoading(false);
              isExecutingRef.current = false;
              resolve();
            }, remaining);
          });
        } else {
          setIsLoading(false);
          isExecutingRef.current = false;
        }

        return Either.left(
          new CallFailed({
            error: error instanceof Error ? error : new Error(String(error)),
          }),
        );
      }
    },
    [callback, minLoadingTime, blocking],
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

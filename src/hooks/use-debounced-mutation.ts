import { useDebouncedCallback } from "./use-debounced-callback";

type MutationResult = {
  isLoading: boolean;
  data?: unknown;
  error?: unknown;
  isSuccess: boolean;
  isError: boolean;
};

type UseMutationHook<
  TArg,
  TResult extends MutationResult = MutationResult,
> = () => readonly [(arg: TArg) => Promise<unknown>, TResult];

interface UseDebouncedMutationOptions {
  minLoadingTime?: number;
}

/**
 * RTK Query mutation wrapper that prevents UI flicker on fast responses.
 *
 * Thin wrapper around useDebouncedCallback specifically for RTK Query mutations.
 * Executes mutations immediately but maintains loading state for minimum time.
 *
 * @example
 * const [deleteTask, { isLoading }] = useDebouncedMutation(
 *   todoApi.useDeleteTaskMutation,
 *   { minLoadingTime: 250 }
 * );
 */
export const useDebouncedMutation = <
  TArg,
  TResult extends MutationResult & Record<string, unknown>,
>(
  useMutation: UseMutationHook<TArg, TResult>,
  options: UseDebouncedMutationOptions = {},
) => {
  const [originalTrigger, result] = useMutation();

  // Wrap the mutation trigger with debounced callback
  const [debouncedTrigger, isDebouncing] = useDebouncedCallback(
    async (arg: TArg) => {
      return await originalTrigger(arg);
    },
    options,
  );

  // Combine RTK Query's loading state with debounced loading state
  const isLoading = result.isLoading || isDebouncing;

  return [debouncedTrigger, { ...result, isLoading }] as const;
};

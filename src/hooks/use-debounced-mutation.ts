import type {
  BaseQueryFn,
  MutationDefinition,
  MutationResultSelectorResult,
} from "@reduxjs/toolkit/query";

import { useDebouncedCallback } from "./use-debounced-callback";

type UseMutationHook<
  TArgs,
  TResult,
  TError,
  TMutation extends MutationDefinition<
    unknown,
    BaseQueryFn<TArgs, TResult, TError>,
    string,
    unknown
  >,
> = () => readonly [
  (arg: TArgs) => { unwrap: () => Promise<TResult> },
  MutationResultSelectorResult<TMutation>,
];

interface UseDebouncedMutationOptions {
  minLoadingTime?: number;
  blocking?: boolean;
}
/**
 * RTK Query mutation wrapper that prevents UI flicker on fast responses.
 *
 * Thin wrapper around useDebouncedCallback specifically for RTK Query mutations.
 * Executes mutations immediately but maintains loading state for minimum time.
 * Returns Either<TResult, DebouncedCallError> for type-safe error handling.
 *
 * @example
 * const [deleteTask, { isLoading }] = useDebouncedMutation(
 *   todoApi.useDeleteTaskMutation,
 *   { minLoadingTime: 250, blocking: true }
 * );
 *
 * const result = await deleteTask(id);
 * Either.match(result, {
 *   onLeft: (error) => handleError(error),
 *   onRight: (data) => handleSuccess(data)
 * });
 */

export const useDebouncedMutation = <
  TArgs,
  TResult,
  TError,
  TMutation extends MutationDefinition<
    unknown,
    BaseQueryFn<TArgs, TResult, TError>,
    string,
    unknown
  >,
>(
  useMutation: UseMutationHook<TArgs, TResult, TError, TMutation>,
  options: UseDebouncedMutationOptions = {},
) => {
  const [originalTrigger, result] = useMutation();

  const [debouncedTrigger, isDebouncing] = useDebouncedCallback(
    async (arg: TArgs) => {
      return await originalTrigger(arg).unwrap();
    },
    options,
  );

  const isLoading = result.isLoading || isDebouncing;

  return [debouncedTrigger, { ...result, isLoading }] as const;
};

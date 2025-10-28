import { Data } from "effect";

export class ConcurrentCallBlocked extends Data.TaggedError(
  "ConcurrentCallBlocked",
) {}

export class CallFailed extends Data.TaggedError("CallFailed")<{
  readonly error: Error;
}> {}

export type DebouncedCallError = ConcurrentCallBlocked | CallFailed;

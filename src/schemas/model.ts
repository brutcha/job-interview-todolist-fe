import { Data, Schema } from "effect";

import { userStateSlice } from "@/store/user-state-slice";

export class ConcurrentCallBlocked extends Data.TaggedError(
  "ConcurrentCallBlocked",
) {}

export class CallFailed extends Data.TaggedError("CallFailed")<{
  readonly error: Error;
}> {}

export type DebouncedCallError = ConcurrentCallBlocked | CallFailed;

export const FilterSchema = Schema.Literal("all", "active", "completed");
export type Filter = typeof FilterSchema.Type;

export const SetFilterActionSchema = Schema.Struct({
  type: Schema.Literal(userStateSlice.actions.setFilter.type),
  payload: FilterSchema,
});

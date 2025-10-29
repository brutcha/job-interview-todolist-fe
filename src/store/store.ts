import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { todoApi } from "@/api/todo-api";
import { URLSyncMiddleware } from "@/middleware/url-sync-middleware";
import type { RequestType } from "@/schemas/model";

import { userStateSlice } from "./user-state-slice";

export const store = configureStore({
  reducer: {
    [todoApi.reducerPath]: todoApi.reducer,
    userState: userStateSlice.reducer,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(todoApi.middleware, URLSyncMiddleware);
  },
});

setupListeners(store.dispatch);

export type State = ReturnType<typeof store.getState>;
export type Dispatch = ReturnType<typeof store.dispatch>;

export const selectRunningOperations = (state: State) =>
  Object.entries(state.todoApi.mutations).reduce(
    (runningMutations: Record<RequestType, number>, [key, mutationState]) => {
      if (!mutationState || mutationState.status !== "pending") {
        return runningMutations;
      }

      switch (key) {
        case "createTask":
          return {
            ...runningMutations,
            CREATE: runningMutations.CREATE + 1,
          };
        case "updateTask":
        case "completeTask":
        case "incompleteTask":
          return {
            ...runningMutations,
            UPDATE: runningMutations.UPDATE + 1,
          };
        case "deleteTask":
          return {
            ...runningMutations,
            DELETE: runningMutations.DELETE + 1,
          };
        default:
          return runningMutations;
      }
    },
    {
      CREATE: 0,
      UPDATE: 0,
      DELETE: 0,
      READ: Object.values(state.todoApi.queries).reduce(
        (count, queryState) =>
          queryState?.status === "pending" ? count + 1 : count,
        0,
      ),
    },
  );

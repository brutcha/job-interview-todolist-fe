import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import { todoApi } from "@/api/todo-api";

import { userStateSlice } from "./user-state-slice";

export const store = configureStore({
  reducer: {
    [todoApi.reducerPath]: todoApi.reducer,
    userState: userStateSlice.reducer,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(todoApi.middleware);
  },
});

setupListeners(store.dispatch);

export type State = ReturnType<typeof store.getState>;
export type Dispatch = ReturnType<typeof store.dispatch>;

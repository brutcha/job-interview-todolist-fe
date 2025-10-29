import { configureStore } from "@reduxjs/toolkit";
import { describe, expect, it, vi } from "vitest";

import type { URLHelpers } from "@/lib/url-sync";
import { userStateSlice } from "@/store/user-state-slice";

import { createURLSyncMiddleware } from "./url-sync-middleware";

describe("URLSyncMiddleware", () => {
  it("should update URL when setFilter action is dispatched", () => {
    const mockUrl = new URL("http://localhost:3000");
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn().mockReturnValue(mockUrl),
      replaceState: vi.fn(),
      getSearchParam: vi.fn(),
    };

    const store = configureStore({
      reducer: {
        userState: userStateSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(createURLSyncMiddleware(mockUrlHelpers)),
    });

    store.dispatch(userStateSlice.actions.setFilter("active"));

    expect(mockUrlHelpers.setSearchParam).toHaveBeenCalledWith(
      "filter",
      "active",
    );
    expect(mockUrlHelpers.replaceState).toHaveBeenCalledWith(mockUrl);
  });

  it("should update URL when filter is changed to completed", () => {
    const mockUrl = new URL("http://localhost:3000");
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn().mockReturnValue(mockUrl),
      replaceState: vi.fn(),
      getSearchParam: vi.fn(),
    };

    const store = configureStore({
      reducer: {
        userState: userStateSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(createURLSyncMiddleware(mockUrlHelpers)),
    });

    store.dispatch(userStateSlice.actions.setFilter("completed"));

    expect(mockUrlHelpers.setSearchParam).toHaveBeenCalledWith(
      "filter",
      "completed",
    );
    expect(mockUrlHelpers.replaceState).toHaveBeenCalledWith(mockUrl);
  });

  it("should not call URL helpers for non-setFilter actions", () => {
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn(),
    };

    const store = configureStore({
      reducer: {
        userState: userStateSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(createURLSyncMiddleware(mockUrlHelpers)),
    });

    store.dispatch(userStateSlice.actions.editNewTask("test"));

    expect(mockUrlHelpers.setSearchParam).not.toHaveBeenCalled();
    expect(mockUrlHelpers.replaceState).not.toHaveBeenCalled();
  });

  it("should allow other actions to pass through", () => {
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn(),
    };

    const store = configureStore({
      reducer: {
        userState: userStateSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(createURLSyncMiddleware(mockUrlHelpers)),
    });

    store.dispatch(userStateSlice.actions.editNewTask("test task"));

    expect(store.getState().userState.newTaskText).toBe("test task");
  });
});

import { Provider } from "react-redux";

import { configureStore } from "@reduxjs/toolkit";
import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { URLHelpers } from "@/lib/url-sync";
import { userStateSlice } from "@/store/user-state-slice";

import { useUrlSync } from "./use-url-sync";

const createTestStore = () => {
  return configureStore({
    reducer: {
      userState: userStateSlice.reducer,
    },
  });
};

describe("useUrlSync", () => {
  it("should sync filter from URL to Redux store on mount", () => {
    const store = createTestStore();
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn().mockReturnValue("active"),
    };

    renderHook(() => useUrlSync(mockUrlHelpers), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(store.getState().userState.filter).toBe("active");
  });

  it("should not update Redux if URL param is invalid", () => {
    const store = createTestStore();
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn().mockReturnValue("invalid"),
    };

    renderHook(() => useUrlSync(mockUrlHelpers), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(store.getState().userState.filter).toBe("all");
  });

  it("should not update Redux if URL param is null", () => {
    const store = createTestStore();
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn().mockReturnValue(null),
    };

    renderHook(() => useUrlSync(mockUrlHelpers), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(store.getState().userState.filter).toBe("all");
  });

  it("should sync completed filter from URL", () => {
    const store = createTestStore();
    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn().mockReturnValue("completed"),
    };

    renderHook(() => useUrlSync(mockUrlHelpers), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(store.getState().userState.filter).toBe("completed");
  });

  it("should not update if URL filter matches current Redux state", () => {
    const store = createTestStore();
    store.dispatch(userStateSlice.actions.setFilter("active"));

    const mockUrlHelpers: URLHelpers = {
      getCurrentUrl: vi.fn(),
      setSearchParam: vi.fn(),
      replaceState: vi.fn(),
      getSearchParam: vi.fn().mockReturnValue("active"),
    };

    const dispatchSpy = vi.spyOn(store, "dispatch");
    const initialCallCount = dispatchSpy.mock.calls.length;

    renderHook(() => useUrlSync(mockUrlHelpers), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });

    expect(dispatchSpy.mock.calls.length).toBe(initialCallCount);
  });
});

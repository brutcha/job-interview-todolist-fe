import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "./use-debounced-callback";

describe("useDebouncedCallback", () => {
  it("should execute callback and return result", async () => {
    const mockCallback = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    let callbackResult: unknown;
    await act(async () => {
      callbackResult = await result.current[0]("arg1");
    });

    expect(callbackResult).toBe("success");
    expect(mockCallback).toHaveBeenCalledWith("arg1");
  });

  it("should set isBusy to true during callback execution", async () => {
    let resolveCallback: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveCallback = resolve;
    });
    const mockCallback = vi.fn().mockReturnValue(promise);

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    expect(result.current[1]).toBe(false);

    act(() => {
      result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(true);
    });

    await act(async () => {
      resolveCallback!("success");
      await promise;
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });
  });

  it("should allow rapid subsequent calls (non-blocking)", async () => {
    const mockCallback = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    await act(async () => {
      result.current[0]("arg1");
      result.current[0]("arg2");
      result.current[0]("arg3");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback).toHaveBeenNthCalledWith(1, "arg1");
    expect(mockCallback).toHaveBeenNthCalledWith(2, "arg2");
    expect(mockCallback).toHaveBeenNthCalledWith(3, "arg3");
  });

  it("should enforce minimum loading time", async () => {
    const mockCallback = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    const startTime = Date.now();

    await act(async () => {
      await result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(1);
  });

  it("should allow calls after previous callback completes", async () => {
    const mockCallback = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    await act(async () => {
      await result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    await act(async () => {
      await result.current[0]("arg2");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenNthCalledWith(1, "arg1");
    expect(mockCallback).toHaveBeenNthCalledWith(2, "arg2");
  });

  it("should handle callback failures and reset state", async () => {
    const mockCallback = vi
      .fn()
      .mockResolvedValueOnce("success")
      .mockRejectedValue(new Error("Callback failed"));

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    await act(async () => {
      try {
        await result.current[0]("arg1");
      } catch {
        // Expected to fail
      }
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    await act(async () => {
      try {
        await result.current[0]("arg2");
      } catch {
        // Expected to fail
      }
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it("should handle callbacks with multiple arguments", async () => {
    const mockCallback = vi
      .fn()
      .mockImplementation(async (a: string, b: number, c: boolean) => {
        return `${a}-${b}-${c}`;
      });

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    let callbackResult: unknown;
    await act(async () => {
      callbackResult = await result.current[0]("test", 42, true);
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(callbackResult).toBe("test-42-true");
    expect(mockCallback).toHaveBeenCalledWith("test", 42, true);
  });
});

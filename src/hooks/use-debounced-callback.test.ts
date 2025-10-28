import { act, renderHook, waitFor } from "@testing-library/react";
import { Either } from "effect";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedCallback } from "./use-debounced-callback";

describe("useDebouncedCallback", () => {
  it("should execute callback and return Either.Right with result", async () => {
    const mockCallback = vi.fn().mockResolvedValue("success");
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    let callbackResult: Awaited<ReturnType<(typeof result.current)[0]>>;
    await act(async () => {
      callbackResult = await result.current[0]("arg1");
    });

    expect(Either.isRight(callbackResult!)).toBe(true);
    if (Either.isRight(callbackResult!)) {
      expect(callbackResult.right).toBe("success");
    }
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

  it("should handle callback failures and return Either.Left", async () => {
    const mockCallback = vi
      .fn()
      .mockResolvedValueOnce("success")
      .mockRejectedValue(new Error("Callback failed"));

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1 }),
    );

    const successResult = await act(async () => {
      return await result.current[0]("arg1");
    });

    expect(Either.isRight(successResult)).toBe(true);

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    const errorResult = await act(async () => {
      return await result.current[0]("arg2");
    });

    expect(Either.isLeft(errorResult)).toBe(true);
    if (Either.isLeft(errorResult)) {
      expect(errorResult.left._tag).toBe("CallFailed");
      if (errorResult.left._tag === "CallFailed") {
        expect(errorResult.left.error.message).toBe("Callback failed");
      }
    }

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

    let callbackResult: Awaited<ReturnType<(typeof result.current)[0]>>;
    await act(async () => {
      callbackResult = await result.current[0]("test", 42, true);
    });

    expect(Either.isRight(callbackResult!)).toBe(true);
    if (Either.isRight(callbackResult!)) {
      expect(callbackResult.right).toBe("test-42-true");
    }
    expect(mockCallback).toHaveBeenCalledWith("test", 42, true);
  });

  it("should block concurrent calls when blocking is enabled", async () => {
    let resolveCallback: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveCallback = resolve;
    });
    const mockCallback = vi.fn().mockReturnValue(promise);

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 1, blocking: true }),
    );

    let firstPromise: ReturnType<(typeof result.current)[0]>;
    let secondResult: Awaited<ReturnType<(typeof result.current)[0]>>;

    act(() => {
      firstPromise = result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(true);
    });

    await act(async () => {
      secondResult = await result.current[0]("arg2");
    });

    expect(Either.isLeft(secondResult!)).toBe(true);
    if (Either.isLeft(secondResult!)) {
      expect(secondResult.left._tag).toBe("ConcurrentCallBlocked");
    }

    await act(async () => {
      resolveCallback!("success");
      await promise;
    });

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    const firstResult = await firstPromise!;
    expect(Either.isRight(firstResult)).toBe(true);
    if (Either.isRight(firstResult)) {
      expect(firstResult.right).toBe("success");
    }
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should reset loading state immediately on fast-failing callback", async () => {
    const mockCallback = vi.fn().mockRejectedValue(new Error("Fast fail"));

    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, { minLoadingTime: 10 }),
    );

    const startTime = Date.now();

    await act(async () => {
      await result.current[0]("arg1");
    });

    const elapsed = Date.now() - startTime;

    await waitFor(() => {
      expect(result.current[1]).toBe(false);
    });

    expect(elapsed).toBeGreaterThanOrEqual(10);
  });
});

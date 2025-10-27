import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useDebouncedMutation } from "./use-debounced-mutation";

describe("useDebouncedMutation", () => {
  it("should return RTK Query mutation shape", () => {
    const mockUnwrap = vi.fn().mockResolvedValue("success");
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi.fn().mockReturnValue([
      mockTrigger,
      {
        isLoading: false,
        data: undefined,
        error: undefined,
        isSuccess: false,
        isError: false,
      },
    ]);

    const { result } = renderHook(() => useDebouncedMutation(mockUseMutation));

    const [trigger, mutationResult] = result.current;

    expect(typeof trigger).toBe("function");
    expect(mutationResult).toHaveProperty("isLoading");
    expect(mutationResult).toHaveProperty("data");
    expect(mutationResult).toHaveProperty("error");
    expect(mutationResult).toHaveProperty("isSuccess");
    expect(mutationResult).toHaveProperty("isError");
  });

  it("should allow rapid subsequent calls (non-blocking)", async () => {
    const mockTrigger = vi.fn().mockResolvedValue("success");
    const mockUseMutation = vi
      .fn()
      .mockReturnValue([mockTrigger, { isLoading: false }]);

    const { result } = renderHook(() =>
      useDebouncedMutation(mockUseMutation, { minLoadingTime: 50 }),
    );

    const [trigger] = result.current;

    await act(async () => {
      trigger("arg1");
      trigger("arg2");
      trigger("arg3");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });

    expect(mockTrigger).toHaveBeenCalledTimes(3);
    expect(mockTrigger).toHaveBeenNthCalledWith(1, "arg1");
    expect(mockTrigger).toHaveBeenNthCalledWith(2, "arg2");
    expect(mockTrigger).toHaveBeenNthCalledWith(3, "arg3");
  });

  it("should set isLoading to true while mutation is in progress", async () => {
    let resolveMutation: (value: string) => void;
    const promise = new Promise<string>((resolve) => {
      resolveMutation = resolve;
    });

    const mockUnwrap = vi.fn().mockReturnValue(promise);
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi
      .fn()
      .mockReturnValue([mockTrigger, { isLoading: false }]);

    const { result } = renderHook(() =>
      useDebouncedMutation(mockUseMutation, { minLoadingTime: 50 }),
    );

    const [trigger] = result.current;

    act(() => {
      trigger("arg1");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(true);
    });

    await act(async () => {
      resolveMutation!("success");
      await promise;
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });
  });

  it("should enforce minimum loading time", async () => {
    const mockUnwrap = vi.fn().mockResolvedValue("success");
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi
      .fn()
      .mockReturnValue([mockTrigger, { isLoading: false }]);

    const { result } = renderHook(() =>
      useDebouncedMutation(mockUseMutation, { minLoadingTime: 500 }),
    );

    const startTime = Date.now();

    await act(async () => {
      result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeGreaterThanOrEqual(500);
  });

  it("should allow calls after previous mutation completes", async () => {
    const mockUnwrap = vi.fn().mockResolvedValue("success");
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi
      .fn()
      .mockReturnValue([mockTrigger, { isLoading: false }]);

    const { result } = renderHook(() =>
      useDebouncedMutation(mockUseMutation, { minLoadingTime: 50 }),
    );

    await act(async () => {
      result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });

    await act(async () => {
      result.current[0]("arg2");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });

    expect(mockTrigger).toHaveBeenCalledTimes(2);
    expect(mockTrigger).toHaveBeenNthCalledWith(1, "arg1");
    expect(mockTrigger).toHaveBeenNthCalledWith(2, "arg2");
  });

  it("should handle mutation failures and reset state", async () => {
    let rejectMutation: (error: Error) => void;
    const promise = new Promise<string>((_, reject) => {
      rejectMutation = reject;
    }).catch(() => {});

    const mockUnwrap = vi.fn().mockReturnValue(promise);
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi
      .fn()
      .mockReturnValue([mockTrigger, { isLoading: false }]);

    const { result } = renderHook(() =>
      useDebouncedMutation(mockUseMutation, { minLoadingTime: 50 }),
    );

    act(() => {
      result.current[0]("arg1");
    });

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(true);
    });

    rejectMutation!(new Error("Mutation failed"));

    await waitFor(() => {
      expect(result.current[1].isLoading).toBe(false);
    });

    await act(async () => {
      result.current[0]("arg2");
    });

    await waitFor(() => {
      expect(mockTrigger).toHaveBeenCalledTimes(2);
    });
  });

  it("should preserve other mutation result properties", () => {
    const mockUnwrap = vi.fn().mockResolvedValue("success");
    const mockTrigger = vi.fn().mockReturnValue({ unwrap: mockUnwrap });
    const mockUseMutation = vi.fn().mockReturnValue([
      mockTrigger,
      {
        isLoading: false,
        data: { id: "123", name: "Test" },
        error: null,
        isSuccess: true,
        isError: false,
        reset: vi.fn(),
        originalArgs: "test-arg",
      },
    ]);

    const { result } = renderHook(() => useDebouncedMutation(mockUseMutation));

    const [, mutationResult] = result.current;

    expect(mutationResult.data).toEqual({ id: "123", name: "Test" });
    expect(mutationResult.error).toBe(null);
    expect(mutationResult.isSuccess).toBe(true);
    expect(mutationResult.isError).toBe(false);
    expect(mutationResult.reset).toBeDefined();
    expect(mutationResult.originalArgs).toBe("test-arg");
  });
});

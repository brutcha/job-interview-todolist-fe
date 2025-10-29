import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Task } from "@/schemas/api";

import { useSelectedTasks } from "./use-selected-tasks";

vi.mock("@/api/todo-api", () => ({
  todoApi: {
    useGetTasksQuery: vi.fn(),
  },
}));

describe("useSelectedTasks", () => {
  const mockTasks: Task[] = [
    {
      id: "task_01234567890123456789012" as Task["id"],
      text: "Active task 1",
      completed: false,
      createdDate: 1234567890,
      completedDate: undefined,
    },
    {
      id: "task_01234567890123456789013" as Task["id"],
      text: "Completed task 1",
      completed: true,
      createdDate: 1234567891,
      completedDate: 1234567892,
    },
    {
      id: "task_01234567890123456789014" as Task["id"],
      text: "Active task 2",
      completed: false,
      createdDate: 1234567893,
      completedDate: undefined,
    },
    {
      id: "task_01234567890123456789015" as Task["id"],
      text: "Completed task 2",
      completed: true,
      createdDate: 1234567894,
      completedDate: 1234567895,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return undefined data when tasks is undefined", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.data).toBeUndefined();
  });

  it("should return all tasks when filter is 'all'", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.data).toEqual(mockTasks);
    expect(result.current.data?.length).toBe(4);
  });

  it("should return only active tasks when filter is 'active'", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockImplementation(
      (_arg, options) => {
        const baseResult = {
          data: mockTasks,
          error: undefined,
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        };
        return options?.selectFromResult
          ? options.selectFromResult(baseResult)
          : baseResult;
      },
    );

    const { result } = renderHook(() => useSelectedTasks("active"));
    expect(result.current.data?.length).toBe(2);
    expect(result.current.data?.[0].text).toBe("Active task 1");
    expect(result.current.data?.[1].text).toBe("Active task 2");
    expect(result.current.data?.every((task) => !task.completed)).toBe(true);
  });

  it("should return only completed tasks when filter is 'completed'", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockImplementation(
      (_arg, options) => {
        const baseResult = {
          data: mockTasks,
          error: undefined,
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        };
        return options?.selectFromResult
          ? options.selectFromResult(baseResult)
          : baseResult;
      },
    );

    const { result } = renderHook(() => useSelectedTasks("completed"));
    expect(result.current.data?.length).toBe(2);
    expect(result.current.data?.[0].text).toBe("Completed task 1");
    expect(result.current.data?.[1].text).toBe("Completed task 2");
    expect(result.current.data?.every((task) => task.completed)).toBe(true);
  });

  it("should return empty array when no tasks match filter", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const onlyActiveTasks: Task[] = [
      {
        id: "task_01234567890123456789012" as Task["id"],
        text: "Active task",
        completed: false,
        createdDate: 1234567890,
        completedDate: undefined,
      },
    ];

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockImplementation(
      (_arg, options) => {
        const baseResult = {
          data: onlyActiveTasks,
          error: undefined,
          isLoading: false,
          isFetching: false,
          refetch: vi.fn(),
        };
        return options?.selectFromResult
          ? options.selectFromResult(baseResult)
          : baseResult;
      },
    );

    const { result } = renderHook(() => useSelectedTasks("completed"));
    expect(result.current.data).toEqual([]);
    expect(result.current.data?.length).toBe(0);
  });

  it("should return empty array when tasks is empty", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.data).toEqual([]);
    expect(result.current.data?.length).toBe(0);
  });

  it("should pass through error from API", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockError = { status: "FETCH_ERROR", error: "Network error" };

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.error).toEqual(mockError);
  });

  it("should pass through loading state from API", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.isLoading).toBe(true);
  });

  it("should pass through refetch function from API", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockRefetch = vi.fn();
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useSelectedTasks("all"));
    expect(result.current.refetch).toBe(mockRefetch);
  });
});

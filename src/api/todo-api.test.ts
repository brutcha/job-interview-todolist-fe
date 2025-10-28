import { Schema } from "effect";
import { describe, expect, it, vi } from "vitest";

import type { TaskID } from "@/schemas/api";

import {
  debouncedQueryFn,
  handleTaskCreate,
  handleTaskDelete,
  handleTaskUpdate,
  todoApi,
} from "./todo-api";

vi.mock("@/lib/parse-base-url", () => ({
  parseBaseURL: () => "http://localhost:3000",
}));

vi.mock("@/store/user-state-slice", () => ({
  userStateSlice: {
    actions: {
      clearEditingTask: vi.fn(() => ({
        type: "userState/clearEditingTask",
      })),
      clearNewTask: vi.fn(() => ({
        type: "userState/clearNewTask",
      })),
    },
  },
}));

describe("handleTaskUpdate", () => {
  it("should update query data on success", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;
    const mockData = {
      id: taskID,
      text: "Test task",
      completed: true,
      createdDate: 1234567890,
      completedDate: 1234567890,
    };

    const queryFulfilled = Promise.resolve({ data: mockData });

    const mockUpdateQueryData = vi.fn(() => ({
      type: "api/util/updateQueryData",
    }));
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await handleTaskUpdate(taskID, mockDispatch, queryFulfilled);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockUpdateQueryData).toHaveBeenCalledWith(
      "getTasks",
      undefined,
      expect.any(Function),
    );
  });

  it("should clear editing task when clearEditingTask option is true", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;
    const mockData = {
      id: taskID,
      text: "Test task",
      completed: true,
      createdDate: 1234567890,
      completedDate: 1234567890,
    };

    const queryFulfilled = Promise.resolve({ data: mockData });

    const mockUpdateQueryData = vi.fn(() => ({
      type: "api/util/updateQueryData",
    }));
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await handleTaskUpdate(taskID, mockDispatch, queryFulfilled, {
      clearEditingTask: true,
    });

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        type: expect.stringContaining("clearEditingTask"),
      }),
    );
  });

  it("should not clear editing task when clearEditingTask option is false", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;
    const mockData = {
      id: taskID,
      text: "Test task",
      completed: true,
      createdDate: 1234567890,
      completedDate: 1234567890,
    };

    const queryFulfilled = Promise.resolve({ data: mockData });

    const mockUpdateQueryData = vi.fn(() => ({
      type: "api/util/updateQueryData",
    }));
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await handleTaskUpdate(taskID, mockDispatch, queryFulfilled, {
      clearEditingTask: false,
    });

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("should throw error on failure", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;

    const queryFulfilled = Promise.reject(new Error("API Error"));

    const mockUpdateQueryData = vi.fn();
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await expect(
      async () => await handleTaskUpdate(taskID, mockDispatch, queryFulfilled),
    ).rejects.toThrow();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUpdateQueryData).not.toHaveBeenCalled();
  });
});

describe("handleTaskDelete", () => {
  it("should remove task from query data on success", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;

    const queryFulfilled = Promise.resolve({});

    const mockUpdateQueryData = vi.fn(() => ({
      type: "api/util/updateQueryData",
    }));
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await handleTaskDelete(taskID, mockDispatch, queryFulfilled);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockUpdateQueryData).toHaveBeenCalledWith(
      "getTasks",
      undefined,
      expect.any(Function),
    );
  });

  it("should throw error on failure", async () => {
    const mockDispatch = vi.fn();
    const taskID = "task_12345678901234567890123" as TaskID;

    const queryFulfilled = Promise.reject(new Error("API Error"));

    const mockUpdateQueryData = vi.fn();
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await expect(
      async () => await handleTaskDelete(taskID, mockDispatch, queryFulfilled),
    ).rejects.toThrow();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUpdateQueryData).not.toHaveBeenCalled();
  });
});

describe("handleTaskCreate", () => {
  it("should add task to query data and clear new task", async () => {
    const mockDispatch = vi.fn();
    const mockData = {
      id: "task_12345678901234567890123" as TaskID,
      text: "New task",
      completed: false,
      createdDate: 1234567890,
    };

    const queryFulfilled = Promise.resolve({ data: mockData });

    const mockUpdateQueryData = vi.fn(() => ({
      type: "api/util/updateQueryData",
    }));
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await handleTaskCreate(mockDispatch, queryFulfilled);

    expect(mockDispatch).toHaveBeenCalledTimes(2);
    expect(mockDispatch).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        type: expect.stringContaining("clearNewTask"),
      }),
    );
    expect(mockUpdateQueryData).toHaveBeenCalledWith(
      "getTasks",
      undefined,
      expect.any(Function),
    );
  });

  it("should throw error on failure", async () => {
    const mockDispatch = vi.fn();
    const queryFulfilled = Promise.reject(new Error("API Error"));

    const mockUpdateQueryData = vi.fn();
    (todoApi.util as unknown) = {
      updateQueryData: mockUpdateQueryData,
    };

    await expect(
      async () => await handleTaskCreate(mockDispatch, queryFulfilled),
    ).rejects.toThrow();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUpdateQueryData).not.toHaveBeenCalled();
  });
});

describe("debouncedQueryFn", () => {
  it("should debounce query and return successful result", async () => {
    const mockQuery = vi.fn(() => ({ url: "/test" }));
    const mockBaseQuery = vi.fn(() =>
      Promise.resolve({
        data: { test: "value" },
        meta: { response: { status: 200 } },
      }),
    );
    const mockSchema = Schema.Struct({ test: Schema.String });

    const queryFn = debouncedQueryFn(mockQuery, mockSchema, 1);

    const startTime = Date.now();
    const result = await queryFn(
      "test-arg",
      {} as never,
      {},
      mockBaseQuery as never,
    );
    const endTime = Date.now();

    expect(endTime - startTime).toBeGreaterThanOrEqual(1);
    expect(result).toEqual({ data: { test: "value" } });
    expect(mockQuery).toHaveBeenCalledWith("test-arg");
    expect(mockBaseQuery).toHaveBeenCalledWith({ url: "/test" });
  });

  it("should return error on failed query", async () => {
    const mockQuery = vi.fn(() => ({ url: "/test" }));
    const mockError = { status: 500, data: "Server error" };
    const mockBaseQuery = vi.fn(() => Promise.resolve({ error: mockError }));
    const mockSchema = Schema.Struct({ test: Schema.String });

    const queryFn = debouncedQueryFn(mockQuery, mockSchema, 1);

    const result = await queryFn(
      "test-arg",
      {} as never,
      {},
      mockBaseQuery as never,
    );

    expect(result).toEqual({ error: mockError });
  });

  it("should return parsing error on invalid response", async () => {
    const mockQuery = vi.fn(() => ({ url: "/test" }));
    const mockBaseQuery = vi.fn(() =>
      Promise.resolve({
        data: { invalid: 123 },
        meta: { response: { status: 200 } },
      }),
    );
    const mockSchema = Schema.Struct({ test: Schema.String });

    const queryFn = debouncedQueryFn(mockQuery, mockSchema, 1);

    const result = await queryFn(
      "test-arg",
      {} as never,
      {},
      mockBaseQuery as never,
    );

    expect(result).toHaveProperty("error");
    if ("error" in result) {
      expect(result.error).toMatchObject({
        status: "PARSING_ERROR",
        originalStatus: 200,
      });
    }
  });
});

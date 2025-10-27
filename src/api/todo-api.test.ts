import { describe, expect, it, vi } from "vitest";

import type { TaskID } from "@/schemas/api";

import { handleTaskDelete, handleTaskUpdate, todoApi } from "./todo-api";

vi.mock("@/lib/parse-base-url", () => ({
  parseBaseURL: () => "http://localhost:3000",
}));

vi.mock("@/store/user-state-slice", () => ({
  userStateSlice: {
    actions: {
      clearEditingTask: vi.fn(() => ({
        type: "userState/clearEditingTask",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (todoApi.util as any) = {
      updateQueryData: mockUpdateQueryData,
    };

    await expect(
      async () => await handleTaskDelete(taskID, mockDispatch, queryFulfilled),
    ).rejects.toThrow();

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockUpdateQueryData).not.toHaveBeenCalled();
  });
});

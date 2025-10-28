import { Provider } from "react-redux";

import type { Store } from "@reduxjs/toolkit";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { todoApi } from "@/api/todo-api";
import type { Task } from "@/schemas/api";
import { store } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

import {
  EmptyTaskListItem,
  SkeletonTaskListItem,
  TaskListItem,
} from "./task-list-item";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/hooks/use-debounced-mutation", () => ({
  useDebouncedMutation: vi.fn((mutationHook) => {
    const [trigger, result] = mutationHook();
    const wrappedTrigger = async (...args: unknown[]) => {
      const { Either } = await import("effect");
      const { CallFailed } = await import("@/schemas/model");
      try {
        const data = await trigger(...args).unwrap();
        return Either.right(data);
      } catch (error) {
        return Either.left(
          new CallFailed({
            error: error instanceof Error ? error : new Error(String(error)),
          }),
        );
      }
    };
    return [wrappedTrigger, result];
  }),
}));

describe("TaskListItem", () => {
  const mockTask: Task = {
    id: "test-id" as Task["id"],
    text: "Test Task",
    completed: false,
    createdDate: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    store.dispatch(userStateSlice.actions.clearEditingTask());
  });

  it("should render task text", () => {
    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByText("Test Task")).toBeDefined();
  });

  it("should render unchecked checkbox for incomplete task", () => {
    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDefined();
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("should render checked checkbox for completed task", () => {
    const completedTask: Task = { ...mockTask, completed: true };

    render(
      <Provider store={store}>
        <TaskListItem task={completedTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });

  it("should render delete button", () => {
    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByLabelText("Delete Task")).toBeDefined();
  });

  it("should disable checkbox when isFetching is true", () => {
    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={true} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.hasAttribute("disabled")).toBe(true);
  });

  it("should disable delete button when isFetching is true", () => {
    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={true} />
      </Provider>,
    );

    const deleteButton = screen.getByLabelText("Delete Task");
    expect(deleteButton.hasAttribute("disabled")).toBe(true);
  });

  it("should toggle task completion when clicking checkbox", async () => {
    const user = userEvent.setup();
    const mockCompleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      mockCompleteTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");

    await user.click(checkbox);

    await waitFor(() => {
      expect(mockCompleteTask).toHaveBeenCalledWith("test-id");
    });
  });

  it("should call completeTask when checking incomplete task", async () => {
    const user = userEvent.setup();
    const mockCompleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      mockCompleteTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockCompleteTask).toHaveBeenCalledWith("test-id");
    });
  });

  it("should call incompleteTask when unchecking completed task", async () => {
    const user = userEvent.setup();
    const completedTask: Task = { ...mockTask, completed: true };
    const mockIncompleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useIncompleteTaskMutation").mockReturnValue([
      mockIncompleteTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={completedTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockIncompleteTask).toHaveBeenCalledWith("test-id");
    });
  });

  it("should call deleteTask when clicking delete button", async () => {
    const user = userEvent.setup();
    const mockDeleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useDeleteTaskMutation").mockReturnValue([
      mockDeleteTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const deleteButton = screen.getByLabelText("Delete Task");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith("test-id");
    });
  });

  it("should enter editing mode when clicking Edit button", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const editButton = screen.getByLabelText("Edit Task");
    await user.click(editButton);

    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByLabelText("Update Task")).toBeDefined();

    expect(screen.queryByLabelText("Edit Task")).toBeNull();
    expect(screen.queryByLabelText("Delete Task")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("should render editing mode UI elements correctly", () => {
    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Test Task",
        },
      }),
      dispatch: vi.fn(),
    };

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe("Test Task");

    const inputGroup =
      input.closest('[data-slot="input-group"]') || input.parentElement;
    expect(inputGroup).toBeDefined();

    const submitButton = screen.getByLabelText("Update Task");
    expect(submitButton).toBeDefined();
  });

  it("should update Redux store when input value changes", async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();

    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Test Task",
        },
      }),
      dispatch: mockDispatch,
    };

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const input = screen.getByRole("textbox");
    await user.type(input, " Updated");

    expect(mockDispatch).toHaveBeenCalled();
    expect(
      mockDispatch.mock.calls.some(
        (call) =>
          call[0].type === "userState/editTask" &&
          call[0].payload.taskID === "test-id",
      ),
    ).toBe(true);
  });

  it("should call updateTask when input loses focus with changed value", async () => {
    const user = userEvent.setup();
    const mockUpdateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Updated Task",
        },
      }),
      dispatch: vi.fn(),
    };

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith([
        "test-id",
        { text: "Updated Task" },
      ]);
    });
  });

  it("should clear editing mode when input loses focus with unchanged value", async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();
    const mockUpdateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.clearAllMocks();

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Test Task",
        },
      }),
      dispatch: mockDispatch,
    };

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.tab();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "userState/clearEditingTask",
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  it("should call updateTask when clicking submit button", async () => {
    const user = userEvent.setup();
    const mockUpdateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Updated Task Text",
        },
      }),
      dispatch: vi.fn(),
    };

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const submitButton = screen.getByLabelText("Update Task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith([
        "test-id",
        { text: "Updated Task Text" },
      ]);
    });
  });

  it("should disable submit button during mutation", () => {
    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Updated Task Text",
        },
      }),
      dispatch: vi.fn(),
    };

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ] as never);

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const submitButton = screen.getByLabelText("Update Task");
    expect(submitButton.hasAttribute("disabled")).toBe(true);
    expect(submitButton.getAttribute("aria-busy")).toBe("true");
  });

  it("should focus input when entering edit mode", async () => {
    const user = userEvent.setup();

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const editButton = screen.getByLabelText("Edit Task");
    await user.click(editButton);

    const input = await screen.findByRole("textbox");
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it("should persist editing mode during submission (isSubmitting)", () => {
    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: null,
          editingTaskText: "",
        },
      }),
      dispatch: vi.fn(),
    };

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ] as never);

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByLabelText("Update Task")).toBeDefined();

    expect(screen.queryByLabelText("Edit Task")).toBeNull();
    expect(screen.queryByLabelText("Delete Task")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("should show error toast and no success toast on mutation failures", async () => {
    const user = userEvent.setup();
    const mockedToast = vi.mocked(toast);

    const mockCompleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("test")),
    });

    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      mockCompleteTask,
      { isLoading: false },
    ] as never);

    const mockDeleteTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("test")),
    });

    vi.spyOn(todoApi, "useDeleteTaskMutation").mockReturnValue([
      mockDeleteTask,
      { isLoading: false },
    ] as never);

    const mockUpdateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("test")),
    });

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Failed to update task");
      expect(mockedToast.success).not.toHaveBeenCalled();
    });

    const deleteButton = screen.getByLabelText("Delete Task");
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Failed to delete task");
      expect(mockedToast.success).not.toHaveBeenCalled();
    });

    const editButton = screen.getByLabelText("Edit Task");
    await user.click(editButton);

    const input = await screen.findByRole("textbox");
    await user.clear(input);
    await user.type(input, "Updated");

    const submitButton = screen.getByLabelText("Update Task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedToast.error).toHaveBeenCalledWith("Failed to update task");
      expect(mockedToast.success).not.toHaveBeenCalled();
    });
  });

  it("should prevent double submission when blur and click occur", async () => {
    const user = userEvent.setup();
    const mockUpdateTask = vi.fn().mockReturnValue({
      unwrap: vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(() => resolve({}), 100)),
        ),
    });

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    act(() => {
      store.dispatch(
        userStateSlice.actions.editTask({
          taskID: "test-id" as Task["id"],
          taskText: "Updated Task",
        }),
      );
    });

    await screen.findByRole("textbox");
    const submitButton = screen.getByLabelText("Update Task");

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledTimes(1);
    });
  });

  it("should show deleting status message", () => {
    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    vi.spyOn(todoApi, "useIncompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    vi.spyOn(todoApi, "useDeleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByText("Deleting task")).toBeDefined();
  });

  it("should show completing status message", () => {
    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ] as never);

    vi.spyOn(todoApi, "useIncompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    vi.spyOn(todoApi, "useDeleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByText("Marking as complete")).toBeDefined();
  });

  it("should show incompleting status message", () => {
    const completedTask: Task = { ...mockTask, completed: true };

    vi.spyOn(todoApi, "useCompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    vi.spyOn(todoApi, "useIncompleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true },
    ] as never);

    vi.spyOn(todoApi, "useDeleteTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <TaskListItem task={completedTask} isFetching={false} />
      </Provider>,
    );

    expect(screen.getByText("Marking as incomplete")).toBeDefined();
  });
});

describe("SkeletonTaskListItem", () => {
  it("should render skeleton component", () => {
    render(<SkeletonTaskListItem />);

    const item = document.querySelector('[data-slot="item"]');
    expect(item).toBeDefined();
    expect(item?.querySelector('[data-slot="skeleton"]')).toBeDefined();
  });
});

describe("EmptyTaskListItem", () => {
  it("should render empty state message", () => {
    render(<EmptyTaskListItem />);

    expect(screen.getByText("You have no tasks.")).toBeDefined();
    expect(document.querySelector('[data-slot="item"]')).toBeDefined();
  });
});

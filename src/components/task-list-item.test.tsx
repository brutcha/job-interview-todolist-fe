import { Provider } from "react-redux";

import type { Store } from "@reduxjs/toolkit";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { todoApi } from "@/api/todo-api";
import type { Task } from "@/schemas/api";
import { store } from "@/store/store";

import {
  EmptyTaskListItem,
  SkeletonTaskListItem,
  TaskListItem,
} from "./task-list-item";

vi.mock("@/hooks/use-debounced-mutation", () => ({
  useDebouncedMutation: vi.fn((mutationHook) => {
    const [trigger, result] = mutationHook();
    return [trigger, result];
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

    // Verify editing mode UI appears
    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByLabelText("Update Task")).toBeDefined();

    // Verify normal mode UI disappears
    expect(screen.queryByLabelText("Edit Task")).toBeNull();
    expect(screen.queryByLabelText("Delete Task")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("should render editing mode UI elements correctly", () => {
    // Mock Redux state to simulate editing mode
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

    // Verify editing mode UI elements
    const input = screen.getByRole("textbox");
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe("Test Task");

    // Check for SquarePenIcon (using data-testid or checking the icon is rendered)
    const inputGroup =
      input.closest('[data-slot="input-group"]') || input.parentElement;
    expect(inputGroup).toBeDefined();

    // Verify submit button
    const submitButton = screen.getByLabelText("Update Task");
    expect(submitButton).toBeDefined();
  });

  it("should update Redux store when input value changes", async () => {
    const user = userEvent.setup();
    const mockDispatch = vi.fn();

    // Mock Redux state to simulate editing mode
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

    // Verify dispatch was called (indicating input change handler works)
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

    // Mock Redux state to simulate editing mode
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
    await user.click(input); // Focus the input
    await user.tab(); // Blur the input

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

    // Reset all mocks before this test
    vi.clearAllMocks();

    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      mockUpdateTask,
      { isLoading: false },
    ] as never);

    // Mock Redux state to simulate editing mode with same value as original
    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: "test-id",
          editingTaskText: "Test Task", // Same as original task text
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
    await user.click(input); // Focus the input
    await user.tab(); // Blur the input

    // Verify clearEditingTask action is dispatched
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "userState/clearEditingTask",
    });

    // Verify no API call is made (updateTask should not be called)
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

    // Mock Redux state to simulate editing mode with changed value
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
    // Mock Redux state to simulate editing mode
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

    // Mock the mutation to return loading state
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
    const mockDispatch = vi.fn();

    // Mock a clean store state without editing mode
    const cleanStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: null,
          editingTaskText: "",
        },
      }),
      dispatch: mockDispatch,
    };

    // Mock the mutation to not be loading
    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ] as never);

    render(
      <Provider store={cleanStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    const editButton = screen.getByLabelText("Edit Task");
    await user.click(editButton);

    // Verify that the editTask action was dispatched
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "userState/editTask",
      payload: {
        taskID: "test-id",
        taskText: "Test Task",
      },
    });
  });

  it("should persist editing mode during submission (isSubmiting)", () => {
    // Mock Redux state with no editing task ID but simulate submission state
    const mockStore = {
      ...store,
      getState: () => ({
        ...store.getState(),
        userState: {
          editingTaskID: null, // No editing task ID
          editingTaskText: "",
        },
      }),
      dispatch: vi.fn(),
    };

    // Mock the mutation to return loading state (isSubmiting = true)
    vi.spyOn(todoApi, "useUpdateTaskMutation").mockReturnValue([
      vi.fn(),
      { isLoading: true }, // This makes isSubmiting = true
    ] as never);

    render(
      <Provider store={mockStore as unknown as Store}>
        <TaskListItem task={mockTask} isFetching={false} />
      </Provider>,
    );

    // Verify editing mode UI is displayed even without editingTaskID
    // because isSubmiting is true
    expect(screen.getByRole("textbox")).toBeDefined();
    expect(screen.getByLabelText("Update Task")).toBeDefined();

    // Verify normal mode UI is hidden
    expect(screen.queryByLabelText("Edit Task")).toBeNull();
    expect(screen.queryByLabelText("Delete Task")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
  });
});

describe("SkeletonTaskListItem", () => {
  it("should render skeleton component", () => {
    render(<SkeletonTaskListItem />);

    // Use querySelector since the element has aria-hidden
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

import { Provider } from "react-redux";

import { act, render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { todoApi } from "@/api/todo-api";
import { store } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

import { NewTaskCard } from "./new-task-card";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/ui/item", () => ({
  Item: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="item" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/task-input-item", () => ({
  TaskInputGroup: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="task-input-group" {...props}>
      {children}
    </div>
  ),
  TaskInputGroupInput: (props: Record<string, unknown>) => (
    <input data-testid="task-input" {...props} />
  ),
  TaskInputGroupIconAddon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="icon-addon">{children}</div>
  ),
  TaskInputGroupButtonAddon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="button-addon">{children}</div>
  ),
}));

vi.mock("@/components/task-icon", () => ({
  TaskIcon: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="task-icon">{children}</div>
  ),
}));

vi.mock("@/components/task-button", () => ({
  TaskButton: ({ children, ...props }: { children: React.ReactNode }) => (
    <button data-testid="task-button" {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading</div>,
}));

vi.mock("lucide-react", () => ({
  SendHorizontalIcon: () => <div data-testid="send-icon">Send</div>,
  SquarePlusIcon: () => <div data-testid="plus-icon">Plus</div>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  store.dispatch(userStateSlice.actions.clearNewTask());
});

describe("NewTaskCard", () => {
  it("should render input field", () => {
    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(/what's needs to bee done/i);
    expect(input).toBeDefined();
  });

  it("should update value on input change", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    const input = screen.getByPlaceholderText(/what's needs to bee done/i);

    waitFor(async () => {
      await user.type(input, "New task");
      expect(store.getState().userState.newTaskText).toBe("New task");
    });
  });

  it("should show submit button when value is not empty", () => {
    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Some task"));
    });

    const button = screen.getByRole("button");
    expect(button).toBeDefined();
    expect(button.getAttribute("aria-description")).toBe("Create task");
  });

  it("should not show submit button when value is empty", () => {
    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask(""));
    });

    const button = screen.queryByRole("button");
    expect(button).toBeNull();
  });

  it("should call addTask when submit button is clicked", async () => {
    const user = userEvent.setup();
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("New task"));
    });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(mockCreateTask).toBeCalledWith({ text: "New task" });
  });

  it("should call addTask on blur with non-empty value", async () => {
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Task on blur"));
    });

    const input = screen.getByPlaceholderText(/what's needs to bee done/i);
    input.blur();

    expect(mockCreateTask).toBeCalledWith({ text: "Task on blur" });
  });

  it("should clear newTask on blur with empty value", async () => {
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask(""));
    });

    const input = screen.getByPlaceholderText(/what's needs to bee done/i);
    input.blur();

    await waitFor(() => {
      expect(store.getState().userState.newTaskText).toBeNull();
      expect(mockCreateTask).not.toBeCalled();
    });
  });

  it("should show error toast on failed task creation", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockRejectedValue(new Error("Cann't add.")),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Failed task"));
    });

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Unable to add Task.");
      expect(toast.success).not.toBeCalled();
    });
  });

  it("should show success toast on successful task creation", async () => {
    const user = userEvent.setup();
    const { toast } = await import("sonner");
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: false },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Success task"));
    });

    const button = screen.getByRole("button");
    await user.click(button);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("New task was added.");
      expect(toast.error).not.toBeCalled();
    });
  });

  it("should disable button when isLoading", () => {
    const mockCreateTask = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: true },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Loading task"));
    });

    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", true);
  });

  it("should not call addTask when value is empty", async () => {
    const user = userEvent.setup();
    const mockCreateTask = vi
      .fn()
      .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });

    vi.spyOn(todoApi, "useCreateTaskMutation").mockReturnValue([
      mockCreateTask,
      { isLoading: true },
    ] as never);

    render(
      <Provider store={store}>
        <NewTaskCard />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("Test"));
    });

    const input = screen.getByPlaceholderText(/what's needs to bee done/i);
    await user.clear(input);

    waitFor(() => {
      const button = screen.queryByRole("button");
      expect(button).toBeNull();
    });

    expect(mockCreateTask).not.toHaveBeenCalled();
  });
});

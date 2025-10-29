import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskList } from "./task-list";

vi.mock("@/api/todo-api", () => ({
  todoApi: {
    useGetTasksQuery: vi.fn(),
  },
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual("react-redux");
  return {
    ...actual,
    useSelector: vi.fn((selector) =>
      selector({
        userState: { newTaskText: null, filter: "all" },
      }),
    ),
    useDispatch: vi.fn(() => vi.fn()),
  };
});

vi.mock("@/components/ui/alert", () => ({
  Alert: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <div data-testid="alert" data-variant={variant}>
      {children}
    </div>
  ),
  AlertDescription: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertTitle: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    "aria-busy": ariaBusy,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    "aria-busy"?: boolean;
  }) => (
    <button onClick={onClick} aria-busy={ariaBusy}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/item", () => ({
  ItemGroup: ({
    children,
    className,
    "aria-busy": ariaBusy,
  }: {
    children: React.ReactNode;
    className?: string;
    "aria-busy"?: boolean;
  }) => (
    <div className={className} aria-busy={ariaBusy} role="group">
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/task-card", () => ({
  TaskCard: ({ task }: { task: { text: string } }) => (
    <div data-testid="task-item">{task.text}</div>
  ),
}));

vi.mock("@/components/empty-task-card", () => ({
  EmptyTaskCard: () => <div data-testid="empty-task-list">No tasks</div>,
}));

vi.mock("@/components/skeleton-task-card", () => ({
  SkeletonTaskCard: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton-task">
      Skeleton
    </div>
  ),
}));

vi.mock("@/components/new-task-card", () => ({
  NewTaskCard: () => <div data-testid="new-task-card">New Task</div>,
}));

vi.mock("@/components/task-filter", () => ({
  TasksFilter: () => <div data-testid="tasks-filter">Filter</div>,
}));

vi.mock("lucide-react", () => ({
  AlertCircleIcon: () => <div data-testid="alert-circle-icon">Alert</div>,
  RefreshCwIcon: () => <div data-testid="refresh-icon">Refresh</div>,
}));

vi.mock("@/lib/is-dev", () => ({
  isDev: vi.fn(() => false),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(" "),
}));

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    expect(screen.getAllByTestId("skeleton-task").length).toBeGreaterThan(0);
  });

  it("should render tasks when data is available", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockTasks = [
      {
        id: "task_01234567890123456789012",
        text: "Test task 1",
        completed: false,
        createdDate: 1234567890,
        completedDate: undefined,
      },
      {
        id: "task_01234567890123456789013",
        text: "Test task 2",
        completed: true,
        createdDate: 1234567891,
        completedDate: 1234567892,
      },
    ];

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    expect(screen.getByText("Test task 1")).toBeDefined();
    expect(screen.getByText("Test task 2")).toBeDefined();
  });

  it("should render error state", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockError = { status: "FETCH_ERROR", error: "Network error" };

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    expect(screen.getByText("Unable to load your tasks.")).toBeDefined();
    expect(screen.getByText("Try Again")).toBeDefined();
  });

  it("should render empty state when no tasks", async () => {
    const { todoApi } = await import("@/api/todo-api");
    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    expect(screen.getByTestId("empty-task-list")).toBeDefined();
  });

  it("should call refetch when Try Again button is clicked", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockRefetch = vi.fn();
    const mockError = { status: "FETCH_ERROR", error: "Network error" };

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    render(<TaskList />);

    const tryAgainButton = screen.getByText("Try Again");
    tryAgainButton.click();

    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("should show error details in dev mode", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const { isDev } = await import("@/lib/is-dev");
    (isDev as ReturnType<typeof vi.fn>).mockReturnValue(true);

    const mockError = { status: "FETCH_ERROR", error: "Network error" };

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { container } = render(<TaskList />);

    const preElement = container.querySelector("pre");
    expect(preElement).toBeDefined();
    expect(preElement?.textContent).toContain("FETCH_ERROR");
  });

  it("should show fetching spinner when refetching", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockError = { status: "FETCH_ERROR", error: "Network error" };

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
      isFetching: true,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  it("should show singular task count for 1 task", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const mockTasks = [
      {
        id: "task_01234567890123456789012",
        text: "Test task 1",
        completed: false,
        createdDate: 1234567890,
        completedDate: undefined,
      },
    ];

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTasks,
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    const { container } = render(<TaskList />);

    const screenReader = container.querySelector("[aria-atomic='true']");
    expect(screenReader?.textContent).toBe("1 task");
  });

  it("should not show NewTaskCard when newTaskText is not a string", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const reactRedux = await import("react-redux");
    vi.mocked(reactRedux.useSelector).mockImplementation((selector) =>
      selector({
        userState: { newTaskText: null, filter: "all" },
      }),
    );

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    const newTaskCard = screen.queryByTestId("new-task-card");
    expect(newTaskCard).toBeNull();
  });

  it("should show NewTaskCard when newTaskText is a string", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const reactRedux = await import("react-redux");
    vi.mocked(reactRedux.useSelector).mockImplementation((selector) =>
      selector({
        userState: { newTaskText: "test", filter: "all" },
      }),
    );

    (todoApi.useGetTasksQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: vi.fn(),
    });

    render(<TaskList />);

    const newTaskCard = screen.getByTestId("new-task-card");
    expect(newTaskCard).toBeDefined();
  });

  it("should filter active tasks", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const reactRedux = await import("react-redux");
    vi.mocked(reactRedux.useSelector).mockImplementation((selector) =>
      selector({
        userState: { newTaskText: null, filter: "active" },
      }),
    );

    const mockTasks = [
      {
        id: "task_01234567890123456789012",
        text: "Active task",
        completed: false,
        createdDate: 1234567890,
        completedDate: undefined,
      },
      {
        id: "task_01234567890123456789013",
        text: "Completed task",
        completed: true,
        createdDate: 1234567891,
        completedDate: 1234567892,
      },
    ];

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

    render(<TaskList />);

    expect(screen.getByText("Active task")).toBeDefined();
    expect(screen.queryByText("Completed task")).toBeNull();
  });

  it("should filter completed tasks", async () => {
    const { todoApi } = await import("@/api/todo-api");
    const reactRedux = await import("react-redux");
    vi.mocked(reactRedux.useSelector).mockImplementation((selector) =>
      selector({
        userState: { newTaskText: null, filter: "completed" },
      }),
    );

    const mockTasks = [
      {
        id: "task_01234567890123456789012",
        text: "Active task",
        completed: false,
        createdDate: 1234567890,
        completedDate: undefined,
      },
      {
        id: "task_01234567890123456789013",
        text: "Completed task",
        completed: true,
        createdDate: 1234567891,
        completedDate: 1234567892,
      },
    ];

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

    render(<TaskList />);

    expect(screen.queryByText("Active task")).toBeNull();
    expect(screen.getByText("Completed task")).toBeDefined();
  });
});

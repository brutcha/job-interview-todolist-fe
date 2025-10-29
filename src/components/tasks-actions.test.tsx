import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TasksActions } from "./tasks-actions";

// Mock all external dependencies at the top level
vi.mock("@/api/todo-api", () => ({
  todoApi: {
    useCompleteTaskMutation: () => [vi.fn(), {}],
    useDeleteTaskMutation: () => [vi.fn(), {}],
  },
}));

vi.mock("@/store/store", () => ({
  selectRunningOperations: vi.fn(() => ({
    READ: 0,
    CREATE: 0,
    UPDATE: 0,
    DELETE: 0,
  })),
}));

vi.mock("react-redux", () => ({
  useSelector: vi.fn(() => ({
    READ: 0,
    CREATE: 0,
    UPDATE: 0,
    DELETE: 0,
  })),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    variant,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    variant?: string;
    onClick?: () => void;
  }) => (
    <button disabled={disabled} data-variant={variant} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/item", () => ({
  ItemActions: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-slot="item-actions" {...props}>
      {children}
    </div>
  ),
  ItemMedia: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-slot="item-media" {...props}>
      {children}
    </div>
  ),
  ItemTitle: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-slot="item-title" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/task-icon", () => ({
  TaskIcon: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-slot="task-icon" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/task-item", () => ({
  TaskItem: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div data-slot="task-item" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <div data-testid="spinner">Loading...</div>,
}));

vi.mock("@/components/screen-reader", () => ({
  ScreenReader: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div aria-atomic="true" data-testid="screen-reader" {...props}>
      {children}
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  CheckIcon: () => <div data-testid="check-icon">Check</div>,
  XIcon: () => <div data-testid="x-icon">X</div>,
}));

describe("TasksActions", () => {
  it("should render nothing when no tasks are visible", () => {
    const { container } = render(
      <TasksActions visibleActiveIDs={[]} visibleCompletedIDs={[]} />,
    );

    expect(container.querySelector('[data-testid="check-icon"]')).toBeNull();
    expect(container.querySelector('[data-testid="x-icon"]')).toBeNull();
    expect(container.querySelector('[data-testid="spinner"]')).toBeNull();
  });

  it("should render complete all button when there are active tasks", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1", "task2"] as any}
        visibleCompletedIDs={[]}
      />,
    );

    expect(screen.getByTestId("check-icon")).toBeDefined();
    expect(screen.getByText(/Complete all tasks \(2\)/)).toBeDefined();
    expect(screen.queryByTestId("x-icon")).toBeNull();
  });

  it("should render remove completed button when there are completed tasks", () => {
    render(
      <TasksActions
        visibleActiveIDs={[]}
        visibleCompletedIDs={["task1", "task2", "task3"] as any}
      />,
    );

    expect(screen.getByTestId("x-icon")).toBeDefined();
    expect(screen.getByText(/Remove completed tasks \(3\)/)).toBeDefined();
    expect(screen.queryByTestId("check-icon")).toBeNull();
  });

  it("should render both buttons when there are both active and completed tasks", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1"] as any}
        visibleCompletedIDs={["task2"] as any}
      />,
    );

    expect(screen.getByTestId("check-icon")).toBeDefined();
    expect(screen.getByTestId("x-icon")).toBeDefined();
    expect(screen.getByText(/Complete all tasks \(1\)/)).toBeDefined();
    expect(screen.getByText(/Remove completed tasks \(1\)/)).toBeDefined();
  });

  it("should disable buttons when loading via prop", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1"] as any}
        visibleCompletedIDs={["task2"] as any}
        isLoading={true}
      />,
    );

    const completeButton = screen.getByText(/Complete all tasks/);
    const removeButton = screen.getByText(/Remove completed tasks/);

    expect(completeButton.hasAttribute("disabled")).toBe(true);
    expect(removeButton.hasAttribute("disabled")).toBe(true);
  });

  it("should show spinner when loading via prop", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1"] as any}
        visibleCompletedIDs={["task2"] as any}
        isLoading={true}
      />,
    );

    expect(screen.getByTestId("spinner")).toBeDefined();
  });

  it("should not show spinner when not loading", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1"] as any}
        visibleCompletedIDs={["task2"] as any}
      />,
    );

    expect(screen.queryByTestId("spinner")).toBeNull();
  });

  it("should render screen reader element", () => {
    render(
      <TasksActions
        visibleActiveIDs={["task1"] as any}
        visibleCompletedIDs={["task2"] as any}
        isLoading={true}
      />,
    );

    // Check that the screen reader element exists
    const screenReader = screen.getByTestId("screen-reader");
    expect(screenReader).toBeDefined();
    expect(screenReader.hasAttribute("aria-atomic")).toBe(true);
  });
});

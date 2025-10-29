import { Provider } from "react-redux";

import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { App } from "./app";
import { store } from "./store/store";
import { userStateSlice } from "./store/user-state-slice";

vi.mock("./components/task-list", () => ({
  TaskList: () => <div data-testid="task-list">Mocked TaskList</div>,
}));

vi.mock("./components/add-task-button", () => ({
  AddTaskButton: () => <button data-testid="add-task-button">Add Task</button>,
}));

afterEach(() => {
  act(() => {
    store.dispatch(userStateSlice.actions.clearNewTask());
  });
});

describe("App", () => {
  it("should render successfully", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    expect(screen.getByText("My Tasks")).toBeDefined();
    expect(screen.getByTestId("task-list")).toBeDefined();
  });

  it("should have proper semantic structure", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );
    const mainElement = screen.getByRole("main");
    expect(mainElement).toBeDefined();
    expect(mainElement.getAttribute("id")).toBe("main");

    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute("href")).toBe("#main");

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("My Tasks");
  });

  it("should show AddTaskButton when newTaskText is not a string", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    const addButton = screen.getByTestId("add-task-button");
    expect(addButton).toBeDefined();
  });

  it("should hide AddTaskButton when newTaskText is a string", () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>,
    );

    act(() => {
      store.dispatch(userStateSlice.actions.editNewTask("some text"));
    });

    const addButton = screen.queryByTestId("add-task-button");
    expect(addButton).toBeNull();
  });
});

import { Provider } from "react-redux";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { store } from "@/store/store";
import { userStateSlice } from "@/store/user-state-slice";

import { AddTaskButton } from "./add-task-button";

afterEach(() => {
  store.dispatch(userStateSlice.actions.clearNewTask());
});

describe("AddTaskButton", () => {
  it("should render button", () => {
    render(
      <Provider store={store}>
        <AddTaskButton />
      </Provider>,
    );

    const button = screen.getByRole("button", { name: /add new task/i });
    expect(button).toBeDefined();
  });

  it("should dispatch editNewTask with empty string when clicked", async () => {
    const user = userEvent.setup();

    render(
      <Provider store={store}>
        <AddTaskButton />
      </Provider>,
    );

    const button = screen.getByRole("button", { name: /add new task/i });
    await user.click(button);

    await waitFor(() => {
      const state = store.getState();
      expect(state.userState.newTaskText).toBe("");
    });
  });

  it("should render PlusIcon", () => {
    render(
      <Provider store={store}>
        <AddTaskButton />
      </Provider>,
    );

    const icon = document.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeDefined();
  });
});

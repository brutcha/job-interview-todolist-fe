import { Provider } from "react-redux";

import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { Filter } from "@/schemas/model";
import { userStateSlice } from "@/store/user-state-slice";

import { TasksFilter } from "./task-filter";

const createTestStore = (initialFilter: Filter = "all") => {
  return configureStore({
    reducer: {
      userState: userStateSlice.reducer,
    },
    preloadedState: {
      userState: {
        filter: initialFilter,
        editingTaskID: null,
        editingTaskText: null,
        newTaskText: null,
      },
    },
  });
};

describe("TasksFilter", () => {
  it("should render all filter options", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <TasksFilter />
      </Provider>,
    );

    expect(screen.getByRole("radio", { name: "All" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Active" })).toBeDefined();
    expect(screen.getByRole("radio", { name: "Completed" })).toBeDefined();
  });

  it("should have 'all' selected by default", () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <TasksFilter />
      </Provider>,
    );

    expect(
      screen.getByRole("radio", { name: "All" }).getAttribute("data-state"),
    ).toBe("on");
  });

  it("should dispatch setFilter action when filter is changed to active", async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    render(
      <Provider store={store}>
        <TasksFilter />
      </Provider>,
    );

    await user.click(screen.getByRole("radio", { name: "Active" }));

    expect(store.getState().userState.filter).toBe("active");
  });

  it("should dispatch setFilter action when filter is changed to completed", async () => {
    const user = userEvent.setup();
    const store = createTestStore();

    render(
      <Provider store={store}>
        <TasksFilter />
      </Provider>,
    );

    await user.click(screen.getByRole("radio", { name: "Completed" }));

    expect(store.getState().userState.filter).toBe("completed");
  });

  it("should reflect the current filter state", () => {
    const store = createTestStore("active");

    render(
      <Provider store={store}>
        <TasksFilter />
      </Provider>,
    );

    expect(
      screen.getByRole("radio", { name: "Active" }).getAttribute("data-state"),
    ).toBe("on");
    expect(
      screen.getByRole("radio", { name: "All" }).getAttribute("data-state"),
    ).toBe("off");
  });
});

import { Provider } from "react-redux";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "./app";
import { store } from "./store/store";

vi.mock("./components/task-list", () => ({
  TaskList: () => <div data-testid="task-list">Mocked TaskList</div>,
}));

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
});

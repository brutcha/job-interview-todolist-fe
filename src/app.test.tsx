import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./app";

describe("App", () => {
  it("should render successfully", () => {
    render(<App />);
    expect(screen.getByText("Vite + React")).toBeDefined();
  });
});

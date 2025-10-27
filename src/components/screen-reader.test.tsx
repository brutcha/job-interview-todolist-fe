import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScreenReader } from "./screen-reader";

describe("ScreenReader", () => {
  it("renders children correctly", () => {
    render(<ScreenReader>Test content</ScreenReader>);
    expect(screen.getByText("Test content")).toBeDefined();
  });

  it("applies default aria-live attribute", () => {
    render(<ScreenReader>Test content</ScreenReader>);
    const element = screen.getByText("Test content");
    expect(element.getAttribute("aria-live")).toBe("polite");
  });

  it("applies className and aria-hidden correctly", () => {
    render(<ScreenReader>Test content</ScreenReader>);
    const element = screen.getByText("Test content");
    expect(element.className).toContain("hidden");
    expect(element.getAttribute("aria-hidden")).toBe("false");
  });
});

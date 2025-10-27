import { describe, expect, it } from "vitest";

import { isDev } from "./is-dev";

describe("isDev", () => {
  it("should return a boolean", () => {
    const result = isDev();
    expect(typeof result).toBe("boolean");
  });

  it("should reflect the value of import.meta.env.DEV", () => {
    const result = isDev();
    expect(result).toBe(import.meta.env.DEV);
  });
});

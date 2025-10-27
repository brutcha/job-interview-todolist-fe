import { describe, expect, it } from "vitest";

import { getErrorMessage, isRetryableError } from "./error-helpers";

describe("isRetryableError", () => {
  it("should return true for FETCH_ERROR", () => {
    const error = { status: "FETCH_ERROR" as const, error: "Network error" };
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for TIMEOUT_ERROR", () => {
    const error = { status: "TIMEOUT_ERROR" as const, error: "Timeout" };
    expect(isRetryableError(error)).toBe(true);
  });

  it("should return true for 5xx errors", () => {
    const error = { status: 500, data: undefined };
    expect(isRetryableError(error)).toBe(true);

    const error503 = { status: 503, data: undefined };
    expect(isRetryableError(error503)).toBe(true);
  });

  it("should return false for 4xx errors", () => {
    const error = { status: 400, data: undefined };
    expect(isRetryableError(error)).toBe(false);

    const error404 = { status: 404, data: undefined };
    expect(isRetryableError(error404)).toBe(false);
  });

  it("should return false for SerializedError", () => {
    const error = { message: "Error", name: "Error", stack: "" };
    expect(isRetryableError(error)).toBe(false);
  });
});

describe("getErrorMessage", () => {
  it("should return network error message for FETCH_ERROR", () => {
    const error = { status: "FETCH_ERROR" as const, error: "Network error" };
    expect(getErrorMessage(error)).toBe(
      "Unable to connect to server. Please check your internet connection.",
    );
  });

  it("should return timeout message for TIMEOUT_ERROR", () => {
    const error = { status: "TIMEOUT_ERROR" as const, error: "Timeout" };
    expect(getErrorMessage(error)).toBe("Request timed out. Please try again.");
  });

  it("should return server error message for 5xx", () => {
    const error = { status: 500, data: undefined };
    expect(getErrorMessage(error)).toBe(
      "Server error. Please try again later.",
    );
  });

  it("should return custom message from error data", () => {
    const error = {
      status: 400,
      data: { message: "Custom error message" },
    };
    expect(getErrorMessage(error)).toBe("Custom error message");
  });

  it("should return generic message for unknown errors", () => {
    const error = { name: "Error", message: "", stack: "" };
    expect(getErrorMessage(error)).toBe("An unexpected error occurred.");
  });
});

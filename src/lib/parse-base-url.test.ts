import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { parseBaseURL } from "./parse-base-url";

describe("parseBaseURL", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("should return a string", () => {
    const result = parseBaseURL();
    expect(typeof result).toBe("string");
  });

  it("should return a valid URL format", () => {
    const result = parseBaseURL();
    expect(result).toMatch(/^https?:\/\/.+/);
  });

  it("should return fallback URL when env var is invalid", () => {
    vi.stubEnv("VITE_API_BASE_URL", "invalid-url");
    const result = parseBaseURL();
    expect(result).toBe("http://localhost:8080");
  });

  it("should return fallback URL when env var is undefined", () => {
    vi.stubEnv("VITE_API_BASE_URL", undefined);
    const result = parseBaseURL();
    expect(result).toBe("http://localhost:8080");
  });

  it("should return valid URL when env var is correct http", () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://example.com");
    const result = parseBaseURL();
    expect(result).toBe("http://example.com");
  });

  it("should return valid URL when env var is correct https", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.com");
    const result = parseBaseURL();
    expect(result).toBe("https://api.example.com");
  });

  it("should log error when URL is invalid", () => {
    vi.stubEnv("VITE_API_BASE_URL", "not-a-url");
    parseBaseURL();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to parse BaseURL, please check your `.env` file.",
    );
  });

  it("should return the same value on multiple calls with same env", () => {
    const firstCall = parseBaseURL();
    const secondCall = parseBaseURL();
    expect(firstCall).toBe(secondCall);
  });
});

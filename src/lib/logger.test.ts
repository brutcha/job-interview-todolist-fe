import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe("in development mode", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", true);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should call console.error in dev mode", async () => {
      const { logger } = await import("./logger");
      logger.error("error message", { data: "test" });

      expect(console.error).toHaveBeenCalledWith(
        "error message",
        expect.objectContaining({ data: "test" }),
      );
    });

    it("should call console.warn in dev mode", async () => {
      const { logger } = await import("./logger");
      logger.warn("warn message", 123);

      expect(console.warn).toHaveBeenCalledWith("warn message", 123);
    });

    it("should call console.info in dev mode", async () => {
      const { logger } = await import("./logger");
      logger.info("info message");

      expect(console.info).toHaveBeenCalledWith("info message");
    });

    it("should call console.debug in dev mode", async () => {
      const { logger } = await import("./logger");
      logger.debug("debug message", true, null);

      expect(console.debug).toHaveBeenCalledWith("debug message", true, null);
    });

    it("should handle multiple arguments", async () => {
      const { logger } = await import("./logger");
      const args = ["test", 1, true, { key: "value" }, null, undefined];
      logger.error(...args);

      expect(console.error).toHaveBeenCalledWith(...args);
    });

    it("should handle no arguments", async () => {
      const { logger } = await import("./logger");
      logger.error();
      logger.warn();
      logger.info();
      logger.debug();

      expect(console.error).toHaveBeenCalledWith();
      expect(console.warn).toHaveBeenCalledWith();
      expect(console.info).toHaveBeenCalledWith();
      expect(console.debug).toHaveBeenCalledWith();
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      vi.stubEnv("DEV", false);
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it("should NOT call console.error in production", async () => {
      const { logger } = await import("./logger");
      logger.error("error message");

      expect(console.error).not.toHaveBeenCalled();
    });

    it("should NOT call console.warn in production", async () => {
      const { logger } = await import("./logger");
      logger.warn("warn message");

      expect(console.warn).not.toHaveBeenCalled();
    });

    it("should NOT call console.info in production", async () => {
      const { logger } = await import("./logger");
      logger.info("info message");

      expect(console.info).not.toHaveBeenCalled();
    });

    it("should NOT call console.debug in production", async () => {
      const { logger } = await import("./logger");
      logger.debug("debug message");

      expect(console.debug).not.toHaveBeenCalled();
    });

    it("should NOT log even with multiple arguments", async () => {
      const { logger } = await import("./logger");
      logger.error("error", { data: "test" }, 123);
      logger.warn("warn", true);
      logger.info("info", null);
      logger.debug("debug", undefined);

      expect(console.error).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.debug).not.toHaveBeenCalled();
    });
  });
});

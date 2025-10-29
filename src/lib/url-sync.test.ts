import { beforeEach, describe, expect, it, vi } from "vitest";

import { createURLHelpers } from "./url-sync";

describe("createURLHelpers", () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        href: "http://localhost:3000",
        search: "",
      },
      writable: true,
      configurable: true,
    });

    window.history.replaceState = vi.fn();
  });

  describe("getCurrentUrl", () => {
    it("should return current window location href", () => {
      const helpers = createURLHelpers();
      expect(helpers.getCurrentUrl()).toBe("http://localhost:3000");
    });

    it("should return updated URL after navigation", () => {
      const helpers = createURLHelpers();
      window.location.href = "http://localhost:3000/test";
      expect(helpers.getCurrentUrl()).toBe("http://localhost:3000/test");
    });
  });

  describe("getSearchParam", () => {
    it("should return search param value", () => {
      window.location.search = "?filter=active";
      const helpers = createURLHelpers();
      expect(helpers.getSearchParam("filter")).toBe("active");
    });

    it("should return null if param does not exist", () => {
      window.location.search = "";
      const helpers = createURLHelpers();
      expect(helpers.getSearchParam("filter")).toBe(null);
    });

    it("should return correct value for multiple params", () => {
      window.location.search = "?filter=active&page=2";
      const helpers = createURLHelpers();
      expect(helpers.getSearchParam("filter")).toBe("active");
      expect(helpers.getSearchParam("page")).toBe("2");
    });
  });

  describe("setSearchParam", () => {
    it("should set search param and return new URL", () => {
      const helpers = createURLHelpers();
      const newUrl = helpers.setSearchParam("filter", "active");

      expect(newUrl.searchParams.get("filter")).toBe("active");
      expect(newUrl.href).toBe("http://localhost:3000/?filter=active");
    });

    it("should update existing param", () => {
      window.location.href = "http://localhost:3000?filter=all";
      const helpers = createURLHelpers();
      const newUrl = helpers.setSearchParam("filter", "active");

      expect(newUrl.searchParams.get("filter")).toBe("active");
    });

    it("should preserve other search params", () => {
      window.location.href = "http://localhost:3000?page=2&sort=asc";
      const helpers = createURLHelpers();
      const newUrl = helpers.setSearchParam("filter", "active");

      expect(newUrl.searchParams.get("filter")).toBe("active");
      expect(newUrl.searchParams.get("page")).toBe("2");
      expect(newUrl.searchParams.get("sort")).toBe("asc");
    });
  });

  describe("replaceState", () => {
    it("should call window.history.replaceState", () => {
      const helpers = createURLHelpers();
      const newUrl = new URL("http://localhost:3000?filter=active");

      helpers.replaceState(newUrl);

      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        "",
        newUrl,
      );
    });

    it("should update URL without page reload", () => {
      const helpers = createURLHelpers();
      const newUrl = new URL("http://localhost:3000?filter=completed");

      helpers.replaceState(newUrl);

      expect(window.history.replaceState).toHaveBeenCalledOnce();
    });
  });
});

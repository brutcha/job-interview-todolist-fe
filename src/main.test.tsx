import { afterEach, describe, expect, it, vi } from "vitest";

const mockCreateRoot = vi.fn();
const mockRender = vi.fn();

vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot.mockReturnValue({ render: mockRender }),
}));

vi.mock("./app", () => ({
  App: () => null,
}));

vi.mock("@/store/store", () => ({
  store: {},
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => null,
}));

vi.mock("immer", () => ({
  enableMapSet: vi.fn(),
}));

describe("main.tsx", () => {
  afterEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = "";
  });

  it("should call createRoot with the root element", async () => {
    const mockedRootEl = document.createElement("div");
    mockedRootEl.id = "root";
    document.body.appendChild(mockedRootEl);

    document.getElementById = vi.fn().mockReturnValue(mockedRootEl);

    await import("./main");

    expect(document.getElementById).toHaveBeenCalledWith("root");
    expect(mockCreateRoot).toHaveBeenCalledWith(mockedRootEl);
  });

  it("should not render if root element is not found", async () => {
    document.getElementById = vi.fn().mockReturnValue(null);

    mockCreateRoot.mockClear();
    mockRender.mockClear();

    await import("./main");

    expect(mockCreateRoot).not.toHaveBeenCalled();
    expect(mockRender).not.toHaveBeenCalled();
  });
});

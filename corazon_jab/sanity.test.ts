import { describe, expect, it } from "vitest";

describe("sanity", () => {
  it("runs basic assertions", () => {
    expect(1 + 1).toBe(2);
  });

  it("has access to a jsdom environment", () => {
    expect(typeof document).toBe("object");
    expect(document.createElement("div")).toBeInstanceOf(HTMLElement);
  });
});

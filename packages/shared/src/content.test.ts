import { describe, expect, it } from "vitest";

import { classifyContent } from "./content";

describe("classifyContent", () => {
  it.each(["+998 90 123 45 67", "+1 (555) 010-9999", "+447700900123"])("phone %s", (input) => {
    expect(classifyContent(input).kind).toBe("phone");
  });

  it.each(["2024-01-01", "123456789", "12:30", "+12"])("not a phone: %s", (input) => {
    expect(classifyContent(input).kind).not.toBe("phone");
  });

  it("promotes bare domains to https", () => {
    expect(classifyContent("kyuar.app").value).toBe("https://kyuar.app");
  });

  it("keeps unsafe protocols as text", () => {
    expect(classifyContent("javascript:alert(1)").kind).toBe("text");
  });
});

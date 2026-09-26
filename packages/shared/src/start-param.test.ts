import { describe, expect, it } from "vitest";

import { decodeStartParam, encodeStartParam, MAX_START_PARAM_LENGTH } from "./start-param";

describe("start param", () => {
  it("round-trips UTF-8 text", () => {
    const text = "https://kyuar.app/?q=Salom дунё 👋";
    const encoded = encodeStartParam(text);

    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeStartParam(encoded)).toBe(text);
  });

  it("returns undefined when the encoded text is too long", () => {
    expect(encodeStartParam("a".repeat(MAX_START_PARAM_LENGTH))).toBeUndefined();
  });

  it("rejects characters outside base64url", () => {
    expect(decodeStartParam("abc+/=")).toBeUndefined();
    expect(decodeStartParam("")).toBeUndefined();
  });

  it("rejects bytes that are not valid UTF-8", () => {
    expect(decodeStartParam("_w")).toBeUndefined();
  });
});

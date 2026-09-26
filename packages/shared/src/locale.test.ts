import { describe, expect, it } from "vitest";

import { resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it.each([
    ["uz", "uz"],
    ["ru-RU", "ru"],
    ["en-US,en;q=0.9", "en"],
    ["de-DE,ru;q=0.8", "ru"],
    ["fr", "en"],
    [undefined, "en"],
  ])("%s -> %s", (input, expected) => {
    expect(resolveLocale(input)).toBe(expected);
  });
});

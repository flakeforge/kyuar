import { describe, expect, it } from "vitest";

import { contrastRatio, MIN_SCAN_CONTRAST } from "./lib/contrast";
import { DEFAULT_BACKGROUND, DEFAULT_FOREGROUND } from "./style";
import { DEFAULT_THEME, THEMES } from "./themes";

describe("themes", () => {
  it.each(THEMES.map((theme) => [theme.id, theme] as const))("%s scans", (_, theme) => {
    expect(contrastRatio(theme.foreground, theme.background)).toBeGreaterThanOrEqual(
      MIN_SCAN_CONTRAST,
    );
  });

  it("default style uses the default theme", () => {
    expect(DEFAULT_FOREGROUND).toBe(DEFAULT_THEME.foreground);
    expect(DEFAULT_BACKGROUND).toBe(DEFAULT_THEME.background);
  });
});

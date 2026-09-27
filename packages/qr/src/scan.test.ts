import { Resvg } from "@resvg/resvg-js";
import { describe, expect, it } from "vitest";

import { renderQr } from "./render";
import { decodeImage } from "./scan";
import { DEFAULT_STYLE } from "./style";

function raster(data: string, width: number) {
  const { svg } = renderQr({ data, style: DEFAULT_STYLE, moduleSize: 8 });
  const image = new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: false },
  }).render();
  return { width: image.width, height: image.height, data: image.pixels };
}

describe("decodeImage", () => {
  it("reads a styled code", () => {
    expect(decodeImage(raster("https://kyuar.app/scan", 400))).toBe("https://kyuar.app/scan");
  });

  it("reads a large image", () => {
    expect(decodeImage(raster("WIFI:T:WPA;S:kyuar;P:secret;;", 2600))).toBe(
      "WIFI:T:WPA;S:kyuar;P:secret;;",
    );
  });

  it("returns undefined for an image without a code", () => {
    expect(
      decodeImage({ width: 64, height: 64, data: new Uint8Array(64 * 64 * 4).fill(255) }),
    ).toBeUndefined();
  });
});

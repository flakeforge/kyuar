import { Resvg } from "@resvg/resvg-js";
import { decodeQR } from "qr/decode.js";
import { describe, expect, it } from "vitest";

import { DOT_FIGURES, FINDER_INNER_FIGURES, FINDER_OUTER_FIGURES } from "./figures";
import type { DotShape, FinderInnerShape, FinderOuterShape } from "./figures";
import type { GrayImage } from "./halftone";
import { renderQr } from "./render";
import { DEFAULT_STYLE, withColors, type QrStyle } from "./style";

const DATA = "https://kyuar.app/?q=Salom дунё";
const INK = withColors(DEFAULT_STYLE, "#111111", "#ffffff");

function decode(svg: string) {
  const image = new Resvg(svg, {
    fitTo: { mode: "width", value: 480 },
    font: { loadSystemFonts: false },
  }).render();
  return decodeQR({ width: image.width, height: image.height, data: image.pixels });
}

function styled(patch: Partial<QrStyle>): QrStyle {
  return { ...INK, ...patch };
}

function gradientImage(size: number): GrayImage {
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) data[y * size + x] = Math.round(((x + y) / (2 * size)) * 255);
  }
  return { width: size, height: size, data };
}

describe("renderQr scans", () => {
  it.each(Object.keys(DOT_FIGURES) as DotShape[])("data shape %s", (shape) => {
    const style = styled({ ecc: "H", data: { ...INK.data, shape } });
    expect(decode(renderQr({ data: DATA, style, moduleSize: 8 }).svg)).toBe(DATA);
  });

  it.each(Object.keys(FINDER_OUTER_FIGURES) as FinderOuterShape[])("finder ring %s", (shape) => {
    const style = styled({ finderOuter: { ...INK.finderOuter, shape } });
    expect(decode(renderQr({ data: DATA, style, moduleSize: 8 }).svg)).toBe(DATA);
  });

  it.each(Object.keys(FINDER_INNER_FIGURES) as FinderInnerShape[])("finder eye %s", (shape) => {
    const style = styled({ finderInner: { ...INK.finderInner, shape } });
    expect(decode(renderQr({ data: DATA, style, moduleSize: 8 }).svg)).toBe(DATA);
  });

  it("gradients on every layer", () => {
    const gradient = {
      type: "linear" as const,
      angle: 45,
      stops: [
        { offset: 0, color: "#1b1464" },
        { offset: 1, color: "#6a0d3a" },
      ],
    };
    const style = styled({
      data: { ...INK.data, paint: gradient },
      finderOuter: { ...INK.finderOuter, paint: { type: "radial", stops: gradient.stops } },
    });
    const rendered = renderQr({ data: DATA, style, moduleSize: 8 });

    expect(rendered.svg).toContain("linearGradient");
    expect(rendered.svg).toContain("radialGradient");
    expect(decode(rendered.svg)).toBe(DATA);
  });

  it("alignment drawn as small finders", () => {
    const style = styled({ alignment: { ...INK.alignment, mode: "finder" } });
    expect(decode(renderQr({ data: DATA, style, moduleSize: 8 }).svg)).toBe(DATA);
  });

  it("logo area cleared with ECC H forced", () => {
    const style = styled({ ecc: "L", logo: { ratio: 0.25 } });
    const rendered = renderQr({ data: DATA, style, moduleSize: 8 });

    expect(rendered.ecc).toBe("H");
    expect(decode(rendered.svg)).toBe(DATA);
  });

  it("halftone with an image", () => {
    const rendered = renderQr({
      data: DATA,
      style: styled({ ecc: "H" }),
      moduleSize: 9,
      halftone: { image: gradientImage(120), centerRatio: 0.45 },
    });
    expect(decode(rendered.svg)).toBe(DATA);
  });

  it.each([0, 1, 4, 8])("margin %i", (margin) => {
    const rendered = renderQr({ data: DATA, style: styled({ margin }), moduleSize: 8 });
    expect(rendered.size).toBe((rendered.modules + margin * 2) * 8);
    if (margin > 0) expect(decode(rendered.svg)).toBe(DATA);
  });
});

describe("renderQr output", () => {
  it("warns when contrast is too low", () => {
    const style = withColors(DEFAULT_STYLE, "#777777", "#888888");
    expect(renderQr({ data: DATA, style }).warnings).toHaveLength(1);
  });

  it("ignores logo hrefs that are not base64 images", () => {
    const style = styled({ logo: { ratio: 0.2 } });
    const svg = renderQr({ data: DATA, style, logoHref: "https://evil.example/x.png" }).svg;
    expect(svg).not.toContain("<image");
  });

  it("is deterministic", () => {
    const style = styled({ data: { ...INK.data, shape: "random-dot" } });
    expect(renderQr({ data: DATA, style }).svg).toBe(renderQr({ data: DATA, style }).svg);
  });
});

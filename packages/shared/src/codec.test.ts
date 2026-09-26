import { DEFAULT_STYLE, withColors } from "@kyuar/qr";
import { describe, expect, it } from "vitest";

import { decodeQrQuery, encodeQrQuery } from "./codec";
import { qrRequestSchema } from "./schema";

function roundTrip(input: unknown) {
  const request = qrRequestSchema.parse(input);
  return { request, decoded: decodeQrQuery(new URLSearchParams(encodeQrQuery(request))) };
}

describe("QR query codec", () => {
  it("keeps a leading # in the data", () => {
    expect(roundTrip({ data: "#hashtag" }).decoded.data).toBe("#hashtag");
  });

  it("omits the style when it matches the defaults", () => {
    const request = qrRequestSchema.parse({ data: "x" });

    expect(new URLSearchParams(encodeQrQuery(request)).has("s")).toBe(false);
    expect(request.style).toEqual(DEFAULT_STYLE);
  });

  it("round-trips a fully custom style", () => {
    const style = {
      ...withColors(DEFAULT_STYLE, "#112233", "#fafafa"),
      ecc: "H" as const,
      margin: 6,
      data: {
        shape: "classy" as const,
        paint: {
          type: "linear" as const,
          angle: 45,
          stops: [
            { offset: 0, color: "#ff0000" },
            { offset: 1, color: "#0000ff" },
          ],
        },
      },
      logo: { ratio: 0.2 },
    };
    const { request, decoded } = roundTrip({
      data: "https://example.com/?a=1&b=два",
      format: "svg",
      style,
    });

    expect(decoded).toEqual(request);
  });

  it("rejects an unknown shape", () => {
    const params = new URLSearchParams({ d: "x", s: btoa('{"data":{"shape":"nope"}}') });

    expect(() => decodeQrQuery(params)).toThrow();
  });
});

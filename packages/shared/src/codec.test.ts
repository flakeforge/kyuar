import { describe, expect, it } from "vitest";

import { decodeQrQuery, encodeQrQuery } from "./codec";
import { qrRequestSchema } from "./schema";

describe("QR query codec", () => {
  it("keeps a leading # in the data", () => {
    const request = qrRequestSchema.parse({ data: "#hashtag" });
    const decoded = decodeQrQuery(new URLSearchParams(encodeQrQuery(request)));

    expect(decoded.data).toBe("#hashtag");
  });

  it("drops the # from colors and restores it on decode", () => {
    const request = qrRequestSchema.parse({ data: "x", foreground: "#112233" });
    const query = new URLSearchParams(encodeQrQuery(request));

    expect(query.get("fg")).toBe("112233");
    expect(decodeQrQuery(query).foreground).toBe("#112233");
  });

  it("round-trips every field", () => {
    const request = qrRequestSchema.parse({
      data: "https://example.com/?a=1&b=два",
      ecc: "H",
      margin: 6,
      logoRatio: 0.2,
      format: "svg",
    });

    expect(decodeQrQuery(new URLSearchParams(encodeQrQuery(request)))).toEqual(request);
  });
});

import { describe, expect, it } from "vitest";

import { checkLink } from "./link-safety";
import { parseScanned } from "./scanned";

describe("parseScanned", () => {
  it("reads links", () => {
    expect(parseScanned("https://kyuar.app/a?b=1")).toMatchObject({
      kind: "url",
      host: "kyuar.app",
    });
  });

  it("reads Wi-Fi with escaped characters", () => {
    expect(parseScanned(String.raw`WIFI:T:WPA;S:Home\;Net;P:pa\:ss;H:true;;`)).toMatchObject({
      kind: "wifi",
      ssid: "Home;Net",
      password: "pa:ss",
      security: "WPA",
      hidden: true,
    });
  });

  it("reads MECARD and vCard contacts", () => {
    expect(parseScanned("MECARD:N:Doe,Jane;TEL:+998901234567;EMAIL:j@d.uz;;")).toMatchObject({
      kind: "contact",
      name: "Jane Doe",
      phones: ["+998901234567"],
      emails: ["j@d.uz"],
    });
    const vcard =
      "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL;TYPE=CELL:+1555\nEMAIL:j@d.uz\nORG:Kyuar;Dev\nEND:VCARD";
    expect(parseScanned(vcard)).toMatchObject({
      kind: "contact",
      name: "Jane Doe",
      phones: ["+1555"],
      organization: "Kyuar",
    });
  });

  it("reads mail, phone, sms and geo", () => {
    expect(parseScanned("mailto:a@b.uz?subject=Hi")).toMatchObject({
      kind: "email",
      address: "a@b.uz",
      subject: "Hi",
    });
    expect(parseScanned("MATMSG:TO:a@b.uz;SUB:Hi;BODY:Yo;;")).toMatchObject({
      kind: "email",
      address: "a@b.uz",
    });
    expect(parseScanned("tel:+998901234567")).toMatchObject({
      kind: "phone",
      number: "+998901234567",
    });
    expect(parseScanned("SMSTO:+1555:hello")).toMatchObject({
      kind: "sms",
      number: "+1555",
      body: "hello",
    });
    expect(parseScanned("geo:41.3111,69.2797")).toMatchObject({
      kind: "geo",
      latitude: 41.3111,
      longitude: 69.2797,
    });
  });

  it("keeps everything else as text", () => {
    expect(parseScanned("javascript:alert(1)")).toMatchObject({ kind: "text" });
    expect(parseScanned("Salom dunyo")).toMatchObject({ kind: "text", text: "Salom dunyo" });
  });
});

describe("checkLink", () => {
  it("passes a normal https link", () => {
    expect(checkLink("https://kyuar.app/x")).toEqual([]);
  });

  it.each([
    ["http://example.com", "insecure"],
    ["https://bit.ly/abc", "shortener"],
    ["https://xn--pple-43d.com", "lookalike"],
    ["https://аpple.com", "lookalike"],
    ["https://192.168.0.1/login", "ip-address"],
    ["https://user:pass@example.com", "credentials"],
    ["javascript:alert(1)", "unsafe-scheme"],
  ] as const)("%s is flagged %s", (href, warning) => {
    expect(checkLink(href)).toContain(warning);
  });
});

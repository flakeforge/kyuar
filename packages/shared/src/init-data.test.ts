import { sign } from "@tma.js/init-data-node";
import { describe, expect, it } from "vitest";

import { InitDataError, verifyInitData } from "./init-data";

const TOKEN = "123456:TEST-TOKEN";
const user = { id: 42, first_name: "Ada", language_code: "uz" };

function signed(authDate = new Date(), extra: Record<string, string> = {}) {
  return sign({ user, signature: "ed25519-signature", ...extra }, TOKEN, authDate);
}

describe("verifyInitData", () => {
  it("accepts initData that carries a signature field", () => {
    const result = verifyInitData(signed(), TOKEN);

    expect(result.user.id).toBe(42);
    expect(result.user.language_code).toBe("uz");
  });

  it("rejects a tampered user", () => {
    const tampered = signed().replace("%22id%22%3A42", "%22id%22%3A43");

    expect(() => verifyInitData(tampered, TOKEN)).toThrow(InitDataError);
  });

  it("rejects the wrong token", () => {
    expect(() => verifyInitData(signed(), "999:OTHER")).toThrow(InitDataError);
  });

  it("rejects expired initData", () => {
    const old = new Date(Date.now() - 2 * 3600 * 1000);

    expect(() => verifyInitData(signed(old), TOKEN)).toThrow(InitDataError);
  });

  it("rejects an auth_date in the future", () => {
    const future = new Date(Date.now() + 10 * 60 * 1000);

    expect(() => verifyInitData(signed(future), TOKEN)).toThrow(/future/);
  });

  it("rejects repeated fields", () => {
    const repeated = `${signed()}&user=${encodeURIComponent(JSON.stringify({ id: 1, first_name: "x" }))}`;

    expect(() => verifyInitData(repeated, TOKEN)).toThrow(/repeats/);
  });
});

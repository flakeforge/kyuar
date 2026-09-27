import { describe, expect, it } from "vitest";

import { startKeyboard } from "./commands";

describe("startKeyboard", () => {
  it("opens the Mini App directly in private chats", () => {
    const button = startKeyboard("private", "Open editor", "hi").inline_keyboard[0]?.[0];
    expect(button).toEqual({ text: "Open editor", web_app: { url: "https://kyuar.test?data=hi" } });
  });

  it.each(["group", "supergroup", "channel"] as const)("links with startapp in a %s", (type) => {
    const button = startKeyboard(type, "Open editor").inline_keyboard[0]?.[0];
    expect(button).toEqual({ text: "Open editor", url: "https://t.me/kyuarbot?startapp" });
  });
});

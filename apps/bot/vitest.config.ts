import { defineProject } from "vitest/config";

export default defineProject({
  test: {
    env: {
      BOT_TOKEN: "123456:test-token",
      BOT_WEBHOOK_SECRET: "test-webhook-secret",
      BOT_USERNAME: "kyuarbot",
      APP_URL: "https://kyuar.test",
    },
  },
});

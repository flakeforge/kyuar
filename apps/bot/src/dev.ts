import { getBot } from "./index";

const bot = getBot();

async function main() {
  const { url } = await bot.api.getWebhookInfo();
  if (url && !process.argv.includes("--force")) {
    console.error(`This bot has a webhook at ${url}.`);
    console.error("Polling would remove it. Use a separate dev bot, or pass --force.");
    process.exit(1);
  }

  await bot.api.deleteWebhook({ drop_pending_updates: false });

  await bot.start({
    onStart: (info) => {
      console.info(`@${info.username} is polling for updates`);
    },
  });
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void bot.stop();
  });
}

main().catch((error: unknown) => {
  console.error("Failed to start the bot", error);
  process.exit(1);
});

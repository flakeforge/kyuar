import { getBot } from "./index";

const bot = getBot();

async function main() {
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

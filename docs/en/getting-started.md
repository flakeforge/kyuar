[← Contents](index.md) · [Oʻzbekcha](../uz/getting-started.md) · [Русский](../ru/getting-started.md)

# Getting started

- [Requirements](#requirements)
- [First run](#first-run)
- [Testing inside Telegram](#testing-inside-telegram)
- [Daily commands](#daily-commands)
- [Troubleshooting](#troubleshooting)

## Requirements

- Node.js 24 or newer
- pnpm 11 (the version is pinned in `package.json`)
- [just](https://just.systems)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) — Telegram only talks to HTTPS, so local testing needs a tunnel
- Docker with Compose — only for the production-like stack

## First run

1. Prepare the project:

   ```bash
   just setup
   ```

   This creates `.env` from `.env.example` (if it is missing) and links `apps/web/.env`, `apps/bot/.env` and `packages/env/.env` to the root file. Then it installs dependencies and the lefthook git hooks.

2. Create a development bot in [@BotFather](https://t.me/BotFather) and fill in `.env`:

   - `BOT_TOKEN` — the token from BotFather.
   - `BOT_WEBHOOK_SECRET` — at least 16 characters. Generate one:

     ```bash
     just secret
     ```

   - `BOT_USERNAME` — the bot username without `@`.
   - `APP_URL` — `http://localhost:3000` for now. It becomes the tunnel URL in the next section.

   Use a separate bot for development. Polling and a webhook cannot run at the same time, so polling a production bot takes it offline. For this reason `just bot` refuses to start while the bot has a webhook.

3. Start the web app and the bot together:

   ```bash
   just dev
   ```

   The web app runs on `http://localhost:3000`. The bot runs in long-polling mode and publishes its command menu.

## Testing inside Telegram

The Mini App, inline mode and the webhook need a public HTTPS address.

1. In a second terminal:

   ```bash
   just tunnel
   ```

   With `CLOUDFLARE_TUNNEL_TOKEN` empty this opens a quick tunnel with a temporary `trycloudflare.com` URL. With a token it runs your named tunnel.

2. Put the tunnel URL in `APP_URL` and restart `just dev`. `APP_URL` is read at runtime, so no rebuild is needed.

3. Next.js blocks development requests from unknown hosts. Add the tunnel host (without `https://`) to `allowedDevOrigins` in `apps/web/next.config.ts`.

4. Configure the bot in BotFather as described in [Telegram bot → BotFather setup](bot.md#botfather-setup).

To test the production webhook path instead of polling, stop `just dev`, run `just web`, then:

```bash
just webhook-set
```

## Daily commands

Run `just` to see every recipe grouped by purpose.

| Command                 | What it does                                                      |
| ----------------------- | ----------------------------------------------------------------- |
| `just dev` (`just d`)   | Web app and bot together                                          |
| `just web` / `just bot` | Only one of them                                                  |
| `just tunnel`           | HTTPS tunnel to `localhost:3000`                                  |
| `just fix` (`just f`)   | oxlint `--fix`, then oxfmt                                        |
| `just check` (`just c`) | Lint, format check, typecheck, react-doctor and knip, in parallel |
| `just test`             | Unit tests (vitest)                                               |
| `just ui-add <name>`    | Add a shadcn/ui component to `packages/ui`                        |
| `just webhook info`     | Webhook status (`set`, `delete` also work)                        |
| `just build`            | Production build of the web app                                   |

Before a commit, `just fix` and `just check` must pass. Commit messages follow Conventional Commits; commitlint checks them in a git hook, and pre-push runs `just check` and `just test`.

## Troubleshooting

- **The bot says environment variables are invalid.** `.env` is missing a value, or the file is not linked. Run `just env` and check the names against `.env.example`.
- **The bot does not start: "This bot has a webhook".** Another process owns the bot. Use a development bot, or run `just webhook-delete` if you really mean to take it over.
- **The Mini App opens a blank page in Telegram.** `APP_URL` must be the HTTPS tunnel URL, and BotFather must point the Main Mini App at the same address.
- **Buttons in groups do nothing.** Main Mini App is not enabled in BotFather, so `t.me/<bot>?startapp` links have nowhere to go.

Next: [Architecture](architecture.md)

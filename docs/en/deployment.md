[← Contents](index.md) · [Oʻzbekcha](../uz/deployment.md) · [Русский](../ru/deployment.md)

# Deployment

- [What runs in production](#what-runs-in-production)
- [Server requirements](#server-requirements)
- [First deployment](#first-deployment)
- [HTTPS](#https)
- [Redis](#redis)
- [Security](#security)
- [Updating](#updating)
- [Troubleshooting](#troubleshooting)

## What runs in production

`docker-compose.yml` starts two containers:

| Service | Image                                 | Role                                                                           |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| `web`   | `kyuar-web` (built from `Dockerfile`) | Next.js standalone server on port 3000: Mini App, `/api/*` and the bot webhook |
| `redis` | `redis:8-alpine`                      | Rate limits and rendered images. In memory only, 64 MB, LRU eviction           |

There is no separate bot container. Telegram sends updates to `APP_URL/api/bot`, and the web app handles them.

The image has no build arguments and no `NEXT_PUBLIC_*` variables. All configuration comes from `.env` at runtime, so one image runs in any environment and no secret ends up in an image layer.

## Server requirements

- Docker with Compose
- A public HTTPS address that forwards to port 3000

## First deployment

1. Copy the repository to the server and create `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in `.env`. The variables are listed in [Architecture → Configuration](architecture.md#configuration). In production:

   - `APP_URL` must start with `https://`. Validation fails otherwise.
   - `REDIS_URL` does not need to be set. Compose sets it to `redis://redis:6379`.
   - `BOT_WEBHOOK_SECRET`: generate one with `just secret`.

3. Build and start:

   ```bash
   just docker-build
   just docker-up
   ```

4. Check the health. The web container is healthy when `/api/qr?d=health` returns an image:

   ```bash
   docker compose ps
   just docker-logs web
   ```

5. Point Telegram at the server and publish the command menu. This runs from a machine with the repository and the same `.env`:

   ```bash
   just webhook-set
   just webhook-info
   ```

6. Configure BotFather as described in [Telegram bot → BotFather setup](bot.md#botfather-setup).

## HTTPS

Telegram only opens Mini Apps and sends webhooks over HTTPS. Two common setups:

- **Reverse proxy** (Caddy, nginx) on the server with a certificate, forwarding to `localhost:3000`.
- **Cloudflare Tunnel**: create a named tunnel in Cloudflare that points to `http://localhost:3000` and run `cloudflared` on the server. No open ports are needed.

Put a cache in front of `/api/qr`. The route sends `Cache-Control: public, max-age=31536000, immutable`, so a repeated code never reaches Node.

If the proxy sends the client IP in a header other than `X-Forwarded-For` (for example `CF-Connecting-IP`), set `CLIENT_IP_HEADER`. Otherwise every user shares one rate limit.

## Redis

| Key                          | Purpose                                                                  | Lifetime |
| ---------------------------- | ------------------------------------------------------------------------ | -------- |
| `rate:<scope>:<ip>:<window>` | Request count per client per minute                                      | 60 s     |
| `render:<id>:<format>`       | Rendered PNG, 2048 px PNG, JPEG and SVG of a code with a logo or picture | 600 s    |

Redis keeps nothing permanent, so it runs without persistence. Losing it loses nothing important.

Without Redis:

- Rate limits are off. Every request is allowed.
- In Telegram, sharing and downloading a code with a logo or picture fail with 503, because Telegram needs a URL to fetch the image from.

Plain codes still work through `/api/qr`.

## Security

- **initData.** `/api/share` and `/api/render` verify Telegram `initData` with the bot token and reject data older than one hour. User identity comes only from verified data.
- **Webhook.** `/api/bot` rejects requests without the correct `X-Telegram-Bot-Api-Secret-Token`.
- **Uploaded images.** sharp decodes and re-encodes every logo and picture, with a pixel limit, before it reaches an SVG.
- **Headers.** The app sends `X-Content-Type-Options: nosniff`, a strict referrer policy and `frame-ancestors` that only allows Telegram Web.
- **Container.** The web app runs as the unprivileged `nextjs` user.

## Updating

```bash
git pull
just docker-build
just docker-up
```

Compose replaces the web container. Redis keeps running. Run `just webhook-set` again only when `APP_URL` or the bot commands change.

## Troubleshooting

| Symptom                       | Check                                                                                          |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| The container restarts        | `just docker-logs web`. Usually a missing or invalid variable in `.env`                        |
| The bot is silent             | `just webhook-info`: the URL must be `APP_URL/api/bot`, and `last_error_message` must be empty |
| Inline results have no images | `/api/qr` must be reachable from the internet over HTTPS                                       |
| Share fails with 503          | Redis is not reachable                                                                         |
| Everyone hits 429             | `CLIENT_IP_HEADER` does not match the proxy                                                    |

Next: [User guide](user-guide.md)

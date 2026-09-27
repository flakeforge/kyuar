[← Contents](index.md) · [Oʻzbekcha](../uz/architecture.md) · [Русский](../ru/architecture.md)

# Architecture

- [Repository map](#repository-map)
- [Tech stack](#tech-stack)
- [Request flow](#request-flow)
- [Rules that are easy to get wrong](#rules-that-are-easy-to-get-wrong)
- [Configuration](#configuration)
- [Where new code goes](#where-new-code-goes)

## Repository map

A pnpm workspace monorepo. Every task has a `just` recipe.

| Path                  | What                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| `apps/web`            | Next.js 16 app: the Mini App, `/api/qr`, `/api/render`, `/api/share`, `/api/bot` (webhook)                     |
| `apps/bot`            | grammY handlers, bot copy, the development poller and the webhook script                                       |
| `packages/qr`         | Styled SVG renderer: shapes, paints, halftone, logo area, palette formula, image decoding (`@kyuar/qr/scan`)   |
| `packages/qr-encoder` | QR encoder vendored from paulmillr/qr, extended with a kind for every module                                   |
| `packages/shared`     | zod schemas, the `/api/qr` codec, initData checks, scanned-content parser, link safety, locales, color formats |
| `packages/ui`         | shadcn/ui components on Base UI and the design tokens                                                          |
| `packages/env`        | envin schema, the single source of truth for configuration                                                     |
| `brand/`              | Logo, icons and Lottie animations                                                                              |
| `docs/`               | These documents                                                                                                |

## Tech stack

- **Runtime**: Node.js 24, TypeScript 5.9, pnpm 11.
- **Web**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4.
- **UI**: shadcn/ui on Base UI, lucide icons, `@tma.js/sdk-react` for Telegram.
- **Bot**: grammY 1.46, Bot API 10.
- **Images**: resvg for SVG → PNG, sharp for JPEG, logos and photos.
- **Storage**: Redis for rate limits and short-lived rendered images. No database.
- **Quality**: oxlint, oxfmt, react-doctor, knip, vitest, lefthook, commitlint.

## Request flow

```text
Telegram client ─┬─ inline query / message ─→ /api/bot (webhook) ─→ grammY handlers
                 │                                                  └─ photo_url → /api/qr
                 └─ Mini App ─→ page.tsx ─→ editor (renders in a Web Worker)
                                         ├─ POST /api/share  → savePreparedInlineMessage
                                         └─ POST /api/render → Redis (10 min) → downloadFile
```

- **Inline mode and private chats.** The bot answers with photo URLs that point to `/api/qr`. The URL carries the data, the format and only the style sections that differ from the defaults, as base64url JSON, so identical codes share one cacheable URL.
- **The editor.** Renders the preview in a Web Worker, so dragging a color never blocks the page. A second worker decodes photos for the scanner and runs the scan check.
- **Codes with a logo or a halftone picture.** They cannot be described by a URL. `/api/render` re-encodes the images with sharp, renders, and keeps the PNG, 2048 px PNG, JPEG and SVG in Redis for ten minutes. Telegram downloads and shares them from `/api/render/<id>`.
- **Sharing.** `shareMessage()` needs a message prepared by the bot, so the Mini App asks `/api/share`, which verifies `initData` and calls `savePreparedInlineMessage`.

## Rules that are easy to get wrong

The full list is in [AGENTS.md](../../AGENTS.md). The most important ones:

- Never trust `initData` from the client. Every request that acts for a user verifies it on the server with `@tma.js/init-data-node`.
- There are no `NEXT_PUBLIC_*` variables. `APP_URL` and `BOT_USERNAME` are read at runtime, so one Docker image runs anywhere.
- `web_app` buttons only work in private chats. Anything that can land in a group links to `t.me/<bot>?startapp=<base64url>`.
- Inline photos must be JPEG. The bot links to `/api/qr?t=jpg`.
- resvg must run with `loadSystemFonts: false`. QR SVGs have no text, and font loading costs seconds.
- Style by module kind from the encoder. Never re-detect finder patterns by coordinates.
- The UI does not follow Telegram `themeParams`. The selected QR theme drives `--theme` and `--theme-ink`, and every token derives from them.

## Configuration

All configuration lives in the root `.env`, validated by `packages/env`.

| Variable                  | Required | Meaning                                                        |
| ------------------------- | -------- | -------------------------------------------------------------- |
| `BOT_TOKEN`               | yes      | Token from BotFather                                           |
| `BOT_WEBHOOK_SECRET`      | yes      | At least 16 characters, checked on every webhook call          |
| `BOT_USERNAME`            | yes      | Bot username without `@`, used in `t.me` links                 |
| `APP_URL`                 | yes      | Public origin of the web app; must be `https://` in production |
| `REDIS_URL`               | no       | Enables rate limits and image rendering for sharing            |
| `RATE_LIMIT_PER_MINUTE`   | no       | Requests per client per minute on `/api/qr`, default 120       |
| `CLIENT_IP_HEADER`        | no       | Header with the real client IP, default `x-forwarded-for`      |
| `CLOUDFLARE_TUNNEL_TOKEN` | no       | Named tunnel for `just tunnel`                                 |

## Where new code goes

| Change                            | Place                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| A new dot, frame or center shape  | `packages/qr/src/figures/`; it must pass the decoder test in `render.test.ts`      |
| A new style option                | `packages/qr/src/style.ts`, then the zod schema in `packages/shared/src/schema.ts` |
| A new editor control              | `apps/web/src/components/editor/controls.tsx` as a `SheetRow`                      |
| A UI primitive                    | `just ui-add <name>`; never a hand-written styled div                              |
| Text in the Mini App              | `apps/web/src/i18n/{en,uz,ru}.ts`, all three at once                               |
| Text in the bot                   | `apps/bot/src/i18n.ts`, all three languages                                        |
| Copied or ported third-party code | Credit it in `THIRD_PARTY_NOTICES.md` and the README                               |

Next: [QR engine](qr-engine.md)

<p align="center">
  <img src="./.github/assets/header.svg" alt="kyuar — QR codes that live inside Telegram" width="100%">
</p>

<p align="center">
  <a href="#license"><img src="https://img.shields.io/badge/license-AGPL--3.0-FF6A1A?style=flat-square&labelColor=111318" alt="License: AGPL-3.0"></a>
  <img src="https://img.shields.io/badge/Next.js-16.3-F4F4F2?style=flat-square&labelColor=111318" alt="Next.js 16.3">
  <img src="https://img.shields.io/badge/grammY-1.46-F4F4F2?style=flat-square&labelColor=111318" alt="grammY 1.46">
  <img src="https://img.shields.io/badge/oxlint%20%2B%20oxfmt-oxc-F4F4F2?style=flat-square&labelColor=111318" alt="oxc">
  <img src="https://img.shields.io/badge/react--doctor-100%2F100-FF6A1A?style=flat-square&labelColor=111318" alt="react-doctor 100/100">
</p>

---

QR codes that live inside Telegram. Generate one in any chat, in a private
conversation with the bot, or in a full editor that opens as a Telegram Mini
App.

## Surfaces

| Surface      | How it works                                                      |
| ------------ | ----------------------------------------------------------------- |
| Inline       | Type `@kyuarbot https://example.com` in any chat and pick a color |
| Private chat | Send the bot any text and get a QR code back                      |
| Mini App     | Tap the button to open the editor, then download or share         |

All three render through the same engine, so a code made inline looks identical
to one made in the editor.

## Why it looks different

Most generators give you black squares on white. kyuar draws the finder
patterns as rings and fuses adjacent data modules into one continuous shape,
the way the logo does.

Every theme is contrast-checked before it ships. A palette below 4.5:1 does not
scan reliably on a real camera, so it does not make it into the app.

## Requirements

- Node.js 24 or newer
- pnpm 11 or newer
- [just](https://just.systems)
- `cloudflared` for local development, since Telegram needs an HTTPS webhook

## Getting started

```sh
just setup
```

This copies `.env.example` to `.env`, symlinks that single file into every
workspace package, and installs dependencies. Then fill in `.env`:

```sh
just secret   # generates a value for BOT_WEBHOOK_SECRET
```

Run the app:

```sh
just dev      # web app on :3000 plus the bot in long-polling mode
```

To test inline mode and the Mini App you need a public HTTPS URL:

```sh
just tunnel        # in a second terminal
# put the tunnel URL in NEXT_PUBLIC_APP_URL, then:
just webhook-set
```

## BotFather setup

These steps cannot be automated and have to be done once in
[@BotFather](https://t.me/BotFather):

1. `/newbot` to create the bot and copy the token into `BOT_TOKEN`.
2. `/setinline` to enable inline mode, with a placeholder such as
   `Paste a link to turn it into a QR code`.
3. `/setinlinefeedback` set to `Enabled` if you later want usage statistics.
4. `/newapp` to register the Mini App and point it at `NEXT_PUBLIC_APP_URL`.

## Commands

Run `just` to list every recipe. The ones you need most:

```sh
just fix       # oxlint --fix, then oxfmt
just check     # lint, format check, typecheck, react-doctor
just build     # production build
```

## Layout

```
apps/web          Next.js 16 app: Mini App UI, /api/qr, /api/bot, /api/share
apps/bot          grammy handlers and the development long-polling runner
packages/qr       QR matrix renderer, framework agnostic, SVG out
packages/shared   zod schemas, option codec, Telegram initData verification
packages/env      envin schema, the single source of truth for configuration
brand/            logo, icons and Lottie animation
```

The bot runs inside the web app as a webhook route in production, and as a
separate long-polling process in development. There is only one deployment.

## Deployment

```sh
just docker-build
just docker-up
```

`NEXT_PUBLIC_*` values are baked into the client bundle at build time and come
from build args. Everything else is read from `.env` at runtime through
`env_file`, so no secret ever enters an image layer.

Put a reverse proxy cache in front of `/api/qr`. The route already sends
`Cache-Control: immutable`, so repeated codes never reach Node.

## Roadmap

- Saved qr codes per user, backed by Postgres
- Custom logo upload
- QR scanner using `showScanQrPopup`

## License

AGPL-3.0-only. See [LICENSE](./LICENSE).

<p align="center">
  <img src="./.github/assets/footer.svg" alt="FlakeForge" width="100%">
</p>

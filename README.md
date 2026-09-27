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

## Documentation

Full guides for developers, administrators and users, in three languages:
[English](docs/en/index.md) · [Oʻzbekcha](docs/uz/index.md) ·
[Русский](docs/ru/index.md).

## Surfaces

| Surface      | How it works                                                                   |
| ------------ | ------------------------------------------------------------------------------ |
| Inline       | Type `@kyuarbot https://example.com` in any chat and pick a color              |
| Private chat | Send the bot any text and get a QR code back                                   |
| Mini App     | Tap the button to open the editor, then download or share                      |
| Scan         | Scan with the Telegram camera, from a photo, or send the bot a photo of a code |

All three render through the same engine, so a code made inline looks identical
to one made in the editor.

## Why it looks different

Most generators give you black squares on white. kyuar styles every part of the
symbol on its own: data modules (29 shapes), finder rings and eyes, alignment
and timing patterns, background, margin and logo area. Each layer takes a solid
color or a linear or radial gradient. Halftone mode turns a picture into the
code itself.

Every shape is checked by a decoder in the test suite. A style that does not
scan does not ship.

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
# put the tunnel URL in APP_URL, restart `just dev`, then:
just webhook-set
```

## BotFather setup

These steps cannot be automated and have to be done once in
[@BotFather](https://t.me/BotFather):

1. `/newbot` to create the bot and copy the token into `BOT_TOKEN`.
2. `/setinline` to enable inline mode, with a placeholder such as
   `Paste a link to turn it into a QR code`.
3. `/setinlinefeedback` set to `Enabled` if you later want usage statistics.
4. Bot Settings → Configure Mini App → enable the Main Mini App and point it at
   `APP_URL`. Share buttons open it with `t.me/<bot>?startapp=…`,
   which works in groups and channels where `web_app` buttons do not.

## Commands

Run `just` to list every recipe. The ones you need most:

```sh
just fix       # oxlint --fix, then oxfmt
just check     # lint, format check, typecheck, react-doctor, knip
just test      # unit tests
just build     # production build
```

## Layout

```
apps/web          Next.js 16 app: Mini App UI, /api/qr, /api/bot, /api/share
apps/bot          grammy handlers and the development long-polling runner
packages/qr       styled SVG renderer: shapes, paints, halftone, logo area
packages/qr-encoder  QR encoder with per-module kinds, vendored from paulmillr/qr
packages/ui       shadcn/ui components on Base UI
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

All configuration is read from `.env` at runtime through `env_file`. The image
has no build args, so one image runs in any environment and no secret enters an
image layer.

Put a reverse proxy cache in front of `/api/qr`. The route already sends
`Cache-Control: immutable`, so repeated codes never reach Node.

## Roadmap

- Saved qr codes per user, backed by Postgres

## Credits

- [paulmillr/qr](https://github.com/paulmillr/qr) by Paul Miller: the QR
  encoder in `packages/qr-encoder`, and the decoder the tests use.
- [liquid-js/qr-code-styling](https://github.com/liquid-js/qr-code-styling) by
  Denys Kozak and Liquid-JS: the dot, finder ring and finder eye shapes in
  `packages/qr/src/figures`.
- Hung-Kuo Chu, Chia-Sheng Chang, Ruen-Rone Lee and Niloy J. Mitra, "Halftone
  QR Codes" (SIGGRAPH Asia 2013): the method behind halftone mode.

Full license texts are in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## License

AGPL-3.0-only. See [LICENSE](./LICENSE). Third-party code keeps its own license,
see [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

<p align="center">
  <img src="./.github/assets/footer.svg" alt="FlakeForge" width="100%">
</p>

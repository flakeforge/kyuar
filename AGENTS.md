# AGENTS.md

Instructions for AI coding agents working on kyuar.

## Project

kyuar is a QR code generator that lives entirely inside Telegram. It exposes
three surfaces backed by one rendering core:

1. **Inline mode** — `@kyuarbot <text>` in any chat returns a QR image.
2. **Private chat** — send text to the bot, get a QR back without opening the
   mini app.
3. **Mini app (TWA)** — a full editor with colors, styles and sharing.

## Rules

### Correctness

Do not guess. Before using an API, a file, or a dependency, open it and read
it. If a symbol is not in the repository or in installed `node_modules`, it
does not exist.

Semantic and pragmatic errors are the failure mode to avoid: code that
compiles but means the wrong thing, or that is technically valid but wrong for
this project's context.

### Language

All code, identifiers, documentation and commit messages are in English. UI
copy is written in English first, then translated to Uzbek and Russian. Write
simply. Short sentences, plain words, no marketing tone.

### Comments

Do not write inline comments. Code should explain itself through naming and
structure.

JSDoc is allowed on exported functions in `packages/*/src/lib/` and on shared
helpers, but only where the contract is not obvious from the signature. Do not
add JSDoc to every function.

A comment that survives review explains **why**, never **what**.

### Tooling

After changing code:

```sh
just fix     # oxlint --fix, then oxfmt
just check   # oxlint --deny-warnings + tsc --noEmit + react-doctor
just test    # vitest
```

All three must pass before the work is considered done. Bug fixes come with a
regression test when the code is testable.

### Commands

Every task has a `just` recipe. Run `just` to list them. Do not invent npm
scripts when a recipe exists.

### Git

Never commit, push, or rewrite history unless explicitly asked. Never touch
`.env`.

Commit messages follow Conventional Commits and are checked by commitlint in a
lefthook `commit-msg` hook. Keep the body short or leave it out. Do not add
`Co-authored-by` trailers.

## Layout

```
apps/web      Next.js 16 app: mini app UI, /api/qr, /api/bot webhook
apps/bot      grammy handlers and the development long-polling runner
packages/qr   framework-agnostic QR matrix renderer (SVG out)
packages/env  envin schema, the single source of truth for configuration
packages/shared  zod schemas, option codec, Telegram initData verification
```

## Constraints that are easy to get wrong

- **`uqr.encode()` returns both `data` and `types`.** Use `types` to style
  finder patterns separately from data modules. Do not re-detect them by
  coordinate math.
- **Telegram inline results cannot carry SVG.** Inline mode needs a public
  PNG URL, which is what `/api/qr` serves.
- **`shareMessage()` needs a server round trip.** Call
  `savePreparedInlineMessage` from the bot first, then pass the returned id to
  the client.
- **Never trust `initData` from the client.** Verify the HMAC server-side on
  every request that touches user state.
- **Next.js inlines `NEXT_PUBLIC_*` at build time.** kyuar has no client
  variables. `APP_URL` and `BOT_USERNAME` are server-only so one Docker image
  runs anywhere. Pass values to the client as props.
- **`web_app` buttons only work in private chats.** Anything that can land in a
  group or channel links to `t.me/<bot>?startapp=<base64url>` instead.
- **Do not adapt the UI to Telegram `themeParams`.** kyuar has its own color
  system. Only the header color is synced.

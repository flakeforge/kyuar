# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Anyone on Telegram. Three groups are confirmed:

- Everyday users who turn a link or a piece of text into a QR code and drop it into a chat, mostly through inline mode.
- Small businesses and social media managers who make branded, colored codes, then download and print them.
- Event organizers and teachers who share codes with groups and channels.

Most sessions happen on a phone, inside Telegram, often mid-conversation.

## Product Purpose

kyuar makes QR codes without leaving Telegram. A code made inline, in a private chat with the bot, or in the Mini App editor looks the same, because all three render through one engine. Success is a code that scans on the first try and looks like it was designed, not generated.

## Positioning

Most generators draw black squares on white. kyuar draws every part of the symbol with its own style: finder rings and eyes, data modules, alignment and timing patterns, quiet zone, colors and logo. It stays inside the chat app where the code will be shared.

## Operating Context

- Inline mode: `@kyuarbot <text>` in any chat returns a code as a photo.
- Private chat: the user sends text, the bot replies with a code.
- Mini App: a full editor opened from the bot, a button or a `startapp` link. On phones it opens expanded and fullscreen; on desktop clients it opens as is.
- Results are downloaded, printed or shared back into Telegram chats, groups and channels.

## Capabilities and Constraints

- One rendering core in `packages/qr`, used by the web app, the `/api/qr` image endpoint and the bot.
- Every styled preset must still decode. Scan reliability outranks decoration.
- Telegram inline results need a public image URL; SVG is not accepted.
- `initData` is verified on the server on every request that touches user state.
- UI languages: English, Uzbek, Russian, chosen from the Telegram language code.
- Self-hosted with Docker. No Vercel.
- Halftone codes are an implementation of the published Chu et al. (2013) method, written from scratch.

## Brand Commitments

- Name: kyuar, always lowercase.
- The mark is three finder patterns drawn as rings plus a cluster of fused data modules, the same geometry the app draws. Assets live in `brand/`.
- Brand colors: ink `#0B0B0C`, accent `#FF6B00`, light `#FFFFFF`. The accent is for the logo; inside the editor the accent follows the selected QR theme.
- Voice: short sentences, plain words, no marketing tone.

## Evidence on Hand

- Brand assets and Lottie animations in `brand/`.
- No testimonials, user counts or press exist. Do not invent them.

## Product Principles

1. It must scan. A style that breaks decoding does not ship.
2. Stay in Telegram. Every flow ends in a chat, a download or a share, never an outside site.
3. Same code everywhere. Inline, chat and editor output match.
4. Control without clutter. Every element is adjustable, but the default path is one input and one action.
5. Phone first. Thumbs, small screens and flaky networks are the normal case.

## Accessibility & Inclusion

Themes keep at least 4.5:1 contrast between the dark and light modules, which is also what reliable scanning needs. UI copy is translated, not only English.

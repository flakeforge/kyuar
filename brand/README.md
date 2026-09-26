# kyuar brand

Static, hand-checked assets. There is no generator script: edit these files
directly, or replace them.

## The mark

Three QR finder patterns in ring form, plus a cluster of fused data modules in
the fourth corner. It is the same geometry the app draws, so the logo and the
product it makes look like the same thing.

## Colors

| Token  | Hex       | Use             |
| ------ | --------- | --------------- |
| Ink    | `#0B0B0C` | Background      |
| Accent | `#FF6B00` | Data cluster    |
| Light  | `#FFFFFF` | Finder patterns |

`#FF6B00` on `#0B0B0C` is 6.89:1, above the 4.5:1 the QR renderer requires.

Orange on white is only 2.86:1. Never put the accent on a light background as
a standalone shape; on light surfaces use `mark.svg`, which draws the finders
in ink.

## Files

| File                           | Use                                            |
| ------------------------------ | ---------------------------------------------- |
| `logo.svg`                     | Primary. App icon, README, anywhere above 40px |
| `logo-compact.svg`             | Below 40px and for the Telegram bot avatar     |
| `logo-mono-light.svg`          | One-color white                                |
| `logo-mono-accent.svg`         | One-color orange                               |
| `mark.svg`                     | Mark alone, dark ink, for light backgrounds    |
| `mark-light.svg`               | Mark alone, white, for dark backgrounds        |
| `avatar-512.png`               | Upload to BotFather with `/setuserpic`         |
| `icon-512.png`, `icon-192.png` | PWA                                            |
| `apple-touch-icon.png`         | iOS home screen                                |
| `favicon-32.png`               | Favicon                                        |

## Animation

| File                       | Frames | Length |
| -------------------------- | ------ | ------ |
| `logo.lottie.json`         | 123    | 2.05s  |
| `logo-compact.lottie.json` | 108    | 1.80s  |

Lottie version 5.9.6, 60fps, 512x512, no external assets. The finder patterns
land one after another, then the data modules write themselves along the
diagonal. The last frame matches `logo.svg` to within anti-aliasing.

These are source files for producing video, not part of the app. Nothing in
`apps/web` imports them.

To export video, open the JSON in the LottieFiles editor or After Effects with
Bodymovin, or render it headlessly:

```sh
npx @lottiefiles/lottie-renderer logo.lottie.json --output logo.mp4
```

## Rules

- Below 40px use `logo-compact.svg`. The detailed cluster fills in and turns
  into a smudge.
- Keep clear space of one finder width on every side.
- Do not recolor, rotate, add effects, or place the mark on a busy photo.
- Telegram crops avatars to a circle. The artwork already reserves the corner
  space this needs; do not tighten the padding.

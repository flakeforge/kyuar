[← Contents](index.md) · [Oʻzbekcha](../uz/qr-engine.md) · [Русский](../ru/qr-engine.md)

# QR engine

- [Pipeline](#pipeline)
- [Encoder and module kinds](#encoder-and-module-kinds)
- [Style](#style)
- [Shapes](#shapes)
- [Colors and the palette formula](#colors-and-the-palette-formula)
- [Logo](#logo)
- [Halftone pictures](#halftone-pictures)
- [Scan checks](#scan-checks)
- [Reading codes](#reading-codes)
- [Tests](#tests)

## Pipeline

```text
text ─→ encoder (matrix + kind per module) ─→ renderQr(style) ─→ SVG ─┬─ editor preview
                                                                      ├─ resvg ─→ PNG
                                                                      └─ sharp ─→ JPEG
```

The engine lives in two packages with no framework code:

- `packages/qr-encoder` turns text into a module matrix.
- `packages/qr` turns the matrix into a styled SVG string. The same function runs in the editor's Web Worker, in `/api/qr` and in `/api/render`, so a code looks the same everywhere.

## Encoder and module kinds

The encoder is vendored from [paulmillr/qr](https://github.com/paulmillr/qr) and extended. Next to the dark or light value, it records a kind for every module:

| Kind                                            | Meaning                                      |
| ----------------------------------------------- | -------------------------------------------- |
| `Data`                                          | Data and error correction bits               |
| `FinderRing`, `FinderGap`, `FinderEye`          | The three corner squares: frame, gap, center |
| `Separator`                                     | The light border around each finder          |
| `AlignmentRing`, `AlignmentGap`, `AlignmentEye` | The smaller squares in larger codes          |
| `Timing`                                        | The dotted lines between the finders         |
| `Format`, `Version`, `DarkModule`               | Encoding metadata                            |

The renderer styles each layer by kind. It never guesses finder positions from coordinates.

## Style

`QrStyle` in `packages/qr/src/style.ts` describes everything that can change:

| Field                            | Meaning                                                              | Default                |
| -------------------------------- | -------------------------------------------------------------------- | ---------------------- |
| `ecc`                            | Error correction: `L`, `M`, `Q`, `H`                                 | `H`                    |
| `boostEcc`                       | Use a higher level when it fits in the same version                  | `true`                 |
| `minVersion`                     | Smallest QR version to use                                           | `1`                    |
| `mask`                           | Fixed mask, or `null` for the best one                               | `null`                 |
| `margin`                         | Quiet zone in modules                                                | `2`                    |
| `background`, `backgroundRadius` | Background paint and corner radius (0 is square)                     | Lilac, `0.5`           |
| `data`                           | Shape and paint of data modules                                      | `fluid`                |
| `finderOuter`, `finderInner`     | Corner frames and corner dots                                        | `dot`, `extra-rounded` |
| `alignment`                      | Draw alignment marks like pixels (`data`) or like corners (`finder`) | `data`                 |
| `timing`                         | Paint of the timing lines                                            | —                      |
| `logo.ratio`                     | Share of the code cleared for a logo, 0 for none                     | `0`                    |

A paint is solid, linear (with an angle) or radial, each with color stops. Gradients use `userSpaceOnUse`, so one gradient runs across the whole code instead of restarting in every module.

## Shapes

Shapes are functions that return SVG path data. They live in `packages/qr/src/figures/`. The dot and corner figures build on [@liquid-js/qr-code-styling](https://github.com/liquid-js/qr-code-styling); see [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md).

- **Pixels** (`DOT_FIGURES`): `square`, `dot`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`, `fluid`, `wave`, `heart`, `star`, `diamond`, `circuit`, stripes, blocks and more. Many read their neighbors, so lines and blobs join up.
- **Corner frames** (`FINDER_OUTER_FIGURES`): `square`, `rounded`, `extra-rounded`, `dot`, `classy`, `inpoint`, `outpoint`, `center-circle`.
- **Corner dots** (`FINDER_INNER_FIGURES`): the same set plus `heart`, `pentagon`, `hexagon`, `octagon`, `diamond`.

To add a shape, add it to the right table. The shape tests and the decoder test in `render.test.ts` must pass. A shape that looks good but does not scan is a bug.

## Colors and the palette formula

The editor shows one main color. `derivePalette(base, dark)` in `palette.ts` turns it into a full palette:

1. The background is a soft tint of the same hue (OKLCH lightness 0.95), or a deep shade (0.2) for a dark background.
2. Pixels keep the hue and move in lightness until they reach 7:1 contrast against the background.
3. Corner frames sit one step further. Corner dots keep the base color when it already has 4.5:1, so the brand color survives.

"Advanced" in the editor sets each part by hand. Changing the main color again replaces those choices, and the editor warns about it.

The 12 ready themes are in `themes.ts`. The default is Lilac.

## Logo

With `logo.ratio > 0` the encoder clears a square in the center and forces ECC `H`, so the missing modules are recovered by error correction. The renderer only accepts a `data:image/...;base64` href. On the server, sharp decodes and re-encodes every uploaded image before it reaches the SVG.

## Halftone pictures

A halftone draws a picture with the code itself. It is based on Chu et al., _Halftone QR Codes_ (SIGGRAPH Asia 2013), written from the paper:

1. Every module is split into 3×3 sub-modules.
2. The center sub-module of a data module always keeps the real value. Phones sample the center, so the code still scans.
3. Function patterns (finders, timing, alignment) stay solid.
4. The other sub-modules come from the picture, dithered with Floyd–Steinberg.

The editor exposes dot size (`centerRatio`) and contrast.

## Scan checks

Three layers catch codes that will not scan:

- `renderQr` returns a warning when any ink is below 4.5:1 contrast against the background.
- The editor warns about a thin or missing border and about too much text.
- The "Scan test" renders the current design in a worker and decodes it under four conditions: normal, small (132 px), blurred and dim. The result is "reads well", "fair" or "hard to read".

## Reading codes

`decodeImage` from `@kyuar/qr/scan` reads RGBA pixels with `qr/decode.js`. The same function serves the Mini App scanner (in a worker) and the bot (after sharp resizes the photo to at most 1600 px).

`parseScanned` in `packages/shared` recognizes the content: link, Wi-Fi, contact (MECARD and vCard), email, phone, SMS, location and plain text. `checkLink` flags risky links:

| Code            | Meaning                                           |
| --------------- | ------------------------------------------------- |
| `unsafe-scheme` | Not `http` or `https` (for example `javascript:`) |
| `insecure`      | Plain `http`                                      |
| `shortener`     | A known link shortener                            |
| `lookalike`     | Letters that imitate another site's name          |
| `ip-address`    | A bare IP address instead of a name               |
| `credentials`   | A login and password inside the link              |

## Tests

```bash
just test
```

Every style in `render.test.ts` is rendered, rasterized with resvg and decoded again. Gradients, logos, halftone and every margin must return the original text.

Next: [Telegram bot](bot.md)

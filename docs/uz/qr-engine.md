[← Mundarija](index.md) · [English](../en/qr-engine.md) · [Русский](../ru/qr-engine.md)

# QR dvigateli

- [Konveyer](#konveyer)
- [Encoder va modul turlari](#encoder-va-modul-turlari)
- [Uslub](#uslub)
- [Shakllar](#shakllar)
- [Ranglar va palitra formulasi](#ranglar-va-palitra-formulasi)
- [Logo](#logo)
- [Halftone rasmlar](#halftone-rasmlar)
- [Skan tekshiruvlari](#skan-tekshiruvlari)
- [Kodlarni skanerlash](#kodlarni-skanerlash)
- [Testlar](#testlar)

## Konveyer

```text
text ─→ encoder (matrix + kind per module) ─→ renderQr(style) ─→ SVG ─┬─ editor preview
                                                                      ├─ resvg ─→ PNG
                                                                      └─ sharp ─→ JPEG
```

Dvigatel freymvork kodisiz ikki paketda joylashgan:

- `packages/qr-encoder` matnni modullar matritsasiga aylantiradi.
- `packages/qr` matritsani bezatilgan SVG satriga aylantiradi. Bir xil funksiya editorning Web Worker ida, `/api/qr` da va `/api/render` da ishlaydi, shuning uchun kod hamma joyda bir xil koʻrinadi.

## Encoder va modul turlari

Encoder [paulmillr/qr](https://github.com/paulmillr/qr) dan vendor qilingan va kengaytirilgan. U har bir modul uchun qora yoki oq qiymat yoniga uning turini ham yozib qoʻyadi:

| Tur                                             | Maʼnosi                                       |
| ----------------------------------------------- | --------------------------------------------- |
| `Data`                                          | Maʼlumot va xatolarni tuzatish bitlari        |
| `FinderRing`, `FinderGap`, `FinderEye`          | Uchta burchak kvadrati: ramka, oraliq, markaz |
| `Separator`                                     | Har bir finder atrofidagi och chegara         |
| `AlignmentRing`, `AlignmentGap`, `AlignmentEye` | Kattaroq kodlardagi kichikroq kvadratlar      |
| `Timing`                                        | Finderlar orasidagi nuqtali chiziqlar         |
| `Format`, `Version`, `DarkModule`               | Kodlash metamaʼlumotlari                      |

Renderer har bir qatlamni turiga qarab bezaydi. U finder joylashuvini hech qachon koordinatalardan taxmin qilmaydi.

## Uslub

`packages/qr/src/style.ts` dagi `QrStyle` oʻzgarishi mumkin boʻlgan hamma narsani tasvirlaydi:

| Maydon                           | Maʼnosi                                                                               | Standart               |
| -------------------------------- | ------------------------------------------------------------------------------------- | ---------------------- |
| `ecc`                            | Xatolarni tuzatish: `L`, `M`, `Q`, `H`                                                | `H`                    |
| `boostEcc`                       | Shu versiyaga sigʻsa, yuqoriroq darajani ishlatish                                    | `true`                 |
| `minVersion`                     | Ishlatiladigan eng kichik QR versiyasi                                                | `1`                    |
| `mask`                           | Qatʼiy maska yoki eng yaxshisi uchun `null`                                           | `null`                 |
| `margin`                         | Modullardagi boʻsh chekka                                                             | `2`                    |
| `background`, `backgroundRadius` | Fon boʻyogʻi va burchak radiusi (0 — toʻrtburchak)                                    | Lilac, `0.5`           |
| `data`                           | Maʼlumot modullarining shakli va boʻyogʻi                                             | `fluid`                |
| `finderOuter`, `finderInner`     | Burchak ramkalari va burchak nuqtalari                                                | `dot`, `extra-rounded` |
| `alignment`                      | Tekislash belgilarini piksellar kabi (`data`) yoki burchaklar kabi (`finder`) chizish | `data`                 |
| `timing`                         | Timing chiziqlarining boʻyogʻi                                                        | —                      |
| `logo.ratio`                     | Kodning logo uchun boʻshatiladigan ulushi, logo boʻlmasa 0                            | `0`                    |

Boʻyoq bir xil, chiziqli (burchak bilan) yoki doiraviy boʻladi, har biri rang nuqtalari bilan. Gradientlar `userSpaceOnUse` dan foydalanadi, shuning uchun bitta gradient har bir modulda qaytadan boshlanmasdan butun kod boʻylab oʻtadi.

## Shakllar

Shakllar SVG path maʼlumotini qaytaradigan funksiyalardir. Ular `packages/qr/src/figures/` da joylashgan. Nuqta va burchak shakllari [@liquid-js/qr-code-styling](https://github.com/liquid-js/qr-code-styling) asosida qurilgan; [THIRD_PARTY_NOTICES.md](../../THIRD_PARTY_NOTICES.md) ga qarang.

- **Piksellar** (`DOT_FIGURES`): `square`, `dot`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`, `fluid`, `wave`, `heart`, `star`, `diamond`, `circuit`, chiziqlar, bloklar va boshqalar. Koʻplari qoʻshni modullarni oʻqiydi, shuning uchun chiziqlar va dogʻlar bir-biriga qoʻshilib ketadi.
- **Burchak ramkalari** (`FINDER_OUTER_FIGURES`): `square`, `rounded`, `extra-rounded`, `dot`, `classy`, `inpoint`, `outpoint`, `center-circle`.
- **Burchak nuqtalari** (`FINDER_INNER_FIGURES`): xuddi shu toʻplam, yana `heart`, `pentagon`, `hexagon`, `octagon`, `diamond`.

Shakl qoʻshish uchun uni kerakli jadvalga qoʻshing. Shakl testlari va `render.test.ts` dagi dekoder testi oʻtishi kerak. Chiroyli koʻrinadigan, lekin skanerlanmaydigan shakl — bu xato.

## Ranglar va palitra formulasi

Editor bitta asosiy rangni koʻrsatadi. `palette.ts` dagi `derivePalette(base, dark)` uni toʻliq palitraga aylantiradi:

1. Fon — xuddi shu tonning yumshoq ochroq varianti (OKLCH yorqinligi 0.95), qorongʻi fon uchun esa toʻq varianti (0.2).
2. Piksellar tonni saqlaydi va fonga nisbatan 7:1 kontrastga yetguncha yorqinligini oʻzgartiradi.
3. Burchak ramkalari yana bir qadam narida turadi. Burchak nuqtalari asosiy rangda allaqachon 4.5:1 kontrast boʻlsa, uni saqlaydi, shuning uchun brend rangi oʻzgarmaydi.

Editordagi «Kengaytirilgan» har bir qismni qoʻlda sozlaydi. Asosiy rangni yana oʻzgartirish bu tanlovlarni almashtiradi, editor bu haqda ogohlantiradi.

12 ta tayyor mavzu `themes.ts` da. Standart mavzu — Lilac.

## Logo

`logo.ratio > 0` boʻlganda encoder markazda kvadrat joyni boʻshatadi va ECC `H` ni majburiy qiladi, shuning uchun yetishmayotgan modullar xatolarni tuzatish orqali tiklanadi. Renderer faqat `data:image/...;base64` href ni qabul qiladi. Serverda sharp har bir yuklangan rasmni SVG ga yetib borishidan oldin dekodlaydi va qayta kodlaydi.

## Halftone rasmlar

Halftone rasmni kodning oʻzi bilan chizadi. U Chu va boshq., _Halftone QR Codes_ (SIGGRAPH Asia 2013) maqolasiga asoslanadi va maqoladan kelib chiqib yozilgan:

1. Har bir modul 3×3 kichik modulga boʻlinadi.
2. Maʼlumot modulining markaziy kichik moduli doim haqiqiy qiymatni saqlaydi. Telefonlar markazni oʻqiydi, shuning uchun kod baribir skanerlanadi.
3. Funksional patternlar (finderlar, timing, alignment) toʻliq boʻyalgan holda qoladi.
4. Qolgan kichik modullar rasmdan olinadi va Floyd–Steinberg usulida dithering qilinadi.

Editorda nuqta oʻlchami (`centerRatio`) va kontrast sozlanadi.

## Skan tekshiruvlari

Skanerlanmaydigan kodlarni uch qatlam ushlab qoladi:

- Biror rang fonga nisbatan 4.5:1 dan past kontrastga ega boʻlsa, `renderQr` ogohlantirish qaytaradi.
- Editor ingichka yoki umuman yoʻq chekka va juda koʻp matn haqida ogohlantiradi.
- «Skan sinovi» joriy dizaynni workerda render qiladi va uni toʻrt holatda dekodlaydi: oddiy, kichik (132 px), xira va qorongʻi. Natija: yaxshi oʻqiladi, oʻrtacha yoki qiyin oʻqiladi.

## Kodlarni skanerlash

`@kyuar/qr/scan` dagi `decodeImage` RGBA piksellarni `qr/decode.js` bilan oʻqiydi. Xuddi shu funksiya Mini App skaneriga (workerda) va botga (sharp rasmni koʻpi bilan 1600 px gacha kichraytirgandan keyin) xizmat qiladi.

`packages/shared` dagi `parseScanned` kontentni aniqlaydi: havola, Wi-Fi, kontakt (MECARD va vCard), email, telefon, SMS, joylashuv va oddiy matn. `checkLink` xavfli havolalarni belgilaydi:

| Kod             | Maʼnosi                                           |
| --------------- | ------------------------------------------------- |
| `unsafe-scheme` | `http` yoki `https` emas (masalan, `javascript:`) |
| `insecure`      | Oddiy `http`                                      |
| `shortener`     | Maʼlum havola qisqartirish xizmati                |
| `lookalike`     | Boshqa sayt nomiga taqlid qiladigan harflar       |
| `ip-address`    | Nom oʻrniga oddiy IP manzil                       |
| `credentials`   | Havola ichida login va parol                      |

## Testlar

```bash
just test
```

`render.test.ts` dagi har bir uslub render qilinadi, resvg bilan rastrga aylantiriladi va qayta dekodlanadi. Gradientlar, logolar, halftone va har bir chekka asl matnni qaytarishi kerak.

Keyingi: [Telegram bot](bot.md)

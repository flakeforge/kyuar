[← Mundarija](index.md) · [English](../en/architecture.md) · [Русский](../ru/architecture.md)

# Arxitektura

- [Repozitoriy xaritasi](#repozitoriy-xaritasi)
- [Texnologiyalar](#texnologiyalar)
- [Murojaatlar oqimi](#murojaatlar-oqimi)
- [Muhim qoidalar](#muhim-qoidalar)
- [Sozlamalar](#sozlamalar)
- [Yangi kod qayerga yoziladi](#yangi-kod-qayerga-yoziladi)

## Repozitoriy xaritasi

pnpm workspace asosidagi monorepo. Har bir vazifa uchun `just` resepti bor.

| Yoʻl                  | Nima                                                                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `apps/web`            | Next.js 16 ilova: Mini App, `/api/qr`, `/api/render`, `/api/share`, `/api/bot` (webhook)                                             |
| `apps/bot`            | grammY handlerlari, bot matnlari, development poller va webhook skripti                                                              |
| `packages/qr`         | Bezatilgan SVG renderer: shakllar, boʻyoqlar, halftone, logo maydoni, palitra formulasi, rasmni dekodlash (`@kyuar/qr/scan`)         |
| `packages/qr-encoder` | paulmillr/qr dan vendor qilingan QR encoder, har bir modul uchun tur bilan kengaytirilgan                                            |
| `packages/shared`     | zod sxemalari, `/api/qr` kodeki, initData tekshiruvlari, skanerlangan kontent parseri, havola xavfsizligi, lokallar, rang formatlari |
| `packages/ui`         | Base UI ustidagi shadcn/ui komponentlari va dizayn tokenlari                                                                         |
| `packages/env`        | envin sxemasi, sozlamalar uchun yagona manba                                                                                         |
| `brand/`              | Logo, ikonkalar va Lottie animatsiyalari                                                                                             |
| `docs/`               | Shu hujjatlar                                                                                                                        |

## Texnologiyalar

- **Runtime**: Node.js 24, TypeScript 5.9, pnpm 11.
- **Veb**: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4.
- **UI**: Base UI ustidagi shadcn/ui, lucide ikonkalari, Telegram uchun `@tma.js/sdk-react`.
- **Bot**: grammY 1.46, Bot API 10.
- **Rasmlar**: SVG → PNG uchun resvg, JPEG, logolar va rasmlar uchun sharp.
- **Saqlash**: rate limit va qisqa muddatli render qilingan rasmlar uchun Redis. Maʼlumotlar bazasi yoʻq.
- **Sifat**: oxlint, oxfmt, react-doctor, knip, vitest, lefthook, commitlint.

## Murojaatlar oqimi

```text
Telegram client ─┬─ inline query / message ─→ /api/bot (webhook) ─→ grammY handlers
                 │                                                  └─ photo_url → /api/qr
                 └─ Mini App ─→ page.tsx ─→ editor (renders in a Web Worker)
                                         ├─ POST /api/share  → savePreparedInlineMessage
                                         └─ POST /api/render → Redis (10 min) → downloadFile
```

- **Inline rejim va shaxsiy chatlar.** Bot `/api/qr` ga ishora qiluvchi rasm URL manzillari bilan javob beradi. URL ichida maʼlumot, format va faqat standartdan farq qiladigan uslub boʻlimlari base64url JSON koʻrinishida boʻladi. Shuning uchun bir xil kodlar keshlanadigan bitta URL ga ega boʻladi.
- **Editor.** Koʻrinishni Web Worker ichida render qiladi, shuning uchun rangni surish sahifani qotirmaydi. Ikkinchi worker skaner uchun rasmlarni dekodlaydi va skan sinovini bajaradi.
- **Logo yoki halftone rasmli kodlar.** Ularni URL bilan tasvirlab boʻlmaydi. `/api/render` rasmlarni sharp bilan qayta kodlaydi, render qiladi va PNG, 2048 px PNG, JPEG hamda SVG ni Redis da oʻn daqiqa saqlaydi. Telegram ularni `/api/render/<id>` dan yuklab oladi va ulashadi.
- **Ulashish.** `shareMessage()` uchun bot tayyorlagan xabar kerak. Shuning uchun Mini App `/api/share` ga murojaat qiladi, u `initData` ni tekshiradi va `savePreparedInlineMessage` ni chaqiradi.

## Muhim qoidalar

Toʻliq roʻyxat [AGENTS.md](../../AGENTS.md) da. Eng muhimlari:

- Mijozdan kelgan `initData` ga hech qachon ishonmang. Foydalanuvchi nomidan ish qiladigan har bir soʻrov uni serverda `@tma.js/init-data-node` bilan tekshiradi.
- `NEXT_PUBLIC_*` oʻzgaruvchilari yoʻq. `APP_URL` va `BOT_USERNAME` ishlash vaqtida oʻqiladi, shuning uchun bitta Docker image istalgan joyda ishlaydi.
- `web_app` tugmalari faqat shaxsiy chatlarda ishlaydi. Guruhga tushishi mumkin boʻlgan hamma narsa `t.me/<bot>?startapp=<base64url>` ga havola qiladi.
- Inline rasmlar JPEG boʻlishi shart. Bot `/api/qr?t=jpg` ga havola qiladi.
- resvg `loadSystemFonts: false` bilan ishlashi kerak. QR SVG larda matn yoʻq, shriftlarni yuklash esa soniyalar oladi.
- Encoder bergan modul turiga qarab bezang. Finder patternlarni hech qachon koordinatalar orqali qayta aniqlamang.
- UI Telegram `themeParams` ga ergashmaydi. Tanlangan QR mavzusi `--theme` va `--theme-ink` ni boshqaradi, qolgan barcha tokenlar ulardan olinadi.

## Sozlamalar

Barcha sozlamalar ildizdagi `.env` da turadi va `packages/env` tomonidan tekshiriladi.

| Oʻzgaruvchi               | Majburiy | Maʼnosi                                                                  |
| ------------------------- | -------- | ------------------------------------------------------------------------ |
| `BOT_TOKEN`               | ha       | BotFather bergan token                                                   |
| `BOT_WEBHOOK_SECRET`      | ha       | Kamida 16 belgi, har bir webhook chaqiruvida tekshiriladi                |
| `BOT_USERNAME`            | ha       | `@` siz bot username, `t.me` havolalarida ishlatiladi                    |
| `APP_URL`                 | ha       | Veb ilovaning ochiq manzili; productionda `https://` boʻlishi shart      |
| `REDIS_URL`               | yoʻq     | Rate limit va ulashish uchun rasm renderini yoqadi                       |
| `RATE_LIMIT_PER_MINUTE`   | yoʻq     | `/api/qr` da bitta mijoz uchun daqiqasiga soʻrovlar soni, standart 120   |
| `CLIENT_IP_HEADER`        | yoʻq     | Mijozning haqiqiy IP manzili yozilgan header, standart `x-forwarded-for` |
| `CLOUDFLARE_TUNNEL_TOKEN` | yoʻq     | `just tunnel` uchun nomli tunnel                                         |

## Yangi kod qayerga yoziladi

| Oʻzgarish                                  | Joyi                                                                               |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| Yangi nuqta, ramka yoki markaz shakli      | `packages/qr/src/figures/`; u `render.test.ts` dagi dekoder testidan oʻtishi kerak |
| Yangi uslub opsiyasi                       | `packages/qr/src/style.ts`, keyin `packages/shared/src/schema.ts` dagi zod sxemasi |
| Editorda yangi boshqaruv                   | `apps/web/src/components/editor/controls.tsx` da `SheetRow` sifatida               |
| UI primitivi                               | `just ui-add <name>`; hech qachon qoʻlda yozilgan bezatilgan div emas              |
| Mini App matni                             | `apps/web/src/i18n/{en,uz,ru}.ts`, uchalasi birdaniga                              |
| Bot matni                                  | `apps/bot/src/i18n.ts`, uchala tilda                                               |
| Koʻchirilgan yoki port qilingan tashqi kod | `THIRD_PARTY_NOTICES.md` va README da muallifini koʻrsating                        |

Keyingi: [QR dvigateli](qr-engine.md)

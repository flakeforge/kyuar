[← Mundarija](index.md) · [English](../en/getting-started.md) · [Русский](../ru/getting-started.md)

# Boshlash

- [Talablar](#talablar)
- [Birinchi ishga tushirish](#birinchi-ishga-tushirish)
- [Telegram ichida sinash](#telegram-ichida-sinash)
- [Kundalik buyruqlar](#kundalik-buyruqlar)
- [Muammolarni hal qilish](#muammolarni-hal-qilish)

## Talablar

- Node.js 24 yoki yangiroq
- pnpm 11 (versiya `package.json` ichida qatʼiy belgilangan)
- [just](https://just.systems)
- [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/) — Telegram faqat HTTPS bilan ishlaydi, shuning uchun lokal sinash uchun tunnel kerak
- Compose bilan Docker — faqat productionga oʻxshash stek uchun

## Birinchi ishga tushirish

1. Loyihani tayyorlang:

   ```bash
   just setup
   ```

   Bu `.env.example` dan `.env` yaratadi (agar u boʻlmasa) va `apps/web/.env`, `apps/bot/.env` hamda `packages/env/.env` ni ildizdagi faylga bogʻlaydi. Keyin bogʻliqliklarni va lefthook git hooklarini oʻrnatadi.

2. [@BotFather](https://t.me/BotFather) da dasturlash uchun bot yarating va `.env` ni toʻldiring:

   - `BOT_TOKEN` — BotFather bergan token.
   - `BOT_WEBHOOK_SECRET` — kamida 16 belgi. Uni yarating:

     ```bash
     just secret
     ```

   - `BOT_USERNAME` — `@` belgisisiz bot username.
   - `APP_URL` — hozircha `http://localhost:3000`. Keyingi boʻlimda u tunnel URL manziliga almashadi.

   Dasturlash uchun alohida bot ishlating. Polling va webhook bir vaqtda ishlay olmaydi, shuning uchun production botni polling qilish uni ishdan chiqaradi. Shu sababli bot webhookga ega boʻlsa, `just bot` ishga tushmaydi.

3. Veb ilova va botni birga ishga tushiring:

   ```bash
   just dev
   ```

   Veb ilova `http://localhost:3000` da ishlaydi. Bot long polling rejimida ishlaydi va buyruqlar menyusini eʼlon qiladi.

## Telegram ichida sinash

Mini App, inline rejim va webhook uchun ochiq HTTPS manzil kerak.

1. Ikkinchi terminalda:

   ```bash
   just tunnel
   ```

   `CLOUDFLARE_TUNNEL_TOKEN` boʻsh boʻlsa, bu vaqtinchalik `trycloudflare.com` URL bilan tezkor tunnel ochadi. Token boʻlsa, sizning nomli tunnelingiz ishga tushadi.

2. Tunnel URL manzilini `APP_URL` ga yozing va `just dev` ni qayta ishga tushiring. `APP_URL` ishlash vaqtida oʻqiladi, shuning uchun qayta build kerak emas.

3. Next.js notanish hostlardan kelgan development soʻrovlarini bloklaydi. Tunnel hostini (`https://` siz) `apps/web/next.config.ts` dagi `allowedDevOrigins` ga qoʻshing.

4. Botni BotFather da [Telegram bot → BotFather sozlamalari](bot.md#botfather-sozlamalari) boʻlimida yozilganidek sozlang.

Polling oʻrniga production webhook yoʻlini sinash uchun `just dev` ni toʻxtating, `just web` ni ishga tushiring, keyin:

```bash
just webhook-set
```

## Kundalik buyruqlar

Barcha reseptlarni vazifasi boʻyicha guruhlangan holda koʻrish uchun `just` ni ishga tushiring.

| Buyruq                  | Nima qiladi                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| `just dev` (`just d`)   | Veb ilova va bot birga                                             |
| `just web` / `just bot` | Ulardan faqat bittasi                                              |
| `just tunnel`           | `localhost:3000` ga HTTPS tunnel                                   |
| `just fix` (`just f`)   | oxlint `--fix`, keyin oxfmt                                        |
| `just check` (`just c`) | Lint, format tekshiruvi, typecheck, react-doctor va knip, parallel |
| `just test`             | Unit testlar (vitest)                                              |
| `just ui-add <name>`    | `packages/ui` ga shadcn/ui komponentini qoʻshadi                   |
| `just webhook info`     | Webhook holati (`set`, `delete` ham ishlaydi)                      |
| `just build`            | Veb ilovaning production buildi                                    |

Commitdan oldin `just fix` va `just check` muvaffaqiyatli oʻtishi kerak. Commit xabarlari Conventional Commits qoidasiga amal qiladi. Ularni git hookdagi commitlint tekshiradi, pre-push esa `just check` va `just test` ni ishga tushiradi.

## Muammolarni hal qilish

- **Bot muhit oʻzgaruvchilari notoʻgʻri deydi.** `.env` da qiymat yetishmaydi yoki fayl bogʻlanmagan. `just env` ni ishga tushiring va nomlarni `.env.example` bilan solishtiring.
- **Bot ishga tushmaydi: "This bot has a webhook".** Botni boshqa jarayon egallagan. Dasturlash uchun bot ishlating yoki uni rostdan ham oʻzingizga olmoqchi boʻlsangiz, `just webhook-delete` ni ishga tushiring.
- **Mini App Telegramʼda boʻsh sahifa ochadi.** `APP_URL` HTTPS tunnel URL boʻlishi kerak, BotFather dagi Main Mini App ham aynan shu manzilga qarashi kerak.
- **Guruhlarda tugmalar hech narsa qilmaydi.** BotFather da Main Mini App yoqilmagan, shuning uchun `t.me/<bot>?startapp` havolalari hech qayerga olib bormaydi.

Keyingi: [Arxitektura](architecture.md)

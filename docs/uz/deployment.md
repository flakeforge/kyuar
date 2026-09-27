[← Mundarija](index.md) · [English](../en/deployment.md) · [Русский](../ru/deployment.md)

# Deploy qilish

- [Productionda nima ishlaydi](#productionda-nima-ishlaydi)
- [Server talablari](#server-talablari)
- [Birinchi deploy](#birinchi-deploy)
- [HTTPS](#https)
- [Redis](#redis)
- [Xavfsizlik](#xavfsizlik)
- [Yangilash](#yangilash)
- [Muammolarni hal qilish](#muammolarni-hal-qilish)

## Productionda nima ishlaydi

`docker-compose.yml` ikkita konteynerni ishga tushiradi:

| Servis  | Image                                         | Vazifasi                                                                            |
| ------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `web`   | `kyuar-web` (`Dockerfile` dan build qilinadi) | 3000-portdagi Next.js standalone server: Mini App, `/api/*` va bot webhooki         |
| `redis` | `redis:8-alpine`                              | Rate limit va render qilingan rasmlar. Faqat xotirada, 64 MB, LRU boʻyicha tozalash |

Alohida bot konteyneri yoʻq. Telegram updatelarni `APP_URL/api/bot` ga yuboradi, ularni veb ilova qayta ishlaydi.

Image da build argumentlari ham, `NEXT_PUBLIC_*` oʻzgaruvchilari ham yoʻq. Barcha sozlamalar ishlash vaqtida `.env` dan olinadi, shuning uchun bitta image istalgan muhitda ishlaydi va hech qanday sir image qatlamiga tushmaydi.

## Server talablari

- Compose bilan Docker
- 3000-portga yoʻnaltiradigan ochiq HTTPS manzil

## Birinchi deploy

1. Repozitoriyni serverga koʻchiring va `.env` yarating:

   ```bash
   cp .env.example .env
   ```

2. `.env` ni toʻldiring. Oʻzgaruvchilar roʻyxati [Arxitektura → Sozlamalar](architecture.md#sozlamalar) boʻlimida. Productionda:

   - `APP_URL` `https://` bilan boshlanishi shart. Aks holda tekshiruvdan oʻtmaydi.
   - `REDIS_URL` ni yozish shart emas. Compose uni `redis://redis:6379` qilib qoʻyadi.
   - `BOT_WEBHOOK_SECRET`: uni `just secret` bilan yarating.

3. Build qiling va ishga tushiring:

   ```bash
   just docker-build
   just docker-up
   ```

4. Holatini tekshiring. `/api/qr?d=health` rasm qaytarsa, web konteyner sogʻlom hisoblanadi:

   ```bash
   docker compose ps
   just docker-logs web
   ```

5. Telegram ni serverga yoʻnaltiring va buyruqlar menyusini eʼlon qiling. Buni repozitoriy va xuddi shu `.env` bor kompyuterdan bajaring:

   ```bash
   just webhook-set
   just webhook-info
   ```

6. BotFather ni [Telegram bot → BotFather sozlamalari](bot.md#botfather-sozlamalari) boʻlimida yozilganidek sozlang.

## HTTPS

Telegram Mini App larni faqat HTTPS orqali ochadi va webhooklarni faqat HTTPS orqali yuboradi. Ikki keng tarqalgan usul:

- **Reverse proxy** (Caddy, nginx) serverda sertifikat bilan, `localhost:3000` ga yoʻnaltiradi.
- **Cloudflare Tunnel**: Cloudflare da `http://localhost:3000` ga qaraydigan nomli tunnel yarating va serverda `cloudflared` ni ishga tushiring. Ochiq portlar kerak emas.

`/api/qr` oldiga kesh qoʻying. Bu route `Cache-Control: public, max-age=31536000, immutable` yuboradi, shuning uchun takroriy kod Node gacha yetib bormaydi.

Agar proxy mijoz IP manzilini `X-Forwarded-For` dan boshqa headerda yuborsa (masalan, `CF-Connecting-IP`), `CLIENT_IP_HEADER` ni sozlang. Aks holda barcha foydalanuvchilar bitta rate limitni boʻlishadi.

## Redis

| Kalit                        | Vazifasi                                                                        | Yashash muddati |
| ---------------------------- | ------------------------------------------------------------------------------- | --------------- |
| `rate:<scope>:<ip>:<window>` | Bitta mijozning daqiqadagi soʻrovlar soni                                       | 60 s            |
| `render:<id>:<format>`       | Logo yoki rasmli kodning render qilingan PNG, 2048 px PNG, JPEG va SVG fayllari | 600 s           |

Redis doimiy hech narsa saqlamaydi, shuning uchun u persistencesiz ishlaydi. Uni yoʻqotish muhim hech narsani yoʻqotmaydi.

Redis boʻlmasa:

- Rate limit oʻchadi. Har bir soʻrovga ruxsat beriladi.
- Telegramʼda logo yoki rasmli kodni ulashish va yuklab olish 503 bilan xato beradi, chunki Telegram rasmni olish uchun URL talab qiladi.

Oddiy kodlar `/api/qr` orqali ishlashda davom etadi.

## Xavfsizlik

- **initData.** `/api/share` va `/api/render` Telegram `initData` ni bot tokeni bilan tekshiradi va bir soatdan eski maʼlumotni rad etadi. Foydalanuvchi kimligi faqat tekshirilgan maʼlumotdan olinadi.
- **Webhook.** `/api/bot` toʻgʻri `X-Telegram-Bot-Api-Secret-Token` boʻlmagan soʻrovlarni rad etadi.
- **Yuklangan rasmlar.** sharp har bir logo va rasmni SVG ga yetib borishidan oldin piksel cheklovi bilan dekodlaydi va qayta kodlaydi.
- **Headerlar.** Ilova `X-Content-Type-Options: nosniff`, qatʼiy referrer policy va faqat Telegram Web ga ruxsat beradigan `frame-ancestors` yuboradi.
- **Konteyner.** Veb ilova imtiyozsiz `nextjs` foydalanuvchisi nomidan ishlaydi.

## Yangilash

```bash
git pull
just docker-build
just docker-up
```

Compose web konteynerni almashtiradi. Redis ishlashda davom etadi. `just webhook-set` ni faqat `APP_URL` yoki bot buyruqlari oʻzgarganda qayta ishga tushiring.

## Muammolarni hal qilish

| Belgi                               | Tekshiring                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Konteyner qayta-qayta ishga tushadi | `just docker-logs web`. Odatda `.env` da oʻzgaruvchi yoʻq yoki notoʻgʻri                           |
| Bot jim                             | `just webhook-info`: URL `APP_URL/api/bot` boʻlishi, `last_error_message` esa boʻsh boʻlishi kerak |
| Inline natijalarda rasm yoʻq        | `/api/qr` internetdan HTTPS orqali ochilishi kerak                                                 |
| Ulashish 503 bilan xato beradi      | Redis ga ulanib boʻlmayapti                                                                        |
| Hamma 429 oladi                     | `CLIENT_IP_HEADER` proxyga mos kelmaydi                                                            |

Keyingi: [Foydalanuvchi qoʻllanmasi](user-guide.md)

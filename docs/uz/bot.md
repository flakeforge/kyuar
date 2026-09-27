[← Mundarija](index.md) · [English](../en/bot.md) · [Русский](../ru/bot.md)

# Telegram bot

- [Bot nima qiladi](#bot-nima-qiladi)
- [BotFather sozlamalari](#botfather-sozlamalari)
- [Buyruqlar](#buyruqlar)
- [Inline rejim](#inline-rejim)
- [Shaxsiy chat](#shaxsiy-chat)
- [Guruhlar va Guest Chat Mode](#guruhlar-va-guest-chat-mode)
- [Mini App havolalari](#mini-app-havolalari)
- [Webhook va polling](#webhook-va-polling)
- [Tillar](#tillar)

## Bot nima qiladi

Bot `apps/bot` da grammY bilan yozilgan. Productionda u veb ilova ichida ishlaydi: Telegram `POST /api/bot` ni chaqiradi, grammY esa `BOT_WEBHOOK_SECRET` headerini tekshiradi. Development vaqtida u alohida, long polling bilan ishlaydi.

| Qayerda                    | Kod yaratadi     | Kod oʻqiydi                               |
| -------------------------- | ---------------- | ----------------------------------------- |
| Inline rejim (`@bot text`) | Ha, 8 ta mavzuda | —                                         |
| Shaxsiy chat               | Istalgan matndan | Istalgan rasm yoki rasm faylidan          |
| Guruh                      | —                | Tilga olinganda yoki `/scan` bilan        |
| Guest Chat Mode            | —                | Bot aʼzo boʻlmagan chatda tilga olinganda |

Handlerlar `apps/bot/src/index.ts` da shu tartibda roʻyxatdan oʻtkaziladi: buyruqlar, inline, skan.

## BotFather sozlamalari

[@BotFather](https://t.me/BotFather) da botingiz uchun:

1. **Main Mini App**: Bot Settings → Configure Mini App → Enable, URL sifatida `APP_URL` ni kiriting. Busiz guruhlardagi `t.me/<bot>?startapp` havolalari hech narsa ochmaydi.
2. **Inline rejim**: `/setinline`, `link or text` kabi qisqa placeholder bilan.
3. **Guest Chat Mode**: bot aʼzo boʻlmagan chatlarda kodlarni oʻqish uchun uni yoqing.
4. **Group privacy** yoqilgan qolishi mumkin. Privacy yoqilgan boʻlsa ham, bot uni tilga olgan xabarlarni va `/scan@bot` ni oladi. Oddiy `/scan` faqat baʼzi hollarda yetkaziladi, masalan guruhda boshqa faol bot boʻlmasa. Aʼzolar har doim `/scan` yoza olishi kerak boʻlsa, privacy ni oʻchiring.

Buyruqlar menyusi qoʻlda sozlanmaydi. Uni `just dev` va `just webhook-set` eʼlon qiladi.

## Buyruqlar

| Buyruq   | Shaxsiy chat                                                                                                            | Guruh                                                  |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `/start` | Salomlashish va «Editorni ochish» tugmasi                                                                               | —                                                      |
| `/scan`  | Xabardagi yoki javob berilgan xabardagi rasmni oʻqiydi; rasm boʻlmasa, yordam va «Skanerni ochish» tugmasini koʻrsatadi | Xuddi shunday, lekin tugma `startapp` havolasi boʻladi |
| `/help`  | Botdan qanday foydalanish                                                                                               | Xuddi shunday                                          |

Menyu ingliz (standart), oʻzbek va rus tillarida `setMyCommands` va `language_code` bilan eʼlon qilinadi.

## Inline rejim

Istalgan chatda `@bot <text>` 8 tagacha rasm natijasini qaytaradi, har bir mavzu uchun bittadan. Har bir natija `/api/qr` ga olib boruvchi JPEG URL, chunki Telegram inline natijalari SVG ni koʻrsata olmaydi. Izoh — matnning oʻzi, «kyuarʼda tahrirlash» tugmasi esa Mini App ni xuddi shu matn bilan ochadi.

Boʻsh soʻrov natijalar oʻrniga «kyuar editorini ochish» tugmasini koʻrsatadi. Natijalar har bir foydalanuvchi uchun 60 soniya keshlanadi.

Avval matn turi aniqlanadi: email `mailto:` ga, `+` formatidagi telefon raqami `tel:` ga aylanadi, `WIFI:` satrlari esa oʻzgarmaydi.

## Shaxsiy chat

- **Matn.** Bot standart mavzudagi QR rasm va matnni oʻzida olib yuradigan «Editorni ochish» tugmasi bilan javob beradi. Bitta kodga sigʻmaydigan matnga qisqa xato xabari keladi. `/` bilan boshlanadigan matn buyruq handlerlariga qoldiriladi.
- **Rasm yoki rasm fayli.** Bot faylni yuklab oladi (10 MB gacha), sharp bilan aylantiradi va oʻlchamini kichraytiradi, keyin dekodlaydi. Javobda kontent turi, kontentning oʻzi va havola ogohlantirishlari koʻrsatiladi. Havolaga «Havolani ochish» tugmasi qoʻshiladi, agar uning sxemasi xavfli boʻlmasa. Har bir natijaga «Shu kodni bezash» tugmasi qoʻshiladi.

Javoblar oddiy matnda yuboriladi, shuning uchun skanerlangan kontent formatlashni buzolmaydi.

## Guruhlar va Guest Chat Mode

Guruh va superguruhlarda bot rasmni faqat soʻralganda oʻqiydi:

- Rasmga `@bot` yoki `/scan` deb javob yozing.
- Rasm izohiga `@bot` yoki `/scan` qoʻshing.

Qolgan hamma narsani, jumladan oddiy matnni ham, bot eʼtiborsiz qoldiradi. Guruh xabarlaridan QR kod yaratmaydi.

**Guest Chat Mode** bilan foydalanuvchi botni u aʼzo boʻlmagan chatda tilga olishi mumkin. Telegram `guest_message` update yuboradi, bot esa `answerGuestQuery` bilan javob beradi: skan natijasi yozilgan article. Buning uchun `guest_message` `allowed_updates` ichida boʻlishi kerak. `apps/bot/src/config.ts` dagi `ALLOWED_UPDATES` uni allaqachon oʻz ichiga oladi.

## Mini App havolalari

| Havola                            | Qayerda ishlaydi        | Nima uchun                                |
| --------------------------------- | ----------------------- | ----------------------------------------- |
| `APP_URL` ga `web_app` tugmasi    | Faqat shaxsiy chatlarda | «Editorni ochish», «Skanerni ochish»      |
| `APP_URL?data=<text>`             | Faqat shaxsiy chatlarda | Matn toʻldirilgan editor                  |
| `APP_URL?mode=scan`               | Faqat shaxsiy chatlarda | «Skanerlash» boʻlimida ochiladi           |
| `t.me/<bot>?startapp=<base64url>` | Hamma joyda             | «kyuarʼda tahrirlash», «Shu kodni bezash» |
| `t.me/<bot>?startapp=scan`        | Hamma joyda             | Guruhlarda «Skanerni ochish»              |

`web_app` tugmalari guruh va kanallarda ishlamaydi, shuning uchun forward qilinishi mumkin boʻlgan hamma narsa `startapp` dan foydalanadi. Start parametriga sigʻmaydigan matn editorni boʻsh holda ochadi.

## Webhook va polling

```bash
just webhook-set     # set APP_URL/api/bot, drop pending updates, publish commands
just webhook-info    # show status
just webhook-delete  # remove the webhook (asks first)
just bot             # long polling for development
```

Webhook oʻrnatilgan boʻlsa, `just bot` ishlamaydi. Bu production botni development kompyuteridan himoya qiladi. Development uchun alohida bot ishlating.

## Tillar

`apps/bot/src/i18n.ts` dagi `botMessages(language_code)` ingliz, oʻzbek yoki rus tilini tanlaydi. Boshqa har qanday til uchun ingliz tili ishlatiladi. Oʻzbek tilida ASCII qoʻshtirnoqlar emas, `ʻ` va `ʼ` harflari ishlatiladi.

Keyingi: [Deploy qilish](deployment.md)

[← Mundarija](index.md) · [English](../en/user-guide.md) · [Русский](../ru/user-guide.md)

# Foydalanuvchi qoʻllanmasi

kyuar bilan QR kod yaratadigan va oʻqiydigan odamlar uchun. Texnik bilim kerak emas.

- [Kod yaratishning uch usuli](#kod-yaratishning-uch-usuli)
- [Editor](#editor)
- [Ranglar](#ranglar)
- [Logo va rasm](#logo-va-rasm)
- [Ulashish va yuklab olish](#ulashish-va-yuklab-olish)
- [Kodlarni skanerlash](#kodlarni-skanerlash)
- [Guruhlarda kodlarni skanerlash](#guruhlarda-kodlarni-skanerlash)
- [Havola haqida ogohlantirishlar](#havola-haqida-ogohlantirishlar)
- [Doim skanerlanadigan kod uchun maslahatlar](#doim-skanerlanadigan-kod-uchun-maslahatlar)

## Kod yaratishning uch usuli

1. **Istalgan chatda.** `@kyuarbot` va havola yoki matn yozing. Chiqqan rangli kodlardan birini tanlang, u chatga yuboriladi.
2. **Bot bilan chatda.** Botga istalgan matn yuboring: havola, `+998901234567` kabi telefon raqami, email manzil. U kod bilan javob beradi.
3. **Editorda.** Bot chatida «Editorni ochish» tugmasini yoki istalgan kyuar kodi ostidagi tugmani bosing. Ranglar va shakllar editorda oʻzgartiriladi.

## Editor

Kod tepada turadi. Uning ostidagi maydonga matn yozing yoki joylang, kod yozishingiz bilan yangilanadi. Pastga aylantirsangiz, kod kichrayadi, lekin koʻrinib turadi.

Har bir qator tanlovlar paneli ochadi:

| Qator                 | Nimani oʻzgartiradi                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------- |
| «Rang»                | Tayyor mavzular yoki oʻzingizning ranglaringiz                                           |
| «Chekka»              | Kod atrofidagi boʻsh joy: «Yoʻq», «Kichik», «Standart», «Katta»                          |
| «Burchaklar»          | Fon burchaklarining yumaloqligi                                                          |
| «Piksellar»           | Maʼlumotni saqlaydigan kichik kvadratlar shakli                                          |
| «Burchak ramkalari»   | Uchta katta burchak kvadratining shakli                                                  |
| «Burchak nuqtalari»   | Har bir burchak kvadrati ichidagi nuqta shakli                                           |
| «Tekislash belgilari» | Kattaroq kodlardagi kichik kvadratlar, «Piksellar kabi» yoki «Burchaklar kabi» chiziladi |
| «Xatolarni tuzatish»  | Kod qancha shikastga chidaydi. Yuqori daraja ishonchliroq, lekin kod zichroq             |
| «Logo»                | Markazdagi rasm                                                                          |
| «Rasm»                | Kodning oʻzi bilan chizilgan foto                                                        |

«Tasodifiy uslub» tasodifiy uslub tanlaydi. Yoqmasa, «Qaytarish» ni bosing.

## Ranglar

- **«Mavzular»**: doim skanerlanadigan 12 ta tayyor rang juftligi.
- **«Oʻzim tanlayman»**: bitta asosiy rang tanlang, kyuar fon va boshqa barcha qismlarni undan skanerlash uchun yetarli kontrast bilan yaratadi. «Qorongʻi fon» uni qorongʻi fondagi och piksellarga almashtiradi.
- **«Kengaytirilgan»**: har bir qism rangini oʻzingiz bir xil rang yoki gradient sifatida sozlang. Keyin asosiy rangni oʻzgartirsangiz, qismlar uchun tanlagan ranglaringiz almashadi.

Rang tanlagichni surganingizda u «Yaxshi oʻqiladi» yoki «Oʻqish uchun juda past» deb koʻrsatadi.

## Logo va rasm

- **«Logo»**: rasm tanlang, keyin uning oʻlchamini sozlang. Xatolarni tuzatish maksimal darajaga oʻtadi, chunki logo kodning bir qismini yopadi.
- **«Rasm»**: foto tanlang. Kod mayda nuqtalar bilan chiziladi, shuning uchun foto koʻrinib turadi. Foto ham, kod ham aniq boʻlguncha «Nuqta oʻlchami» va «Kontrast» ni sozlang.

## Ulashish va yuklab olish

- **«Ulashish»** (Telegramʼda): chat tanlang, kod «Oʻzingiznikini yarating» tugmasi bilan rasm sifatida yuboriladi.
- **«Yuklab olish»**: formatni tanlang.

| Format       | Nima uchun qulay                                               |
| ------------ | -------------------------------------------------------------- |
| PNG, 1024 px | Chatlar, ekranlar, saytlar                                     |
| PNG, 2048 px | Chop etish                                                     |
| SVG          | Dizayn dasturlari va katta chop etish; istalgan oʻlchamda aniq |

## Kodlarni skanerlash

Editor pastidagi **«Skanerlash»** ga oʻting.

- **«Kamera bilan»**: Telegram kamerasini ochadi. Uni kodga qarating.
- **«Rasmdan»**: ichida kod bor foto yoki skrinshotni tanlang.

Natijada kod ichidagi maʼlumot va u bilan qilinadigan amallar koʻrsatiladi:

| Kontent             | Amallar                                         |
| ------------------- | ----------------------------------------------- |
| Havola              | «Havolani ochish», «Nusxalash»                  |
| Wi-Fi               | Tarmoq nomi, parol, himoya; «Parolni nusxalash» |
| Kontakt             | Ism, telefon, email, tashkilot                  |
| Email, telefon, SMS | Manzil yoki raqam va xabar                      |
| Joylashuv           | «Xaritada ochish»                               |
| Matn                | «Nusxalash»                                     |

«Oʻzimnikini yaratish» xuddi shu kontentni editorda ochadi. Oxirgi 20 ta skan «Oxirgi skanlar» boʻlimida saqlanadi. Telegram ichida ular hisobingiz bilan birga barcha qurilmalarda koʻrinadi.

Kod rasmini toʻgʻridan-toʻgʻri bot chatiga ham yuborishingiz mumkin, u kod ichida nima borligini javob qilib yozadi.

## Guruhlarda kodlarni skanerlash

Botni guruhga qoʻshing, keyin:

- rasmga `@kyuarbot` yoki `/scan` deb javob yozing, yoki
- rasm izohiga `@kyuarbot` deb yozing.

Bot oʻsha rasmga natija bilan javob beradi. Boshqa xabarlarga javob bermaydi.

Bot guruhda boʻlmasa ham, rasmga javobda `@kyuarbot` ni tilga olishingiz mumkin. Bu botda Guest Chat Mode yoqilgan boʻlsa ishlaydi.

## Havola haqida ogohlantirishlar

kyuar har bir skanerlangan havolani tekshiradi va biror narsa shubhali koʻrinsa ogohlantiradi:

| Ogohlantirish        | Nimani bildiradi                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Veb-havola emas      | U qurilmangizda biror narsani ishga tushirishi mumkin. kyuar uni hech qachon oʻzi ochmaydi |
| Shifrlanmagan (http) | Tarmoqdagi boshqalar sahifani koʻrishi yoki oʻzgartirishi mumkin                           |
| Qisqa havola         | U aslida qayerga olib borishini koʻra olmaysiz                                             |
| Oʻxshatilgan manzil  | Harflar boshqa sayt nomiga taqlid qiladi, bu fishingda keng tarqalgan hiyla                |
| Oddiy IP manzil      | Havolada sayt nomi yoʻq                                                                    |
| Login va parol       | Havola ichida login va parol bor                                                           |

Ogohlantirishli havola ochilishidan oldin yana bir marta bosishni soʻraydi.

## Doim skanerlanadigan kod uchun maslahatlar

- Kontrastni kuchli saqlang. Och fondagi toʻq piksellar eng yaxshi skanerlanadi.
- Chekkani qoldiring. Koʻp telefonlar uchun «Kichik» — eng kami.
- Qisqa matn oddiyroq kod beradi. Uzun matn oʻrniga havola ishlating.
- Kod ostidagi «Skan sinovi» ni tekshiring. U dizaynni kichik, xira va kam yorugʻlikda sinaydi.
- Koʻp nusxa chop etishdan oldin chop etilgan kodni ikki xil telefonda sinab koʻring.

[← Mundarija](index.md)

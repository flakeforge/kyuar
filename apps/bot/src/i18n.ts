import { resolveLocale, type LinkWarning, type Locale, type ScannedContent } from "@kyuar/shared";

interface BotMessages {
  welcome: string;
  help: (username: string) => string;
  tooLong: string;
  openEditor: string;
  editInKyuar: string;
  makeYourOwn: string;
  openEditorInline: string;
  shareTitle: string;
  scanNotFound: string;
  scanFailed: string;
  scanKinds: Record<ScannedContent["kind"], string>;
  scanWarnings: Record<LinkWarning, string>;
  openLink: string;
  styleIt: string;
}

const MESSAGES: Record<Locale, BotMessages> = {
  en: {
    welcome: [
      "Send me anything and I will turn it into a QR code.",
      "",
      "A link, some text, a phone number, an email address. It all works.",
      "",
      "Open the editor to pick colors and styles, or use me inline in any chat.",
    ].join("\n"),
    help: (username) =>
      [
        "How to use kyuar:",
        "",
        "1. Send text here and get a QR code back.",
        "2. Tap Open editor for colors, styles and downloads.",
        `3. Type @${username} followed by a link in any chat to share a code without leaving the conversation.`,
      ].join("\n"),
    tooLong: "That is too much text for one QR code. Try something shorter, like a link.",
    openEditor: "Open editor",
    editInKyuar: "Edit in kyuar",
    makeYourOwn: "Make your own",
    openEditorInline: "Open the kyuar editor",
    shareTitle: "QR code",
    scanNotFound: "I could not find a QR code in this image. Send a sharper photo or a screenshot.",
    scanFailed: "I could not read this file. Send a photo or an image.",
    scanKinds: {
      url: "Link",
      wifi: "Wi-Fi",
      contact: "Contact",
      email: "Email",
      phone: "Phone",
      sms: "SMS",
      geo: "Location",
      text: "Text",
    },
    scanWarnings: {
      "unsafe-scheme": "Not a web link, it could run something on your device.",
      insecure: "Not encrypted (http).",
      shortener: "A short link hides where it goes.",
      lookalike: "The address imitates another site's name.",
      "ip-address": "Points to a bare IP address.",
      credentials: "Carries a login and password.",
    },
    openLink: "Open link",
    styleIt: "Style this code",
  },
  uz: {
    welcome: [
      "Menga istalgan narsani yuboring, men uni QR kodga aylantiraman.",
      "",
      "Havola, matn, telefon raqami, email manzil. Hammasi ishlaydi.",
      "",
      "Rang va uslub tanlash uchun editorni oching yoki meni istalgan chatda inline ishlating.",
    ].join("\n"),
    help: (username) =>
      [
        "kyuarʼdan qanday foydalanish:",
        "",
        "1. Shu yerga matn yuboring va QR kod oling.",
        "2. Rang, uslub va yuklab olish uchun «Editorni ochish» tugmasini bosing.",
        `3. Istalgan chatda @${username} va havolani yozing, kod suhbatdan chiqmasdan yuboriladi.`,
      ].join("\n"),
    tooLong: "Bitta QR kod uchun matn juda uzun. Qisqaroq narsa yuboring, masalan havola.",
    openEditor: "Editorni ochish",
    editInKyuar: "kyuarʼda tahrirlash",
    makeYourOwn: "Oʻzingiznikini yarating",
    openEditorInline: "kyuar editorini ochish",
    shareTitle: "QR kod",
    scanNotFound: "Bu rasmda QR kod topilmadi. Aniqroq rasm yoki skrinshot yuboring.",
    scanFailed: "Bu faylni oʻqib boʻlmadi. Rasm yuboring.",
    scanKinds: {
      url: "Havola",
      wifi: "Wi-Fi",
      contact: "Kontakt",
      email: "Email",
      phone: "Telefon",
      sms: "SMS",
      geo: "Joylashuv",
      text: "Matn",
    },
    scanWarnings: {
      "unsafe-scheme": "Veb-havola emas, qurilmangizda biror narsani ishga tushirishi mumkin.",
      insecure: "Shifrlanmagan (http).",
      shortener: "Qisqa havola qayerga olib borishini yashiradi.",
      lookalike: "Manzil boshqa sayt nomiga oʻxshatilgan.",
      "ip-address": "Oddiy IP manzilga olib boradi.",
      credentials: "Ichida login va parol bor.",
    },
    openLink: "Havolani ochish",
    styleIt: "Shu kodni bezash",
  },
  ru: {
    welcome: [
      "Пришлите мне что угодно, и я превращу это в QR-код.",
      "",
      "Ссылка, текст, номер телефона, адрес почты. Всё подойдёт.",
      "",
      "Откройте редактор, чтобы выбрать цвета и стиль, или используйте меня в любом чате через inline.",
    ].join("\n"),
    help: (username) =>
      [
        "Как пользоваться kyuar:",
        "",
        "1. Отправьте сюда текст и получите QR-код.",
        "2. Нажмите «Открыть редактор» для цветов, стилей и скачивания.",
        `3. Напишите @${username} и ссылку в любом чате, чтобы отправить код, не выходя из разговора.`,
      ].join("\n"),
    tooLong:
      "Слишком много текста для одного QR-кода. Пришлите что-нибудь короче, например ссылку.",
    openEditor: "Открыть редактор",
    editInKyuar: "Изменить в kyuar",
    makeYourOwn: "Сделать свой",
    openEditorInline: "Открыть редактор kyuar",
    shareTitle: "QR-код",
    scanNotFound: "На этом изображении нет QR-кода. Пришлите более чёткое фото или скриншот.",
    scanFailed: "Не удалось прочитать файл. Пришлите фото или картинку.",
    scanKinds: {
      url: "Ссылка",
      wifi: "Wi-Fi",
      contact: "Контакт",
      email: "Почта",
      phone: "Телефон",
      sms: "SMS",
      geo: "Место",
      text: "Текст",
    },
    scanWarnings: {
      "unsafe-scheme": "Это не веб-ссылка, она может что-то запустить на устройстве.",
      insecure: "Не зашифрована (http).",
      shortener: "Короткая ссылка скрывает, куда ведёт.",
      lookalike: "Адрес подражает названию другого сайта.",
      "ip-address": "Ведёт на голый IP-адрес.",
      credentials: "Содержит логин и пароль.",
    },
    openLink: "Открыть ссылку",
    styleIt: "Оформить этот код",
  },
};

export function botMessages(languageCode: string | undefined): BotMessages {
  return MESSAGES[resolveLocale(languageCode)];
}

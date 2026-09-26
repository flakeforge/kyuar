import { resolveLocale, type Locale } from "@kyuar/shared";

interface BotMessages {
  welcome: string;
  help: (username: string) => string;
  tooLong: string;
  openEditor: string;
  editInKyuar: string;
  makeYourOwn: string;
  openEditorInline: string;
  shareTitle: string;
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
        "kyuar’dan qanday foydalanish:",
        "",
        "1. Shu yerga matn yuboring va QR kod oling.",
        "2. Rang, uslub va yuklab olish uchun «Editorni ochish» tugmasini bosing.",
        `3. Istalgan chatda @${username} va havolani yozing, kod suhbatdan chiqmasdan yuboriladi.`,
      ].join("\n"),
    tooLong: "Bitta QR kod uchun matn juda uzun. Qisqaroq narsa yuboring, masalan havola.",
    openEditor: "Editorni ochish",
    editInKyuar: "kyuar’da tahrirlash",
    makeYourOwn: "O‘zingiznikini yarating",
    openEditorInline: "kyuar editorini ochish",
    shareTitle: "QR kod",
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
  },
};

export function botMessages(languageCode: string | undefined): BotMessages {
  return MESSAGES[resolveLocale(languageCode)];
}

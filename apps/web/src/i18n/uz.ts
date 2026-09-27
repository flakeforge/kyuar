import type { Messages } from "./en";

export const uz: Messages = {
  input: {
    label: "Matn yoki havola",
    placeholder: "Havola yoki matn joylang",

    paste: "Joylash",

    clear: "Tozalash",
  },
  preview: {
    label: "QR kod koʻrinishi",
    tooLong:
      "Bitta QR kod uchun matn juda uzun. Qisqartiring yoki xatolarni tuzatish darajasini pasaytiring.",
    tooLongLogo:
      "Logo bilan bitta kod uchun matn juda uzun. Logoni olib tashlang yoki matnni qisqartiring.",
    lowContrast: "Ranglar bir-biriga juda yaqin. Telefon bu kodni oʻqimasligi mumkin.",
    empty: "Kod yaratish uchun havola yoki matn yozing.",
    tightMargin: "Chekka ingichka yoki umuman yoʻq boʻlsa, telefon kodni topmasligi mumkin.",
  },
  rows: {
    color: "Rang",
    margin: "Chekka",
    corners: "Burchaklar",
    pixels: "Piksellar",
    pupils: "Burchak nuqtalari",
    eyes: "Burchak ramkalari",
    markers: "Tekislash belgilari",
    strength: "Xatolarni tuzatish",
    logo: "Logo",
    picture: "Rasm",
  },
  options: {
    random: "Tasodifiy",
    none: "Yoʻq",
    small: "Kichik",
    standard: "Standart",
    large: "Katta",
    round: "Yumaloq",
    extraRound: "Juda yumaloq",
    markersPixels: "Piksellar kabi",
    markersEyes: "Burchaklar kabi",
    eccL: "Past, 7%",
    eccM: "Oʻrta, 15%",
    eccQ: "Yuqori, 25%",
    eccH: "Maksimal, 30%",
    eccHint: "Yuqori daraja shikast va logoga chidamli, lekin kod zichroq boʻladi.",
    boost: "Joy boʻlsa, darajani oshirish",

    logoLocksEcc:
      "Logo uchun maksimal xatolarni tuzatish kerak. Boshqa darajani tanlash uchun logoni olib tashlang.",

    more: "Koʻproq shakllar",

    fewerShapes: "Kamroq shakllar",
  },
  color: {
    themes: "Mavzular",
    element: "Qism",
    background: "Fon",
    pixels: "Piksellar",
    eyes: "Burchak ramkalari",
    pupils: "Burchak nuqtalari",
    markers: "Tekislash belgilari",
    timing: "Nuqtali chiziqlar",
    solid: "Bir xil",
    linear: "Chiziqli",
    radial: "Doiraviy",
    angle: "Burchak",
    from: "Boshi",
    to: "Oxiri",
    swatches: "Ranglar",
    hue: "Ton",
    scans: "Yaxshi oʻqiladi",
    tooLow: "Oʻqish uchun juda past",
    customTab: "Oʻzim tanlayman",
    area: "Toʻyinganlik va yorqinlik",
    eyedropper: "Ekrandan rang olish",
    format: "Rang formati",
    value: "Rang qiymati",
    darkBackground: "Qorongʻi fon",
    advanced: "Kengaytirilgan",
    fewer: "Kamroq sozlama",
    base: "Asosiy rang",
    autoHint: "Qolgan ranglar shundan olinadi va kod doim oʻqiladi.",

    fill: "Toʻldirish",

    editedParts: "Asosiy rangni oʻzgartirsangiz, qismlar uchun tanlagan ranglaringiz almashadi.",
  },
  image: {
    logoHint: "Markazga qoʻyiladi. Xatolarni tuzatish eng yuqori darajaga oʻtadi.",
    logoSize: "Logo oʻlchami",
    pictureHint: "Rasm kodning oʻzi bilan chiziladi.",
    centerSize: "Nuqta oʻlchami",
    contrast: "Kontrast",
    choose: "Rasm tanlash",
    replace: "Almashtirish",
    remove: "Oʻchirish",
    unreadable: "Bu faylni rasm sifatida oʻqib boʻlmadi.",
    off: "Oʻchiq",
  },
  actions: {
    download: "Yuklab olish",
    share: "Ulashish",
    surprise: "Tasodifiy uslub",
    sharing: "Tayyorlanmoqda…",
    downloadFailed: "Yuklab boʻlmadi. Qayta urinib koʻring.",
    shareFailed: "Ulashib boʻlmadi. Qayta urinib koʻring.",
    shareUnavailable: "Ulashish uchun kyuarʼni Telegramʼda oching.",
    downloaded: "Saqlandi",
    surprised: "Yangi uslub",
    undo: "Qaytarish",

    downloadTitle: "Qaysi formatda yuklash",

    pngStandard: "PNG, 1024 px",

    pngLarge: "PNG, 2048 px, chop etish uchun",

    svg: "SVG, istalgan oʻlchamda aniq",
  },
};

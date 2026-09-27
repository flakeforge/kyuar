export const en = {
  input: {
    label: "Text or link",
    placeholder: "kyuar.app",
  },
  preview: {
    label: "QR code preview",
    tooLong: "This is too much text for one QR code. Shorten it or lower error correction.",
    lowContrast: "Colors are too close. Phones may not read this code.",

    empty: "Type a link or text to make a code.",

    tightMargin: "A border under 2 can stop phones from finding the code.",
  },
  rows: {
    color: "Color",
    margin: "Border",
    corners: "Corners",
    pixels: "Pixels",
    pupils: "Corner dots",
    eyes: "Corner frames",
    markers: "Small squares",
    strength: "Error correction",
    logo: "Logo",
    picture: "Picture",
  },
  options: {
    random: "Random",
    none: "None",
    small: "Small",
    standard: "Standard",
    large: "Large",
    round: "Round",
    extraRound: "Extra round",
    markersPixels: "Like pixels",
    markersEyes: "Like corners",
    eccL: "Low, 7%",
    eccM: "Medium, 15%",
    eccQ: "High, 25%",
    eccH: "Maximum, 30%",
    eccHint: "Higher levels survive damage and logos but make the code denser.",
    boost: "Raise it when there is room",

    logoLocksEcc: "A logo needs maximum error correction. Remove the logo to pick another level.",
  },
  color: {
    themes: "Themes",
    element: "Part",
    background: "Background",
    pixels: "Pixels",
    eyes: "Corner frames",
    pupils: "Corner dots",
    markers: "Small squares",
    timing: "Dotted lines",
    solid: "Solid",
    linear: "Linear",
    radial: "Radial",
    angle: "Angle",
    from: "Start",
    to: "End",
    swatches: "Colors",
    custom: "Custom color",
    lightness: "Lightness",
    chroma: "Saturation",
    hue: "Hue",
    hex: "Hex",
    scans: "Scans well",
    tooLow: "Too low to scan",

    customTab: "Custom",
  },
  image: {
    logoHint: "Placed in the center. Error correction switches to high.",
    logoSize: "Logo size",
    pictureHint: "The picture is drawn with the code itself.",
    centerSize: "Dot size",
    contrast: "Contrast",
    choose: "Choose image",
    replace: "Replace",
    remove: "Remove",
    unreadable: "This file could not be read as an image.",
    off: "Off",
  },
  actions: {
    download: "Download",
    share: "Share",
    surprise: "Surprise me",
    sharing: "Preparing…",
    downloadFailed: "Download failed. Try again.",
    shareFailed: "Could not share. Try again.",
    shareUnavailable: "Open kyuar in Telegram to share.",

    downloaded: "Saved",

    surprised: "New style",

    undo: "Undo",
  },
} as const;

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Messages = Widen<typeof en>;

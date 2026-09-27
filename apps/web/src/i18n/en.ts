export const en = {
  input: {
    label: "Text or link",
    placeholder: "Paste a link or text",

    paste: "Paste",

    clear: "Clear",
  },
  preview: {
    label: "QR code preview",
    tooLong: "This is too much text for one QR code. Shorten it or lower error correction.",
    tooLongLogo: "Too much text for one code with a logo. Remove the logo or shorten the text.",
    lowContrast: "Colors are too close. Phones may not read this code.",
    empty: "Type a link or text to make a code.",
    tightMargin: "A thin or missing border can stop phones from finding the code.",
  },
  rows: {
    color: "Color",
    margin: "Border",
    corners: "Corners",
    pixels: "Pixels",
    pupils: "Corner dots",
    eyes: "Corner frames",
    markers: "Alignment marks",
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

    more: "More shapes",

    fewerShapes: "Fewer shapes",

    needsBorder: "Needs a border",
  },
  color: {
    themes: "Themes",
    element: "Part",
    background: "Background",
    pixels: "Pixels",
    eyes: "Corner frames",
    pupils: "Corner dots",
    markers: "Alignment marks",
    timing: "Dotted lines",
    solid: "Solid",
    linear: "Linear",
    radial: "Radial",
    angle: "Angle",
    from: "Start",
    to: "End",
    swatches: "Colors",
    hue: "Hue",
    scans: "Scans well",
    tooLow: "Too low to scan",
    customTab: "Custom",
    area: "Saturation and brightness",
    eyedropper: "Pick a color from the screen",
    format: "Color format",
    value: "Color value",
    darkBackground: "Dark background",
    advanced: "Advanced",
    fewer: "Fewer options",
    base: "Main color",
    autoHint: "Other colors follow from this one and always scan.",

    fill: "Fill",

    editedParts: "Changing the main color replaces the colors you set for each part.",
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

    downloadTitle: "Download as",

    pngStandard: "PNG, 1024 px",

    pngLarge: "PNG, 2048 px for print",

    svg: "SVG, sharp at any size",
  },
} as const;

type Widen<T> = { -readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Messages = Widen<typeof en>;

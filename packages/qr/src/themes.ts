export interface QrTheme {
  id: string;
  name: string;
  foreground: string;
  background: string;
}

export const THEMES: readonly QrTheme[] = [
  {
    id: "electric",
    name: "Electric",
    foreground: "#ffffff",
    background: "#2547ff",
  },
  {
    id: "coral",
    name: "Coral",
    foreground: "#fff0f1",
    background: "#c81824",
  },
  {
    id: "lagoon",
    name: "Lagoon",
    foreground: "#062b2b",
    background: "#14c4bd",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    foreground: "#2b2100",
    background: "#ffd21e",
  },
  {
    id: "forest",
    name: "Forest",
    foreground: "#f2fff6",
    background: "#06703c",
  },
  {
    id: "grape",
    name: "Grape",
    foreground: "#fdf2ff",
    background: "#8b2fd6",
  },
  {
    id: "ink",
    name: "Ink",
    foreground: "#ffffff",
    background: "#111111",
  },
  {
    id: "blush",
    name: "Blush",
    foreground: "#4a0d2a",
    background: "#ffb3d4",
  },
] as const;

export const DEFAULT_THEME = THEMES[0] as QrTheme;

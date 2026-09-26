import type { QrTheme } from "./types";

export const THEMES: readonly QrTheme[] = [
  {
    id: "electric",
    name: "Electric",
    foreground: "#ffffff",
    background: "#2547ff",
    surface: "#a8b7ff",
  },
  {
    id: "coral",
    name: "Coral",
    foreground: "#fff0f1",
    background: "#c81824",
    surface: "#f2a3a7",
  },
  {
    id: "lagoon",
    name: "Lagoon",
    foreground: "#062b2b",
    background: "#14c4bd",
    surface: "#8ee3df",
  },
  {
    id: "sunflower",
    name: "Sunflower",
    foreground: "#2b2100",
    background: "#ffd21e",
    surface: "#ffe98a",
  },
  {
    id: "forest",
    name: "Forest",
    foreground: "#f2fff6",
    background: "#06703c",
    surface: "#93d9b3",
  },
  {
    id: "grape",
    name: "Grape",
    foreground: "#fdf2ff",
    background: "#8b2fd6",
    surface: "#cba3ea",
  },
  {
    id: "ink",
    name: "Ink",
    foreground: "#ffffff",
    background: "#111111",
    surface: "#9a9a9a",
  },
  {
    id: "blush",
    name: "Blush",
    foreground: "#4a0d2a",
    background: "#ffb3d4",
    surface: "#ffe0ee",
  },
] as const;

export const DEFAULT_THEME = THEMES[0] as QrTheme;

export function findTheme(id: string): QrTheme | undefined {
  return THEMES.find((theme) => theme.id === id);
}

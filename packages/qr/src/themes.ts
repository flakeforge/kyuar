export interface QrTheme {
  id: string;
  name: string;
  foreground: string;
  background: string;
}

export const THEMES: readonly QrTheme[] = [
  { id: "lilac", name: "Lilac", foreground: "#2b1d45", background: "#cdbcec" },
  { id: "mint", name: "Mint", foreground: "#0f3b2a", background: "#b9e6cf" },
  { id: "sky", name: "Sky", foreground: "#0f2a4a", background: "#bdd9f5" },
  { id: "peach", name: "Peach", foreground: "#4a1f06", background: "#f7caa9" },
  { id: "sand", name: "Sand", foreground: "#3a2e12", background: "#ece0c4" },
  { id: "blush", name: "Blush", foreground: "#4a0d2a", background: "#f6c3d4" },
  { id: "grape", name: "Grape", foreground: "#f3e8ff", background: "#5b1f7a" },
  { id: "electric", name: "Electric", foreground: "#ffffff", background: "#2547ff" },
  { id: "forest", name: "Forest", foreground: "#f2fff6", background: "#06703c" },
  { id: "coral", name: "Coral", foreground: "#fff0f1", background: "#c81824" },
  { id: "ink", name: "Ink", foreground: "#ffffff", background: "#111111" },
  { id: "ember", name: "Ember", foreground: "#ff6b00", background: "#0b0b0c" },
] as const;

export const DEFAULT_THEME = THEMES[0] as QrTheme;

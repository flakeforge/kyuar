export interface TelegramWebApp {
  initData: string;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  isExpanded: boolean;
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (version: string) => boolean;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  requestFullscreen?: () => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  switchInlineQuery?: (query: string, chatTypes?: string[]) => void;
  shareMessage?: (id: string, callback?: (sent: boolean) => void) => void;
  downloadFile?: (
    params: { url: string; file_name: string },
    callback?: (accepted: boolean) => void,
  ) => void;
  showScanQrPopup?: (params: { text?: string }, callback?: (data: string) => boolean) => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getWebApp(): TelegramWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  return window.Telegram?.WebApp;
}

export function isInsideTelegram(): boolean {
  const app = getWebApp();
  return Boolean(app?.initData);
}

export function haptic(kind: "select" | "impact" | "success" = "select") {
  const feedback = getWebApp()?.HapticFeedback;
  if (!feedback) return;

  if (kind === "select") feedback.selectionChanged();
  else if (kind === "impact") feedback.impactOccurred("medium");
  else feedback.notificationOccurred("success");
}

import { resolveLocale } from "@kyuar/shared";
import "@kyuar/ui/globals.css";
import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import { headers } from "next/headers";

import { AppToaster } from "~/components/app-toaster";
import { MessagesProvider } from "~/i18n";
import { TELEGRAM_BOOT_SCRIPT } from "~/lib/telegram-boot";

const display = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-unbounded",
});

const sans = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-onest",
});

export const metadata: Metadata = {
  title: "kyuar",
  description: "QR codes that live inside Telegram",
  applicationName: "kyuar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    title: "kyuar",
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "overlays-content",
  viewportFit: "cover",
  themeColor: "#f9f7fd",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale((await headers()).get("accept-language"));

  return (
    <html lang={locale} className={`${display.variable} ${sans.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: TELEGRAM_BOOT_SCRIPT }} />
      </head>
      <body>
        <MessagesProvider locale={locale}>
          <AppToaster>{children}</AppToaster>
        </MessagesProvider>
      </body>
    </html>
  );
}

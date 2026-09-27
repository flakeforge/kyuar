import { resolveLocale } from "@kyuar/shared";
import "@kyuar/ui/globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

import { AppToaster } from "~/components/app-toaster";
import { MessagesProvider } from "~/i18n";

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
    <html lang={locale}>
      <body>
        <MessagesProvider locale={locale}>
          <AppToaster>{children}</AppToaster>
        </MessagesProvider>
      </body>
    </html>
  );
}

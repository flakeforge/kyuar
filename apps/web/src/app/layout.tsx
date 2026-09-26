import { resolveLocale } from "@kyuar/shared";
import "@kyuar/ui/globals.css";
import { Toaster } from "@kyuar/ui/components/toast";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";

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
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0B0B0C",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = resolveLocale((await headers()).get("accept-language"));

  return (
    <html lang={locale}>
      <body>
        <MessagesProvider locale={locale}>
          <Toaster>{children}</Toaster>
        </MessagesProvider>
      </body>
    </html>
  );
}

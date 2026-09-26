import { Toaster } from "@kyuar/ui/components/toast";
import "@kyuar/ui/globals.css";
import type { Metadata, Viewport } from "next";

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster>{children}</Toaster>
      </body>
    </html>
  );
}

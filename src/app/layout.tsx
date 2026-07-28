import type { Metadata, Viewport } from "next";
import { Anton, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PWAInstaller } from "@/components/ohho/PWAInstaller";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "OHHO BURGERS — Live Premium | OHHO Food Ventures",
  description:
    "OHHO BURGERS — India's fastest-growing premium QSR franchise. Order burgers, pizzas, sandwiches & shakes online. Real-time delivery tracking. By OHHO Food Ventures.",
  keywords: [
    "OHHO Burgers",
    "OHHO Food Ventures",
    "OHHO Foods",
    "QSR franchise India",
    "premium burgers",
    "food cart franchise",
    "online food ordering",
  ],
  authors: [{ name: "OHHO Food Ventures" }],
  manifest: "/manifest.json",
  applicationName: "OHHO BURGERS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OHHO BURGERS",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/ohho-images/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/ohho-images/ohho-logo-sm.png", sizes: "128x128", type: "image/png" },
      { url: "/ohho-images/ohho-logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/ohho-images/ohho-logo.png", sizes: "512x512", type: "image/png" }],
    shortcut: "/ohho-images/favicon.png",
  },
  openGraph: {
    title: "OHHO BURGERS — Live Premium",
    description:
      "Premium burgers, pizzas, sandwiches & shakes. Real-time delivery tracking. By OHHO Food Ventures.",
    url: "https://www.ohhofoods.com",
    siteName: "OHHO BURGERS",
    type: "website",
    images: [{ url: "/ohho-images/ohho-logo-full.png", width: 1024, height: 493, alt: "OHHO BURGERS" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6a00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${anton.variable} ${manrope.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
        <PWAInstaller />
      </body>
    </html>
  );
}

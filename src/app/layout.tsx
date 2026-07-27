import type { Metadata } from "next";
import { Anton, Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

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
  icons: {
    icon: "https://www.ohhofoods.com/assets/logo-D2O7IJJE.png",
  },
  openGraph: {
    title: "OHHO BURGERS — Live Premium",
    description:
      "Premium burgers, pizzas, sandwiches & shakes. Real-time delivery tracking. By OHHO Food Ventures.",
    url: "https://www.ohhofoods.com",
    siteName: "OHHO BURGERS",
    type: "website",
  },
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
      </body>
    </html>
  );
}

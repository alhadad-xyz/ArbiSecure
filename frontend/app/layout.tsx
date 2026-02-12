import type { Metadata } from "next";
import { Inter, Playfair_Display, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import DevTools from "@/components/DevTools";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-space-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ArbiSecure - Trustless Freelance Escrow",
  description: "Secure, low-cost escrow platform powered by Arbitrum Stylus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} antialiased bg-background-light dark:bg-background-dark text-gray-900 dark:text-white transition-colors duration-300`}
      >
        <Providers>{children}</Providers>
        <DevTools />
      </body>
    </html>
  );
}

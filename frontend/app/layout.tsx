import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Stellar Web3 Treasury Dashboard",
  description: "Web3 Treasury Dashboard built on Stellar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col relative pb-24">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Navbar />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

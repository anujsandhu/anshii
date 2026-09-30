import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy 19th Birthday, Anshika ✨ | Built with ❤️ by Anuj",
  description:
    "A personal, interactive birthday experience for Anshika turning 19. Crafted with code by Anuj.",
  keywords: ["Anshika", "19th Birthday", "CS Student", "Birthday Website", "Anuj"],
  authors: [{ name: "Anuj" }],
  openGraph: {
    title: "Happy 19th Birthday, Anshika ✨",
    description: "Someone had to make you a website instead of just sending a birthday text.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#080b11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth`}
    >
      <body className="min-h-screen bg-[#080b11] text-zinc-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}

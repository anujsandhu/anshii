import type { Metadata, Viewport } from "next";
import { Caveat, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import LeavePageGuard from "@/components/LeavePageGuard";

const caveat = Caveat({
  variable: "--font-handwriting",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Happy 19th Birthday, Anshika ✨ | Made with ❤️ by Anuj",
  description:
    "A cute, handmade digital birthday scrapbook & interactive card for Anshika's 19th birthday.",
  keywords: ["Anshika", "19th Birthday", "Birthday Card", "Scrapbook", "Anuj"],
  authors: [{ name: "Anuj" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f2",
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
      className={`${caveat.variable} ${plusJakarta.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#faf7f2] text-[#3f2e24] font-sans selection:bg-[#fda4af]/40 selection:text-[#7f1d1d] antialiased overflow-x-hidden">
        <LeavePageGuard />
        {children}
      </body>
    </html>
  );
}

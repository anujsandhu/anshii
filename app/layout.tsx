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
  title: "SECURITY WARNING // ACCESS RESTRICTED",
  description: "Access to this system is restricted until 28 October 2026.",
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

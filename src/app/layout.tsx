import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "NEXTURN | Placement Cell",
  description: "The official web platform for Nexturn, the unified Internship and Placement Cell at the Institute of Innovation in Technology & Management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <CustomCursor />
        <Navigation />
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  );
}

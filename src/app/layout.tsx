import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CircleProvider } from "@/lib/circle-store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocCircle — Find doctors through people you trust",
  description:
    "Doctor discovery with a peer-trust layer. See anonymous first-hand experiences and community signals before choosing where to go.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CircleProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CircleProvider>
      </body>
    </html>
  );
}

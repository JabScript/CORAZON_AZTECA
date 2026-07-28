import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { fontHeading, fontBody, fontDisplay, fontAccent, fontBodyAlt } from "./styles/fonts";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import { SessionProvider } from "./lib/auth/SessionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corazón Azteca",
  description: "Cuando el cuerpo se rinde, el corazón pelea.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fontHeading.variable} ${fontBody.variable} ${fontDisplay.variable} ${fontAccent.variable} ${fontBodyAlt.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <Header />
          {children}
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

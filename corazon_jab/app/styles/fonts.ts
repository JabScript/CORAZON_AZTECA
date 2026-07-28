import { Playfair_Display, Oswald, Anton, Bungee, Barlow } from "next/font/google";

export const fontHeading = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

export const fontBody = Oswald({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const fontDisplay = Anton({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

export const fontAccent = Bungee({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-accent",
});

export const fontBodyAlt = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body-alt",
});

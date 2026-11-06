import { Bricolage_Grotesque, IBM_Plex_Sans_Arabic, Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const fontSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// Fallback for Arabic glyphs in every stack; not preloaded, so FR/EN pages never download it.
export const fontArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = `${fontDisplay.variable} ${fontSerif.variable} ${fontMono.variable} ${fontArabic.variable}`;

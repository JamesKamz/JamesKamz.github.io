import { Bricolage_Grotesque, Instrument_Serif, JetBrains_Mono } from "next/font/google";

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

export const fontVariables = `${fontDisplay.variable} ${fontSerif.variable} ${fontMono.variable}`;

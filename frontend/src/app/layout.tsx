import type { Metadata } from "next";
import { DM_Serif_Display, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "OPNTUS – Open To Us | Anonymous Emotional Support",
  description:
    "A safe, anonymous space where you can share thoughts, feelings, and struggles without fear of judgment. Talk to trained human listeners — no account required.",
  keywords: ["anonymous support", "emotional support", "mental health", "listener", "talk to someone"],
  openGraph: {
    title: "OPNTUS – Open To Us",
    description: "Safe anonymous emotional support. Real humans. Real listening.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans antialiased bg-white dark:bg-[#12111A] text-slate-800 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
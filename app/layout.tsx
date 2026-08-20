import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Atmosphere — Weather Dashboard",
  description: "Real-time glassmorphic weather dashboard with dynamic forecasts and interactive analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body className={`${outfit.className} antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}


import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://weather-dashboard.vercel.app";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Atmosphere — Live Weather Dashboard & Forecasts",
    template: "%s | Atmosphere Weather",
  },
  description:
    "Real-time glassmorphic weather dashboard featuring live condition updates, interactive 24-hour charts, 5-day forecasts, unit switching, and an interactive world map selector.",
  keywords: [
    "weather dashboard",
    "real time weather",
    "weather forecast",
    "temperature chart",
    "interactive weather map",
    "geolocation weather",
    "humidity meter",
    "wind speed",
    "weather analytics",
  ],
  authors: [{ name: "Atmosphere Weather Team" }],
  creator: "Atmosphere Weather",
  publisher: "Atmosphere Weather",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Atmosphere — Live Weather Dashboard & Interactive Forecasts",
    description:
      "Explore real-time weather, 24-hour temperature trends, extended 5-day forecasts, and an interactive location map selector.",
    siteName: "Atmosphere Weather",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atmosphere — Live Weather Dashboard & Interactive Forecasts",
    description:
      "Explore real-time weather, 24-hour temperature trends, extended 5-day forecasts, and an interactive location map selector.",
    creator: "@atmosphereapp",
  },
  alternates: {
    canonical: siteUrl,
  },
};

// JSON-LD Schema.org Structured Data
const jsonLdData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Atmosphere Weather Dashboard",
  url: siteUrl,
  description:
    "Real-time weather dashboard with interactive charts, 5-day forecasts, and world map selection.",
  applicationCategory: "WeatherApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Atmosphere Weather",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body
        className={`${outfit.className} antialiased bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500 selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}

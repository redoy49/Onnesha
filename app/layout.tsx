import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/footer";

const solaimanLipi = localFont({
  src: [
    {
      path: "./fonts/SolaimanLipi_22-02-2012.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/SolaimanLipi_Bold_10-03-12.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-solaiman-lipi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Onnesha :: Next Generation AI-Powered Tech Blog",
  description:
    "A modern, production-ready personal blogging platform and tech publication featuring AI-assisted writing tools, high-contrast design systems, and deep software engineering dispatches.",
  keywords: [
    "AI Blogging",
    "Next.js Blog",
    "UX Design",
    "Web Engineering",
    "Prompt Engineering",
    "Design Systems",
    "Onnesha",
  ],
  authors: [{ name: "Elena Rostova" }],
  icons: {
    icon: "/onnesha_logo.png",
    shortcut: "/onnesha_logo.png",
    apple: "/onnesha_logo.png",
  },
  openGraph: {
    title: "Onnesha :: Next Generation Tech Blog",
    description: "AI-Powered Personal Blog & Systems Architecture",
    url: "https://onneshax.vercel.app",
    siteName: "Onnesha",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Onnesha Blog Cover",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onnesha :: Next Generation Tech Blog",
    description: "AI-Powered Personal Blog & Systems Architecture",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Onnesha",
    url: "https://onneshax.vercel.app",
    description: "AI-Powered Personal Tech Blog & Systems Architecture",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://onneshax.vercel.app/?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="bn" className={solaimanLipi.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-surface-canvas text-slate-800 font-sans antialiased min-h-screen flex flex-col bg-mesh-glow selection:bg-lime-200 selection:text-lime-950">
        <Providers>
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/toast";
import { ThemeProvider } from "@/components/theme-context";
import { AuthProvider } from "@/components/auth-context";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { PaletteModal } from "@/components/palette-modal";
import { Footer } from "@/components/footer";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-outfit",
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
  openGraph: {
    title: "Onnesha :: Next Generation Tech Blog",
    description: "AI-Powered Personal Blog & Systems Architecture",
    url: "https://onnesha.vercel.app",
    siteName: "Onnesha",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "Onnesha Blog Cover",
      },
    ],
    locale: "en_US",
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
  return (
    <html lang="en" className={outfit.variable}>
      <body className="bg-surface-canvas text-slate-800 font-sans antialiased min-h-screen flex flex-col bg-mesh-glow selection:bg-lime-200 selection:text-lime-950">
        <ToastProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
              <AdminLoginModal />
              <PaletteModal />
              <Footer />
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

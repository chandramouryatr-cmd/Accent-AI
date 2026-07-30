import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Use Sonner as the single toast system — the shadcn/ui Toaster is removed to
// avoid duplicate notifications and redundant infrastructure.
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";

const bricolage = Bricolage_Grotesque({
  variable: "--font-d",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "AccentAI — Master Native-Level English",
  description:
    "Train your accent to native level with interactive micro-lessons, real-time feedback, and AI-powered pronunciation coaching.",
  keywords: [
    "AccentAI",
    "English pronunciation",
    "accent training",
    "language learning",
    "native English",
  ],
  authors: [{ name: "AccentAI" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "AccentAI",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Removed maximumScale / userScalable: false — these block accessibility zoom
  // (WCAG 2.1 SC 1.4.4 "Resize Text"), which is required for low-vision users.
  viewportFit: "cover",
  // Provide dark-mode-aware theme colors so the browser chrome matches the app.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // ThemeProvider injects the "dark" class after hydration — do NOT hardcode it
    // here, as that causes flash-of-wrong-theme for light-mode users on page load.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${dmSans.variable} ${jetbrains.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <SonnerToaster />
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

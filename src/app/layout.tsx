import type { Metadata } from "next";
import { Inter, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Characterful display face for headlines (editorial "Novus OS" direction)
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

// Monospace for "system" metadata, labels, and code-like accents
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Novus — Your personal operating system",
  description:
    "Novus is your personal operating system — an intelligent companion that helps you manage every aspect of your life from a single platform. Journal, habits, goals, finance, workouts, and AI guidance.",
  keywords: ["personal operating system", "AI life coach", "second brain", "productivity", "habits", "journal", "goals"],
  authors: [{ name: "Novus" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Novus — Your personal operating system",
    description: "An intelligent companion for your entire life.",
    type: "website",
    images: [{ url: "/logo.png", width: 128, height: 128, alt: "Novus" }],
  },
  other: {
    "theme-color": "#0a0a0b",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${display.variable} ${mono.variable} font-sans antialiased`}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

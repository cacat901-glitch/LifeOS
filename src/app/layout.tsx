import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Novus — Your personal operating system",
  description:
    "Novus is your personal operating system — an intelligent companion that helps you manage every aspect of your life from a single platform. Journal, habits, goals, finance, workouts, and AI guidance.",
  keywords: ["personal operating system", "AI life coach", "second brain", "productivity", "habits", "journal", "goals"],
  authors: [{ name: "Novus" }],
  openGraph: {
    title: "Novus — Your personal operating system",
    description: "An intelligent companion for your entire life.",
    type: "website",
  },
  other: {
    "theme-color": "#06060a",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
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

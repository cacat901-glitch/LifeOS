import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LifeOS - Your Personal Operating System",
  description:
    "One app to run your entire life. Journal, habits, goals, workouts, mood tracking, and more — all in one premium platform.",
  keywords: ["productivity", "habits", "journal", "goals", "workout tracker", "mood tracking"],
  authors: [{ name: "LifeOS" }],
  openGraph: {
    title: "LifeOS - Your Personal Operating System",
    description: "One app to run your entire life.",
    type: "website",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuGen AI — Instant Technical Documentation",
  description:
    "Upload your repository and get AI-generated README, API docs, setup guides, architecture summaries, and more. Powered by free AI models.",
  keywords: [
    "documentation generator",
    "AI",
    "README",
    "API docs",
    "code analysis",
  ],
  openGraph: {
    title: "DocuGen AI — Instant Technical Documentation",
    description:
      "Upload your repository and get AI-generated technical documentation in seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#08090d] text-[#e4e4e7]">
        {/* Animated gradient background */}
        <div className="animated-gradient-bg" aria-hidden="true" />

        {/* Grid pattern overlay */}
        <div
          className="fixed inset-0 grid-pattern pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* Main content */}
        <ToastProvider>
          <main className="relative z-10 flex-1">{children}</main>
        </ToastProvider>

        {/* Vercel Analytics */}
        <Analytics />
      </body>
    </html>
  );
}
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeiq.ai",
  ),
  title: {
    default: "ResumeIQ AI — Beat the ATS, Land the Interview",
    template: "%s · ResumeIQ AI",
  },
  description:
    "An AI-powered resume analyzer that scores your resume, matches it to job descriptions, and tells you exactly what to fix. Local-first. Private. Free.",
  keywords: [
    "ATS resume checker",
    "resume analyzer",
    "resume score",
    "job description match",
    "resume keywords",
  ],
  authors: [{ name: "ResumeIQ" }],
  openGraph: {
    type: "website",
    title: "ResumeIQ AI — Beat the ATS, Land the Interview",
    description:
      "Score your resume, match it to any job description, and get actionable suggestions — all in your browser.",
    siteName: "ResumeIQ AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeIQ AI",
    description: "Beat the ATS. Land the interview.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

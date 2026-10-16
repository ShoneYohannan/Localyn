import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Localyn — AI Local Business Intelligence & Growth Engine",
  description: "Unified AI-powered local presence audit, competitor benchmarking, Google Business Profile optimization, review sentiment analysis, and approval-gated automation workflows.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-[#070a11] text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmogSense | Air Quality Forecast & Household Advice",
  description: "Air-quality model forecasts, pollutant trends, and practical household guidance.",
  keywords: ["Air Quality", "SmogSense"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmogSense | Urban Air Quality & Daily Action Guide",
  description: "SmogSense is an urban air quality assistant providing real-time risk summaries, hourly forecasts, personalized household health advisories, and sustainable daily habits.",
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

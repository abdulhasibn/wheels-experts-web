import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics-provider";
import { isIndexable } from "@/lib/site-env";
import { INK, themeInitScript } from "@/lib/theme-config";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wheels Experts — Pre-owned cars, honestly inspected",
  description:
    "Hand-picked pre-owned cars with verified papers, checked service history and full disclosure. Buy or sell your car with Wheels Experts.",
  openGraph: {
    title: "Wheels Experts",
    description: "Pre-owned. Perfected. Hand-picked cars, honestly inspected.",
    type: "website",
    locale: "en_IN",
  },
  robots: isIndexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: INK.dark,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={jakarta.variable} suppressHydrationWarning>
      <head>
        {/*
          Plain blocking script so a saved light choice applies before first paint.
          next/script's beforeInteractive queues inline code until hydration, which
          would flash dark. React logs a dev-only warning about this tag; it is harmless
          (the staff app uses the same pattern).
        */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="grain overflow-x-clip">
        {children}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { AnalyticsProvider } from "@/components/analytics-provider";
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
};

export const viewport: Viewport = {
  themeColor: "#0a1211",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" className={jakarta.variable}>
      <body className="grain overflow-x-clip">
        {children}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
      </body>
    </html>
  );
}

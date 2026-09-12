import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { MessProvider } from "@/context/MessContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mess Management System — Hostel & Mess Cost Splitting & Meal Voting",
  description: "Automate meal counting, daily market expenses, bKash deposits, meal rate calculations, WhatsApp poll sharing, and monthly PDF/Excel reporting for shared living messes.",
  keywords: ["Mess Management", "Hostel Meal Rate", "Cost Splitting", "bKash Deposit", "WhatsApp Meal Poll", "Monthly Mess Report"],
  manifest: "/manifest.json",
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-slate-100 antialiased`}>
        <LanguageProvider>
          <MessProvider>{children}</MessProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

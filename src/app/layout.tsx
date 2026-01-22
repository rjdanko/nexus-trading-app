import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus Trading Hub | Professional Trading Journal",
  description: "All-in-one web dashboard for traders. Consolidate news, risk management, and journaling into a secure workspace.",
  keywords: ["trading", "journal", "forex", "risk management", "trading analytics"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

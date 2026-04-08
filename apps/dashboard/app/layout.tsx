import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Throttlr — Rate Limiter Dashboard",
  description:
    "Self-hostable rate limiter as a service. Manage rules, monitor traffic, and protect your APIs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* TODO: Add ThemeProvider, ToastProvider, and AuthProvider here */}
        {children}
      </body>
    </html>
  );
}

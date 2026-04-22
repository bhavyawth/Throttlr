import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Throttlr — Rate Limiter",
  description: "Protect any API in 3 lines of code.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#22c55e",
          colorText: "#ffffff",
          colorTextSecondary: "#a1a1aa",
          colorInputText: "#ffffff",
          colorInputBackground: "#111111",
          colorBackground: "#111111",
          colorDanger: "#ef4444",
          colorSuccess: "#22c55e",
        },
        elements: {
          formButtonPrimary: {
            backgroundColor: "#22c55e",
            color: "#000000",
            fontWeight: "600",
          },
          formFieldInput: {
            backgroundColor: "#0a0a0a",
            color: "#ffffff",
            borderColor: "#333333",
          },
          formFieldLabel: {
            color: "#ffffff",
          },
          formFieldInputPlaceholder: {
            color: "#999999",
          },
          formFieldHintText: {
            color: "#a1a1aa",
          },
          formFieldInfoText: {
            color: "#a1a1aa",
          },
          headerTitle: {
            color: "#ffffff",
          },
          headerSubtitle: {
            color: "#a1a1aa",
          },
          socialButtonsBlockButton: {
            color: "#ffffff",
          },
          socialButtonsBlockButtonText: {
            color: "#ffffff",
          },
          dividerText: {
            color: "#888888",
          },
          dividerLine: {
            backgroundColor: "#333333",
          },
          footerActionLink: {
            color: "#22c55e",
          },
          footerActionText: {
            color: "#a1a1aa",
          },
          identityPreviewText: {
            color: "#ffffff",
          },
          formFieldAction: {
            color: "#22c55e",
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={`dark ${inter.className}`}>
        <body className="font-sans antialiased bg-[#0a0a0a] text-white min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

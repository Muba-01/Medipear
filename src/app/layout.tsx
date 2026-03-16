import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AccountLinkPrompt from "@/components/layout/AccountLinkPrompt";
import OnboardingGate from "@/components/layout/OnboardingGate";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "Medipear — Web3 Community",
  description:
    "The decentralized community platform for Web3 builders, researchers, and explorers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
  const key = "medipear-theme";
  const stored = localStorage.getItem(key);
  const theme = stored === "light" || stored === "dark" ? stored : "dark";
  document.documentElement.setAttribute("data-theme", theme);
})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <SessionProviderWrapper>
            <AuthProvider>
              <OnboardingGate />
              <Navbar />
              <AccountLinkPrompt />
              <main className="min-h-screen pt-14">{children}</main>
            </AuthProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

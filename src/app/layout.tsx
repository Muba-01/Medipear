import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "MedPear — Web3 Community",
  description:
    "The decentralized community platform for Web3 builders, researchers, and explorers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-14">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

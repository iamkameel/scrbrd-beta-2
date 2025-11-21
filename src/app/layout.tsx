import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SCRBRD | Premium Cricket Management",
  description: "Advanced cricket management platform for teams, players, and matches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '2rem 3rem', marginLeft: '260px', maxWidth: '1600px' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

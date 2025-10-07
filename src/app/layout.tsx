import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Optional: improves loading performance
});

export const metadata: Metadata = {
  title: "Leastric",
  description: "Leastric - “Your Smart Electricity Solution“",
  icons: {
    icon: "/resources/images/logo/leastric-logo-small.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <div className="flex min-h-screen max-w-screen">
          <main className="flex-1 bg-gray-100">{children}</main>
        </div>
      </body>
    </html>
  );
}

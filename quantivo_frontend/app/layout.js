import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Quantivo — Business Intelligence for Modern Commerce",
  description:
    "Track inventory, manage orders, and analyze profit in real time. The operating system for your business.",
  keywords: ["inventory management", "business analytics", "profit tracking", "orders"],
  openGraph: {
    title: "Quantivo",
    description: "The operating system for your business.",
    type: "website",
  },
  icons: {
    icon: "/logo.png", // This points to app/logo.png
    apple: "/logo.png", // For mobile users who bookmark your site
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-[#fafafa]`}
      >
        {children}
      </body>
    </html>
  );
}
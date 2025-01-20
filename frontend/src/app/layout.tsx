"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react"; // 引入 SessionProvider
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 匯入 Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [navbarHeight, setNavbarHeight] = useState(0);

  useEffect(() => {
    // 動態計算 Navbar 的高度
    const navbar = document.querySelector("nav");
    if (navbar) {
      setNavbarHeight(navbar.offsetHeight);
    }
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 包裹整個應用的 SessionProvider */}
        <SessionProvider>
          {/* 固定 Navbar */}
          <Navbar />
          {/* 主內容：根據 Navbar 高度設置 margin */}
          <main
            style={{ marginTop: navbarHeight ? `${navbarHeight}px` : "4rem" }}
          >
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}

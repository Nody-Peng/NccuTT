"use client";

import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // 匯入你的 Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 不顯示 Navbar 的路徑
const noNavbarRoutes = [
  "/",              // 首頁
  "/forgot-password",
  "/login",
  "/signup",
  "/reset-password",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [navbarHeight, setNavbarHeight] = useState(0);

  // 判斷當前路徑是否需要隱藏 Navbar
  const shouldHideNavbar = noNavbarRoutes.includes(pathname);

  useEffect(() => {
    // 如果要顯示 Navbar，才動態計算它的高度
    if (!shouldHideNavbar) {
      const navbar = document.querySelector("nav");
      if (navbar) {
        setNavbarHeight(navbar.offsetHeight);
      }
    }
  }, [shouldHideNavbar]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {/* 根據判斷條件，顯示或隱藏 Navbar */}
          {!shouldHideNavbar && <Navbar />}

          {/* 若隱藏 Navbar，主內容 marginTop 為 0；否則依照 Navbar 高度或預設 4rem */}
          <main
            style={{
              marginTop: shouldHideNavbar
                ? 0
                : navbarHeight
                ? `${navbarHeight}px`
                : "4rem",
            }}
          >
            {children}
          </main>
        </SessionProvider>
      </body>
    </html>
  );
}

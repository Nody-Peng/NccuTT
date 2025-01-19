"use client";

import { FaUserCircle } from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Navbar() {
  // ✅ 使用 next-auth 的 useSession 來取得使用者的登入狀態
  const { data: session, status } = useSession();

  // 尚未載入 Session 時的 Loading 狀態
  if (status === "loading") {
    return null; // 或顯示一個 Loading 指示器
  }

  // 如果使用者未登入，Navbar 不顯示
  if (!session) {
    console.log("User is not authenticated");
    return null;
  }

  // 使用者已登入，顯示 Navbar
  console.log("User is authenticated:", session);
  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-50 shadow-md z-50">
      {/* 第一列：搜尋欄與圖示 */}
      <div className="flex items-center justify-between p-4">
        {/* LOGO 與標題（連結至首頁） */}
        <Link
          href="/competition"
          className="flex items-center space-x-3 hover:opacity-80 transition duration-300"
        >
          <h1 className="text-xl font-semibold text-gray-800">誰敢跟我桌隊</h1>
        </Link>

        {/* 右側圖示 */}
        <div className="flex items-center space-x-4">
          {/* 使用者頭像 */}
          <Link href="/profile">
            <button className="relative group w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 shadow-sm hover:shadow-md transition duration-300 flex items-center justify-center">
              <FaUserCircle
                size={28}
                className="text-gray-600 group-hover:text-black transition duration-300"
              />
            </button>
          </Link>
        </div>
      </div>

      {/* 
      第二列：導覽連結 
      <div className="bg-white border-t flex justify-center space-x-8">
        {[{ path: "/competition", label: "比賽列表" },
          { path: "/profile", label: "個人頁面" },
          { path: "/matchScheduling", label: "安排賽程" },
        ].map(({ path, label }) => (
          <Link
            key={path}
            href={path}
            className={`relative text-gray-600 font-semibold px-4 py-2 rounded transition duration-300
              ${
                pathname === path
                  ? "text-gray-800 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gray-800"
                  : "hover:text-gray-800 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-gray-600 after:transition-all after:duration-300 hover:after:w-full"
              }`}
          >
            {label}
          </Link>
        ))}
      </div>
      */}
    </nav>
  );
}

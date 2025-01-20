import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    // <div className="relative min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="relative min-h-screen bg-gray-30 flex items-center justify-center px-4">
      {/* 背景圖樣 */}
      <div className="absolute inset-0 bg-[url('/DBMS_Background.png')] bg-cover opacity-10"></div>

      {/* 內容容器 */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between max-w-7xl w-full">
        {/* 左側文字區域 */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            桌球比賽主辦系統
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            每天練習想試試身手嗎？<br />
            快來看看最近的桌球比賽吧！
          </p>
          {/* 按鈕區域 */}
          <div className="flex justify-center lg:justify-start gap-4">
            <Link href="/login" passHref>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
                登入
              </button>
            </Link>
            <Link href="/signup" passHref>
              <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-600 hover:text-white transition">
                註冊
              </button>
            </Link>
          </div>
        </div>

        {/* 右側插圖 */}
        <div className="lg:w-full flex justify-center items-center mt-10 lg:mt-0">
          <Image
            src="/nccuTT_home.png"
            alt="手機 UI 插圖"
            width={2400}               // 提高圖片解析度
            height={1200}              // 等比例放大
            unoptimized                // 關閉圖片優化，完整呈現圖片
            className="w-[1200px] h-auto lg:w-[1600px] ml-40"  // 放大圖片寬度
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // ✅ 處理手動登入
  const handleManualLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // First, make the call to your custom API endpoint
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "登入失敗，請檢查您的帳號或密碼");
      }

      // If custom API call succeeds, trigger NextAuth session creation
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      // Only redirect on success
      router.push("/competition");
      router.refresh(); // Refresh to update session state
    } catch (err: any) {
      setError(err.message || "登入失敗，請稍後再試");
    }
  };

  // ✅ Google OAuth 登入
  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/competition" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          登入
        </h2>
        <p className="text-gray-600 text-center mb-6">
          請輸入您的帳號密碼或使用 Google 登入
        </p>

        {/* 顯示錯誤訊息 */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 手動登入表單 */}
        <form onSubmit={handleManualLogin}>
          {/* 電子郵件 */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">電子郵件</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="請輸入您的電子郵件"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 密碼 */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">密碼</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入您的密碼"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 登入按鈕 */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            登入
          </button>
        </form>

        {/* 分隔線 */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <p className="mx-4 text-gray-500">或使用以下方式登入</p>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google 登入按鈕 */}
        <button
          onClick={handleGoogleLogin}
          className="flex items-center justify-center w-full border rounded py-2 text-gray-700 hover:bg-gray-100 transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          使用 Google 登入
        </button>

        {/* 註冊連結 */}
        <p className="text-gray-600 text-center mt-6 text-sm">
          還沒有帳號嗎？{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            立即註冊
          </a>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // 模擬 API 請求
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "無法發送驗證訊息，請稍後再試");
      }

      setMessage("驗證訊息已成功發送，請檢查您的電子郵件信箱。");
    } catch (err: any) {
      setError(err.message || "發送驗證訊息時出現問題，請稍後再試。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          忘記密碼
        </h2>

        {/* 提示訊息 */}
        {message && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 忘記密碼表單 */}
        <form onSubmit={handleForgotPassword}>
          {/* 電子郵件輸入框 */}
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

          {/* 提交按鈕 */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            傳送驗證訊息
          </button>
        </form>

        {/* 返回登入頁的連結 */}
        <p className="text-gray-600 text-center mt-6 text-sm">
          記得密碼了嗎？{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            返回登入頁
          </a>
        </p>
      </div>
    </div>
  );
}

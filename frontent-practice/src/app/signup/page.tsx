"use client"; // 必須加這行，因為 `signIn` 是在前端執行的

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleGoogleSignup = () => {
    signIn("google", { callbackUrl: "/competition" });  // ✅ 成功後跳轉到 /competition
  };
  
  // 處理表單提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "註冊失敗，請再試一次。");
      } else {
        setSuccess("註冊成功！正在為您登入...");
        
        // 自動登入
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("註冊成功但自動登入失敗，請手動登入。");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          router.push("/competition");
          router.refresh();
        }
      }
    } catch (err) {
      setError("伺服器錯誤，請稍後再試。");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
          註冊
        </h2>

        {/* 成功與錯誤提示 */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">{success}</p>}

        {/* 表單 */}
        <form onSubmit={handleSubmit}>
          {/* 姓名 */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">姓名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="請輸入您的姓名"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

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

          {/* 提交按鈕 */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            註冊
          </button>
        </form>

        {/* 分隔線 */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <p className="mx-4 text-gray-500">或使用以下方式註冊：</p>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google 登入按鈕 */}
        <button
          onClick={handleGoogleSignup}
          className="flex items-center justify-center w-full border rounded py-2 text-gray-700 hover:bg-gray-100 transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
            alt="Google"
            className="w-5 h-5 mr-2"
          />
          使用 Google 登入
        </button>

      </div>
    </div>
  );
}

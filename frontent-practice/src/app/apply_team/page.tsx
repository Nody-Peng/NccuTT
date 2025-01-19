"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 使用 next/navigation 提供的 useRouter
import { FiTrash2 } from "react-icons/fi"; // 垃圾桶圖示

export default function TeamForm() {
  const router = useRouter(); // 確保 router 可用於導航
  const [members, setMembers] = useState(["隊員1", "隊員2"]);
  const [category, setCategory] = useState("團體賽"); // 預設選項為 "團體賽"

  // 處理類別切換
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    // 導航至對應的報名頁面
    if (selectedCategory === "團體賽") {
      router.push("/apply_team");
    } else if (selectedCategory === "個人賽") {
      router.push("/apply_individual");
    }
  };

  // 增加隊員
  const addMember = () => {
    setMembers([...members, `隊員${members.length + 1}`]);
  };

  // 刪除最後一個隊員
  const removeLastMember = () => {
    if (members.length > 2) {
      setMembers(members.slice(0, -1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("表單已提交");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md relative">
        {/* 報名類別下拉選單 */}
        <div className="absolute top-4 left-4">
          <label htmlFor="category" className="text-gray-700 mr-2">
            報名類別：
          </label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          >
            <option value="團體賽">團體賽</option>
            <option value="個人賽">個人賽</option>
          </select>
        </div>

        {/* 標題 */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {category}報名表
        </h2>

        {/* 表單 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* 隊伍名稱 */}
          <div>
            <label className="block text-gray-700 mb-1">隊伍名稱</label>
            <input
              type="text"
              placeholder="請輸入隊伍名稱"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 隊長資訊 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              隊長資訊
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="姓名"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                placeholder="電子郵件"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                placeholder="電話號碼"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 隊員資訊 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              隊員資訊
            </h3>
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  placeholder={`請輸入${member}姓名`}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {/* 垃圾桶圖示 - 只在最後一個隊員顯示 */}
                {index === members.length - 1 && members.length > 2 && (
                  <button
                    type="button"
                    onClick={removeLastMember}
                    className="text-black hover:text-gray-600 transition"
                    aria-label="刪除隊員"
                  >
                    <FiTrash2 size={20} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addMember}
              className="flex items-center text-blue-600 hover:text-blue-800 transition"
            >
              <span className="text-xl mr-2">+</span> 新增隊員
            </button>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
            >
              提交
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

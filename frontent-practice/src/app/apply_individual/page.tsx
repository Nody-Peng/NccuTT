"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function IndividualForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    event: "",
    age: "",
    gender: "",
  });
  const [category, setCategory] = useState("個人賽");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    // 導航至對應頁面
    if (selectedCategory === "團體賽") {
      router.push("/apply_team");
    } else if (selectedCategory === "個人賽") {
      router.push("/apply_individual");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `報名成功！\n姓名: ${formData.name}\n電子郵件: ${
        formData.email
      }\n電話號碼: ${formData.phone}\n比賽項目: ${formData.event}\n年齡: ${
        formData.age || "未填寫"
      }\n性別: ${formData.gender || "未選擇"}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md relative">
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
          個人賽報名表
        </h2>

        {/* 表單 */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 姓名 */}
          <div>
            <label className="block text-gray-700 mb-1">姓名</label>
            <input
              type="text"
              name="name"
              placeholder="請輸入您的姓名"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 電子郵件 */}
          <div>
            <label className="block text-gray-700 mb-1">電子郵件</label>
            <input
              type="email"
              name="email"
              placeholder="請輸入您的電子郵件"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 電話號碼 */}
          <div>
            <label className="block text-gray-700 mb-1">電話號碼</label>
            <input
              type="tel"
              name="phone"
              placeholder="請輸入您的電話號碼"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 比賽項目 */}
          <div>
            <label className="block text-gray-700 mb-1">選擇比賽項目</label>
            <select
              name="event"
              value={formData.event}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                請選擇比賽項目
              </option>
              <option value="男子單打">男子單打</option>
              <option value="女子單打">女子單打</option>
              <option value="混合單打">混合單打</option>
            </select>
          </div>

          {/* 年齡 */}
          <div>
            <label className="block text-gray-700 mb-1">年齡 (選填)</label>
            <input
              type="number"
              name="age"
              placeholder="請輸入您的年齡"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 性別 */}
          <div>
            <label className="block text-gray-700 mb-1">性別</label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="男"
                  onChange={handleChange}
                  checked={formData.gender === "男"}
                  className="mr-2"
                />
                男
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="女"
                  onChange={handleChange}
                  checked={formData.gender === "女"}
                  className="mr-2"
                />
                女
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="不公開"
                  onChange={handleChange}
                  checked={formData.gender === "不公開"}
                  className="mr-2"
                />
                不公開
              </label>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div className="flex justify-center mt-6">
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

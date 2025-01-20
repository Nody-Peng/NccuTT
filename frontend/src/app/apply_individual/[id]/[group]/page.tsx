"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react"; // 引入 useSession

export default function IndividualForm() {
  const { data: session } = useSession(); // 獲取 session 資料
  const router = useRouter();
  const params = useParams(); // 獲取動態路由參數
  const eventId = params.id; // 活動 ID
  const division = params.group === "college" ? "大專組" : "社會組"; // 動態組別

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    event: "",
    gender: "",
    team_name: "",
  });

  const [category, setCategory] = useState("個人賽");
  const [tournament, setTournament] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const [events, setEvents] = useState([]); // 根據性別動態更新的比賽項目

  // 獲取活動資料
  useEffect(() => {
    async function fetchTournament() {
      try {
        const response = await fetch(`/api/tournaments/${eventId}`);
        if (response.ok) {
          const data = await response.json();
          setTournament({
            name: data.tournament.name,
            startDate: data.tournament.start_date,
            endDate: data.tournament.end_date,
          });
        } else {
          console.error("Failed to fetch tournament data");
        }
      } catch (error) {
        console.error("Error fetching tournament:", error);
      }
    }
    fetchTournament();
  }, [eventId]);

  // 更新比賽項目列表根據性別
  useEffect(() => {
    if (formData.gender === "男") {
      setEvents(["男子單打"]);
    } else if (formData.gender === "女") {
      setEvents(["女子單打"]);
    } else {
      setEvents([]);
    }
  }, [formData.gender]); // 當性別改變時觸發更新

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    // 根據選擇的報名類別導航
    if (selectedCategory === "個人賽") {
      router.push(`/apply_individual/${eventId}/${params.group}`);
    } else if (selectedCategory === "團體賽") {
      router.push(`/apply_team/${eventId}/${params.group}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      user_id: session?.user?.id || "mock_user_id",
      name: formData.name,
      email: formData.email,
      gender: formData.gender,
      phone: formData.phone,
      tournament_id: eventId,
      division: division,
      category: "個人賽",
      team_name: formData.team_name || null,
      event_type: formData.event,
    };

    try {
      const response = await fetch("/api/apply_individual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("報名成功！");
        router.push("/profile"); // 導航到成功頁面
      } else {
        alert("報名失敗，請稍後再試。");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("提交時發生錯誤，請稍後再試。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md relative">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()}
          className="absolute top-2 left-2 z-10 flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-full shadow-md hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
          aria-label="返回"
        >
          返回
        </button>

        {/* 報名類別下拉選單 */}
        <div className="mt-12 mb-6 flex justify-start">
          <label htmlFor="category" className="text-gray-700 mr-2">
            報名類別：
          </label>
          <select
            id="category"
            value={category}
            onChange={handleCategoryChange}
            className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100"
          >
            <option value="個人賽">個人賽</option>
            <option value="團體賽">團體賽</option>
          </select>
        </div>

        {/* 報名活動資訊 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            活動名稱：{tournament.name || "載入中..."}
          </h2>
          <p className="text-gray-600 text-center">
            日期：
            {tournament.startDate
              ? `${formatDate(tournament.startDate)} ~ ${formatDate(
                  tournament.endDate
                )}`
              : "載入中..."}
          </p>
        </div>

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

          {/* 性別 */}
          <div>
            <label className="block text-gray-700 mb-1">生理性別</label>
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
            </div>
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
              disabled={!events.length} // 當性別未選擇時禁用選項
            >
              <option value="" disabled>
                請選擇比賽項目
              </option>
              {events.map((event, index) => (
                <option key={index} value={event}>
                  {event}
                </option>
              ))}
            </select>
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

// 日期格式化函數
function formatDate(date: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };
  return new Date(date)
    .toLocaleDateString("zh-TW", options)
    .replace(/\//g, "/");
}

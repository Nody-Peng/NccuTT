"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FiTrash2 } from "react-icons/fi";

export default function TeamForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id;
  const division = params.group === "college" ? "大專組" : "社會組";

  const [members, setMembers] = useState(["", ""]);
  const [category, setCategory] = useState("團體賽");
  const [tournament, setTournament] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    phone: "",
    team_name: "",
    event_type: "",
  });

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

  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
      }));
    }
  }, [session]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);

    if (selectedCategory === "團體賽") {
      router.push(`/apply_team/${eventId}/${params.group}`);
    } else if (selectedCategory === "個人賽") {
      router.push(`/apply_individual/${eventId}/${params.group}`);
    }
  };

  // const addMember = () => {
  //   setMembers([...members, `隊員${members.length + 1}`]);
  // };
  const addMember = () => {
    setMembers([...members, ""]); // 新增一個空白的成員名稱
  };

  const removeLastMember = () => {
    if (members.length > 2) {
      setMembers(members.slice(0, -1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      alert("請先登入後再進行報名。");
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      tournament_id: eventId,
      division: division,
      team_name: formData.team_name,
      event_type: formData.event_type,
      members, // 將隊員資訊一併提交
    };

    try {
      const response = await fetch("/api/apply_team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("報名成功！");
        router.push("/profile");
      } else {
        alert(data.message || "報名失敗，請稍後再試。");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("報名發生錯誤，請稍後再試。");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-md relative">
        {/* 返回按鈕 */}
        <button
          onClick={() => router.back()} // 返回上一頁
          className="absolute top-4 left-4 z-10 flex items-center justify-center px-4 h-10 bg-transparent text-gray-600 rounded-full hover:bg-gray-200 hover:text-gray-800 transition-transform transform hover:scale-105"
          aria-label="返回"
        >
          <span className="text-xl font-bold">{`< 返回`}</span>
        </button>

        {/* 報名類別下拉選單 */}
        <div className="absolute top-16 left-4">
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

        {/* 報名活動資訊 */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            活動名稱：{tournament.name || "載入中..."}
          </h2>
          <p className="text-gray-600">
            日期：
            {tournament.startDate
              ? `${formatDate(tournament.startDate)} ~ ${formatDate(
                  tournament.endDate
                )}`
              : "載入中..."}
          </p>
        </div>

        {/* 表單 */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* 隊伍名稱 */}
          <div>
            <label className="block text-gray-700 mb-1">學校/隊伍名稱</label>
            <input
              type="text"
              name="team_name"
              value={formData.team_name}
              onChange={handleInputChange}
              placeholder="請輸入學校/隊伍名稱"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 隊長資訊 */}
          <div>
            <h3 className="block text-gray-700 mb-1">領隊(教練/隊長)資訊</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="姓名"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="電子郵件"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="電話號碼"
                className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* 比賽項目 */}
          <div>
            <label className="block text-gray-700 mb-1">選擇比賽項目</label>
            <select
              name="event_type"
              value={formData.event_type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" disabled>
                請選擇比賽項目
              </option>
              <option value="男子雙打">男子雙打</option>
              <option value="女子雙打">女子雙打</option>
              <option value="混合雙打">混合雙打</option>
              <option value="男子團體">男子團體</option>
              <option value="女子團體">女子團體</option>
              <option value="混合團體">混合團體</option>
            </select>
          </div>

          {/* 隊員資訊 */}
          <div>
            <h3 className="block text-gray-700 mb-1">隊員資訊</h3>
            {members.map((member, index) => (
              <div key={index} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  placeholder={`請輸入隊員${index + 1}姓名`}
                  value={member}
                  onChange={(e) => {
                    const updatedMembers = [...members];
                    updatedMembers[index] = e.target.value; // 更新指定隊員的名稱
                    setMembers(updatedMembers); // 更新狀態
                  }}
                  className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
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

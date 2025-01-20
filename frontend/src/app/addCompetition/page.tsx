"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 使用 next/navigation 的 useRouter

const AddCompetition = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [enrollDate, setEnrollDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [numOfTable, setNumOfTable] = useState("");

  const router = useRouter(); // 初始化 useRouter

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      title,
      description,
      enrollDate,
      startDate,
      endDate,
      location,
      numOfTable,
    };

    try {
      const response = await fetch("/api/addCompetition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        router.push("/competition"); // 新增成功後跳轉
      } else {
        const error = await response.json();
        alert(error.error);
      }
    } catch (error) {
      console.error("Error submitting competition:", error);
      alert("Failed to submit competition.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          新增比賽
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-600 mb-1">比賽名稱</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="請輸入比賽名稱"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">比賽描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="請輸入比賽描述"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              required
            ></textarea>
          </div>
          <div>
            <label className="block text-gray-600 mb-1">報名截止日期</label>
            <input
              type="date"
              value={enrollDate}
              onChange={(e) => setEnrollDate(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">開始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">結束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">比賽場地</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="請輸入比賽場地"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-1">桌數</label>
            <input
              type="number"
              value={numOfTable}
              onChange={(e) => setNumOfTable(e.target.value)}
              placeholder="請輸入桌數"
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            新增
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCompetition;

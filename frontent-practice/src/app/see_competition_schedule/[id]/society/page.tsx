"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const CompetitionSociety = () => {
  const { id } = useParams(); // 動態路由參數
  const [selectedCategory, setSelectedCategory] = useState("單打");
  const [subCategory, setSubCategory] = useState("男子單打");
  const [competitionData, setCompetitionData] = useState([]);

  const categoryEnum = {
    單打: ["男子單打", "女子單打"],
    雙打: ["男子雙打", "女子雙打", "混合雙打"],
    團體: ["男子團體", "女子團體", "混合團體"],
  };

  useEffect(() => {
    const fetchCompetitionData = async () => {
      try {
        const res = await fetch(
          `/api/competition_schedule/${id}/society?category=${selectedCategory}&subCategory=${subCategory}`
        );
        const data = await res.json();
        setCompetitionData(data);
      } catch (err) {
        console.error("載入數據錯誤:", err);
      }
    };

    fetchCompetitionData();
  }, [id, selectedCategory, subCategory]);

  return (
    <div className="min-h-screen p-6 relative">
      <div className="flex justify-center space-x-6 mb-6 mt-16">
        {Object.keys(categoryEnum).map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setSubCategory(categoryEnum[category][0]);
            }}
            className={`px-6 py-3 text-lg font-semibold border-b-2 transition-all duration-300 ${
              selectedCategory === category
                ? "border-blue-700 text-blue-700"
                : "border-gray-400 text-gray-600 hover:border-blue-700 hover:text-blue-700"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        {categoryEnum[selectedCategory].map((sub) => (
          <button
            key={sub}
            onClick={() => setSubCategory(sub)}
            className={`px-4 py-2 text-md font-medium border rounded-lg transition-all duration-300 ${
              subCategory === sub
                ? "bg-blue-700 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-blue-700 hover:text-white"
            }`}
          >
            {sub}
          </button>
        ))}
      </div>

      <table className="min-w-full bg-white rounded shadow-md">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 border-b">參賽者 A</th>
            <th className="px-6 py-3 border-b">參賽者 B</th>
            <th className="px-6 py-3 border-b">日期</th>
            <th className="px-6 py-3 border-b">場次</th>
            <th className="px-6 py-3 border-b">場地</th>
            <th className="px-6 py-3 border-b">桌號</th>
          </tr>
        </thead>
        <tbody>
          {competitionData.map((comp, index) => (
            <tr key={index} className="text-center">
              <td className="px-6 py-3 border-b">{comp.participantA}</td>
              <td className="px-6 py-3 border-b">{comp.participantB}</td>
              <td className="px-6 py-3 border-b">{comp.date}</td>
              <td className="px-6 py-3 border-b">{comp.rounds[0]}</td>{" "}
              {/* 固定顯示第一個場次 */}
              <td className="px-6 py-3 border-b">{comp.venues[0]}</td>{" "}
              {/* 固定顯示第一個場地 */}
              <td className="px-6 py-3 border-b">{comp.tables[0]}</td>{" "}
              {/* 固定顯示第一個桌號 */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CompetitionSociety;

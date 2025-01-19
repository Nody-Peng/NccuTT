"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

// ✅ 組別卡片元件
const GroupCard = ({
  title,
  description,
  link,
}: {
  title: string;
  description: string;
  link: string;
}) => {
  return (
    <Link href={link}>
      <div className="max-w-sm w-full h-64 mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-indigo-400 bg-white bg-gradient-to-r from-gray-100 to-gray-50 hover:from-indigo-50 hover:to-blue-50 transform hover:scale-105 transition duration-300 cursor-pointer">
        <h2 className="text-2xl font-extrabold text-indigo-700 mb-3">
          {title}
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed text-center whitespace-pre-wrap">
          {description}
        </p>
      </div>
    </Link>
  );
};

// ✅ 組別選擇頁面
const GroupSelection = () => {
  const { id } = useParams();  // 讀取動態路由參數 (tournament_id)
  const [groupData, setGroupData] = useState({
    college: { individual: 0, team: 0 },
    society: { individual: 0, team: 0 },
  });
  const [loading, setLoading] = useState(true);

  // ✅ 載入報名數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/grouping/${id}`);
        const data = await res.json();
        setGroupData(data);
      } catch (err) {
        console.error("載入數據錯誤:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ✅ 組別資料
  const groups = [
    {
      id: 1,
      title: "大專組",
      description: `個人賽報名人數: ${groupData.college.individual}\n團體賽報名隊數: ${groupData.college.team}`,
      link: `/apply_individual/${id}/college`,
    },
    {
      id: 2,
      title: "社會組",
      description: `個人賽報名人數: ${groupData.society.individual}\n團體賽報名隊數: ${groupData.society.team}`,
      link: `/apply_individual/${id}/society`,
    },
    {
      id: 3,
      title: "裁判組",
      description: "詳情請點選此卡片",
      link: `/apply_judge/${id}/judge`,
    },
  ];

  return (
    <div className="min-h-screen p-12">
      <h1 className="text-3xl font-bold mb-6 text-center">選擇組別</h1>

      {loading ? (
        <p className="text-center text-gray-600">載入中...</p>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              title={group.title}
              description={group.description}
              link={group.link}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupSelection;

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ✅ 賽程卡片元件（動態控制是否可點擊）
const CompetitionCard = ({ title, description, link, isPublished }) => {
  return isPublished ? (
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
  ) : (
    <div className="max-w-sm w-full h-64 mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden shadow-lg border-2 border-gray-300 bg-gray-100 cursor-not-allowed">
      <h2 className="text-2xl font-extrabold text-gray-500 mb-3">{title}</h2>
      <p className="text-gray-500 text-sm leading-relaxed text-center">
        尚未開放
      </p>
    </div>
  );
};

// ✅ 查看賽程頁面
const SearchCompetition = () => {
  const { id } = useParams(); // 取得比賽 ID
  const [loading, setLoading] = useState(true);
  const [publishStatus, setPublishStatus] = useState({}); // ✅ 儲存每個組別的發布狀態

  // ✅ 組別與對應 API 路徑
  const competitions = [
    {
      id: 1,
      title: "大專組賽程",
      link: `/competition_schedule/${id}/college`,
      division: "大專組",
    },
    {
      id: 2,
      title: "社會組賽程",
      link: `/competition_schedule/${id}/society`,
      division: "社會組",
    },
  ];

  // ✅ 載入每個組別的發布狀態
  useEffect(() => {
    const fetchPublishStatus = async () => {
      const statusData = {};

      for (const competition of competitions) {
        try {
          const res = await fetch(
            `/api/competition_schedule/publish/${id}?division=${competition.division}`
          );

          // if (!res.ok) {
          //   throw new Error(`查詢 ${competition.division} 失敗`);
          // }

          const data = await res.json();

          console.log(
            `🔍 ${competition.division} 組別發布狀態:`,
            data.is_published
          );

          // ✅ 更新對應的發布狀態
          statusData[competition.division] =
            data.is_published === 1 || data.is_published === true;
        } catch (err) {
          console.error(`錯誤: ${competition.division} 加載失敗`, err);
          // 發生錯誤時，將該組別標記為未發布
          statusData[competition.division] = false;
        }
      }

      setPublishStatus(statusData);
      setLoading(false);
    };

    fetchPublishStatus();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="p-12 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">查看賽程</h1>

        {loading ? (
          <p className="text-center text-gray-600">載入中...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-center items-center">
            {competitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                title={competition.title}
                description={""}
                link={competition.link}
                isPublished={publishStatus[competition.division]} // ✅ 動態控制是否可點擊
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchCompetition;

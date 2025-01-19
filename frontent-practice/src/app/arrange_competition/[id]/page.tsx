"use client";
import Link from "next/link";
import { useParams } from "next/navigation";

// ✅ 賽程卡片元件 (無 description)
const CompetitionCard = ({ title, link }: { title: string; link: string }) => {
  return (
    <Link href={link}>
      <div className="max-w-sm w-full h-64 mx-auto flex flex-col justify-center items-center rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-green-400 bg-white bg-gradient-to-r from-gray-100 to-gray-50 hover:from-green-50 hover:to-blue-50 transform hover:scale-105 transition duration-300 cursor-pointer">
        <h2 className="text-2xl font-extrabold text-green-700 mb-3">{title}</h2>
      </div>
    </Link>
  );
};

// ✅ 賽程安排頁面 (簡化版)
const ArrangeCompetition = () => {
  const { id } = useParams(); // 動態路由參數

  // ✅ 賽程資料 (無需 API 資料)
  const competitions = [
    {
      id: 1,
      title: "大專組賽程",
      link: `/competition_schedule/${id}/college`,
    },
    {
      id: 2,
      title: "社會組賽程",
      link: `/competition_schedule/${id}/society`,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="p-12 w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">安排賽程</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 justify-center items-center">
          {competitions.map((competition) => (
            <CompetitionCard
              key={competition.id}
              title={competition.title}
              link={competition.link}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArrangeCompetition;

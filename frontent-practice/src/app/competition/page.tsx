"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react"; // 假設使用 NextAuth
import CompetitionCard from "@/components/CompetitionCard";
import Link from "next/link";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const Competition = () => {
  const { data: session } = useSession(); // 獲取登入狀態
  const [competition, setCompetition] = useState([]);
  const [filteredCompetition, setFilteredCompetition] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("報名中");
  const [isOrganizer, setIsOrganizer] = useState(false);

  const statusEnum = {
    報名中: "報名中",
    進行中: "進行中",
    已結束: "已結束",
  };

  useEffect(() => {
    const fetchCompetition = async () => {
      if (!session?.user?.id) return; // 如果沒有 user_id，就不進行請求

      try {
        const response = await fetch(
          `/api/competition?user_id=${session.user.id}`
        );
        if (response.ok) {
          const data = await response.json();

          // 設定比賽資料
          const formattedData = data.competition.map((comp) => ({
            ...comp,
            start_date: formatDate(comp.start_date),
            end_date: formatDate(comp.end_date),
          }));
          setCompetition(formattedData);
          filterCompetition(formattedData, selectedStatus);

          // 設定使用者權限
          setIsOrganizer(data.user.is_organizer);
        } else {
          console.error("Failed to fetch competition");
        }
      } catch (error) {
        console.error("Error fetching competition:", error);
      }
    };

    fetchCompetition();
  }, [session]);

  useEffect(() => {
    filterCompetition(competition, selectedStatus);
  }, [selectedStatus, competition]);

  // 修正後的篩選邏輯
  const filterCompetition = (data, status) => {
    const filtered = data.filter((comp) => comp.status === status);
    setFilteredCompetition(filtered);
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="flex justify-center space-x-6 mb-6 mt-16">
        {Object.keys(statusEnum).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg shadow-md text-lg font-semibold ${
              selectedStatus === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } hover:bg-blue-600 hover:text-white`}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetition.map((comp) => (
          <CompetitionCard
            key={comp.tournament_id}
            title={comp.name}
            description={`日期: ${comp.start_date} ~ ${comp.end_date}\n地點: ${comp.location}`}
            link={
              comp.status === "報名中"
                ? `/GroupingCategories/${comp.tournament_id}`
                : "#"
            }
            imageSrc={comp.imageSrc || "/default_image.jpg"}
            status={comp.status}
            tournament_id={comp.tournament_id} // 傳遞 tournament_id
          />
        ))}
      </div>

      {isOrganizer && (
        <Link href="/addCompetition">
          <button className="fixed bottom-6 right-6 bg-gray-300 text-black rounded-full shadow-lg transition-all duration-500 ease-in-out flex items-center justify-center w-16 h-16 hover:w-40 hover:rounded-full hover:bg-gray-400 group">
            <span className="absolute transition-all duration-500 ease-in-out text-2xl font-bold group-hover:opacity-0">
              +
            </span>
            <span className="absolute transition-all duration-500 ease-in-out opacity-0 group-hover:opacity-100">
              新增比賽
            </span>
          </button>
        </Link>
      )}
    </div>
  );
};

export default Competition;

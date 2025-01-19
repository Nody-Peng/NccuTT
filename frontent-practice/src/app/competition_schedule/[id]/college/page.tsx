"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const CompetitionCollege = () => {
  const { id } = useParams();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("單打");
  const [subCategory, setSubCategory] = useState("男子單打");
  const [matches, setMatches] = useState([]); // 比賽資料
  const [commonInfo, setCommonInfo] = useState({ // 共用資訊
    competitionDates: [],
    sessionTimes: [],
    venues: [],
    tables: []
  });
  const [loading, setLoading] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const division = "大專組";

  const categoryEnum = {
    單打: ["男子單打", "女子單打"],
    雙打: ["男子雙打", "女子雙打", "混合雙打"],
    團體: ["男子團體", "女子團體", "混合團體"],
  };

  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) return "";
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Intl.DateTimeFormat("zh-TW", options).format(
      new Date(dateString)
    );
  };

  const handleMatchUpdate = (index, field, value) => {
    const newMatches = [...matches];
    newMatches[index] = {
      ...newMatches[index],
      [field]: value
    };
    setMatches(newMatches);
  };

  useEffect(() => {
    let isCancelled = false;
  
    const checkAndFetchData = async () => {
      if (isProcessing) return;
  
      setLoading(true);
      setError(null);
      setIsProcessing(true);
  
      try {
        const checkRes = await fetch(`/api/competition_schedule/check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournament_id: id,
            division,
            event_type: subCategory,
          }),
        });
  
        const checkData = await checkRes.json();
  
        if (checkData.error) {
          throw new Error(checkData.error);
        }
  
        if (checkData.isPublished) {
          setIsPublished(true);
        }
  
        const res = await fetch(`/api/competition_schedule/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tournament_id: id,
            division,
            event_type: subCategory,
          }),
        });
  
        // ✅ 檢查 API 是否成功回應
        if (!res.ok) {
          throw new Error(`伺服器錯誤：${res.status}`);
        }

        const data = await res.json();

        if (data && data.data) {
          setMatches(data.data.matches || []);
          setCommonInfo(data.data.info || {
            competitionDates: [],
            sessionTimes: [],
            venues: [],
            tables: []
          });
        }
        
        if (!isCancelled) {
          setMatches(data.data.matches);
          setCommonInfo(data.data.info);
        }
      } catch (err) {
        console.error("錯誤：", err);
  
        if (!isCancelled) {
          // 🚨 顯示錯誤訊息後返回上一頁
          alert(`資料載入失敗：${err.message}`);
          router.back();  // ⬅️ 回到上一頁
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setIsProcessing(false);
        }
      }
    };
  
    checkAndFetchData();
  
    return () => {
      isCancelled = true;
    };
  }, [id, selectedCategory, subCategory]);    
  
  const handleSave = async () => {
    try {
      // ✅ 儲存比賽資料，包含比賽日期和場次時間
      const updatedData = matches.map((match, index) => ({
        match_id: match.match_id,
        date: document.getElementById(`date-${index}`).value || null,              // 比賽日期
        session_time: document.getElementById(`session_time-${index}`).value || null,  // ✅ 新增：場次時間
        venue: document.getElementById(`venue-${index}`).value || null,           // 場地
        table: document.getElementById(`table-${index}`).value || null,           // 桌號
      }));
  
      // ✅ 傳送更新資料給後端 API
      const response = await fetch(`/api/competition_schedule/${id}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
  
      if (response.ok) {
        alert("儲存成功！");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`儲存失敗：${errorData.error}`);
      }
    } catch (err) {
      console.error("儲存失敗:", err);
      alert("儲存時發生錯誤，請稍後再試");
    }
  };    

  const handlePublish = async () => {
    if (!window.confirm("確定要發布賽程嗎？發布後將無法撤銷！")) return;
  
    try {
      const response = await fetch(`/api/competition_schedule/${id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tournament_id: id,
          division: division,             // ✅ 傳遞 division
          event_type: subCategory         // ✅ 傳遞 event_type (子分類)
        }),
      });
  
      if (response.ok) {
        const data = await response.json();
  
        // 更新比賽資料（包含比賽日期與場次時間）
        setMatches(data.matches);
  
        // 設定發布狀態
        setIsPublished(true);
  
        alert("賽程發布成功！");
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`發布失敗：${errorData.error}`);
      }
    } catch (err) {
      console.error("發布失敗:", err);
      alert("發布時發生錯誤，請稍後再試");
    }
  };
  
  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">發生錯誤</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-gray-600">載入中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative">
      {/* 選擇 單打/雙打/團體 */}
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

      {/* 選擇 子類別 */}
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

      {/* 賽程表格 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 border-b">場次序號</th>
              <th className="px-6 py-3 border-b">參賽者 A</th>
              <th className="px-6 py-3 border-b">參賽者 B</th>
              <th className="px-6 py-3 border-b">裁判</th>
              <th className="px-6 py-3 border-b">日期</th>
              <th className="px-6 py-3 border-b">場次</th>
              <th className="px-6 py-3 border-b">場地</th>
              <th className="px-6 py-3 border-b">桌號</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, index) => (
              <tr key={index} className="text-center hover:bg-gray-50">
                <td className="px-6 py-3 border-b">{match.matchNumber}</td>
                <td className="px-6 py-3 border-b">
                  {match.participantA || ""}
                </td>
                <td className="px-6 py-3 border-b">
                  {match.participantB || ""}
                </td>
                <td className="px-6 py-3 border-b">{match.judge || ""}</td>
                <td className="px-6 py-3 border-b">
                  {isPublished ? (
                    formatDate(match.date)
                  ) : (
                    <select
                      id={`date-${index}`}
                      className="border rounded p-2 w-full"
                      value={formatDate(match.date) || ""}
                      onChange={(e) => handleMatchUpdate(index, 'date', e.target.value)}
                    >
                      <option value="">選擇日期</option>
                      {commonInfo.competitionDates.map((date, i) => (
                        <option key={i} value={date}>
                          {formatDate(date)}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-6 py-3 border-b">
                  {isPublished ? (
                    match.session_time || ""
                  ) : (
                    <select
                      id={`session_time-${index}`}
                      className="border rounded p-2 w-full"
                      value={match.session_time || ""}
                      onChange={(e) => handleMatchUpdate(index, 'session_time', e.target.value)}
                    >
                      <option value="">選擇場次</option>
                      {commonInfo.sessionTimes.map((session_time, i) => (
                        <option key={i} value={session_time}>
                          {session_time}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="px-6 py-3 border-b">
                  {isPublished ? (
                    match.venue || ""
                  ) : (
                    <select
                    id={`venue-${index}`}
                    className="border rounded p-2 w-full"
                    value={match.venue || ""}
                    onChange={(e) => handleMatchUpdate(index, 'venue', e.target.value)}
                  >
                    <option value="">選擇場地</option>
                    {commonInfo.venues.map((venue, i) => (
                      <option key={i} value={venue}>
                        {venue}
                      </option>
                    ))}
                  </select>
                  )}
                </td>
                <td className="px-6 py-3 border-b">
                  {isPublished ? (
                    match.table || ""
                  ) : (
                    <select
                      id={`table-${index}`}
                      className="border rounded p-2 w-full"
                      value={match.table || ""}
                      onChange={(e) => handleMatchUpdate(index, 'table', e.target.value)}
                    >
                      <option value="">選擇桌號</option>
                      {commonInfo.tables.map((table, i) => (
                        <option key={i} value={table}>
                          {table}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 儲存與發布按鈕 */}
      {!isPublished && (
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
          >
            儲存
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
          >
            發布
          </button>
        </div>
      )}
    </div>
  );
};

export default CompetitionCollege;
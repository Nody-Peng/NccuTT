"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Profile() {
  const [userInfo, setUserInfo] = useState(null);
  const [allTournaments, setAllTournaments] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 日期格式化（年/月/日）
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await fetch("/api/profile");
        if (res.status === 401) {
          window.location.href = "/api/auth/signin";
          return;
        }
        if (!res.ok) {
          alert("取得使用者資料失敗，請重新登入");
        }
        const data = await res.json();
        setUserInfo(data.user);
        setRegistrations(data.registrations || []);

        // 合併「我主辦的比賽」與「我參加的比賽」
        const combinedTournaments = [
          ...(data.tournaments || []),
          ...(data.organizedTournaments || []),
        ];

        // 去除重複的比賽 (依據 tournament_id)
        const uniqueTournaments = combinedTournaments.filter(
          (value, index, self) =>
            index ===
            self.findIndex((t) => t.tournament_id === value.tournament_id)
        );

        setAllTournaments(uniqueTournaments);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // 處理取消報名的函數
  const handleCancelRegistration = async (registerId) => {
    if (!confirm("確定要取消報名嗎？")) return;

    try {
      // 發送 DELETE 請求到後端 API
      const res = await fetch(`/api/profile?register_id=${registerId}`, {
        method: "DELETE",
      });

      // if (!res.ok) {
      //   const errorData = await res.json();
      //   throw new Error(errorData.error || "取消報名失敗");
      // }

      // 成功後從前端狀態中移除該報名資料
      setRegistrations((prev) =>
        prev.filter((registration) => registration.register_id !== registerId)
      );

      alert("取消報名成功！");
    } catch (error) {
      console.error("取消報名失敗：", error.message);
      alert(error.message || "取消報名失敗，請稍後再試");
    }
  };

  const getStatusValue = (status) => {
    const validStatuses = ["報名中", "進行中", "已結束"];
    return validStatuses.includes(status?.trim()) ? status.trim() : "報名中";
  };

  // 處理更新比賽狀態的函數
  const handleStatusChange = async (tournamentId, newStatus) => {
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tournamentId, newStatus }),
      });

      if (!response.ok) {
        const isJson = response.headers
          .get("content-type")
          ?.includes("application/json");
        const error = isJson
          ? await response.json()
          : { message: "An unknown error occurred" };
        alert(`更新失敗：${error.message}`);
        return;
      }

      // 更新狀態
      setAllTournaments((prevTournaments) =>
        prevTournaments.map((tournament) =>
          tournament.tournament_id === tournamentId
            ? { ...tournament, status: newStatus }
            : tournament
        )
      );
      alert("狀態更新成功！");
      window.location.reload();
    } catch (err) {
      console.error("更新失敗：", err);
      alert("更新失敗，請稍後再試");
    }
  };

  // 處理登出
  const handleLogout = async () => {
    try {
      // 發送登出請求到後端 API
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      });

      // if (!res.ok) throw new Error("登出失敗，請稍後再試");

      // 登出成功，導回首頁
      window.location.href = "/";
    } catch (error) {
      console.error("登出失敗：", error.message);
      alert("登出失敗，請稍後再試");
    }
  };

  // 申請成為主辦方
  const handleApplyOrganizer = async () => {
    try {
      const res = await fetch("/api/apply_organizer", {
        method: "POST",
      });

      const data = await res.json();

      // if (!res.ok) throw new Error(data.message || "申請失敗，請稍後再試");

      alert(data.message);
    } catch (error) {
      console.error("申請失敗：", error.message);
      alert(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!userInfo) return <p>No user information available</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      {/* 頂部背景區塊 */}
      <div className="w-full h-40 bg-[url('/DBMS_Background.png')] bg-cover bg-center rounded-b-3xl shadow-md relative">
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <img
            src={userInfo.profile_picture}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* 個人資訊區塊 */}
      <div className="w-full max-w-4xl bg-white p-8 mt-16 rounded-lg shadow-lg relative">
        {/* 返回按鈕 */}
        <button
          onClick={() => (window.location.href = "/competition")}
          className="absolute top-2 left-2 z-10 flex items-center justify-center px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-full shadow-md hover:bg-gray-200 hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out"
          aria-label="返回"
        >
          返回
        </button>

        <div className="space-y-4 mt-8">
          {" "}
          {/* 增加額外的 top padding */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold">Name</span>
            <span className="text-gray-800">{userInfo.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 font-semibold">Email</span>
            <span className="text-gray-800">{userInfo.email}</span>
          </div>
        </div>

        {/* 分隔線 - 我的報名 */}
        <div className="flex items-center mt-12 mb-2">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 font-medium">我的報名</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 報名資訊區塊 */}
        {registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    報名序號
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    報名時間
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽名稱
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽時間
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    報名組別
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽類型
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    取消報名
                  </th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration, index) => (
                  <tr key={index}>
                    <td className="border-b p-4">{registration.register_id}</td>
                    <td className="border-b p-4">
                      {formatDate(registration.registration_time)}
                    </td>
                    <td className="border-b p-4">
                      {registration.tournament_name}
                    </td>
                    <td className="border-b p-4">
                      {formatDate(registration.start_date)} ~{" "}
                      {formatDate(registration.end_date)}
                    </td>
                    <td className="border-b p-4">{registration.division}</td>
                    <td className="border-b p-4">{registration.event_type}</td>
                    <td
                      className="border-b p-4 text-red-500 cursor-pointer hover:underline"
                      onClick={() =>
                        handleCancelRegistration(registration.register_id)
                      }
                    >
                      取消報名
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">尚未報名任何比賽。</p>
        )}

        {/* 分隔線 - 我的比賽 */}
        <div className="flex items-center mt-16 mb-2">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 font-medium">我的比賽</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* 比賽資訊區塊 */}
        {allTournaments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽序號
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽名稱
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽時間
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    比賽地點
                  </th>
                  <th className="border-b p-4 font-semibold text-gray-700">
                    操作
                  </th>
                  {/* ✅ 狀態欄位：只有主辦方才會看到 */}
                  {userInfo.is_organizer && (
                    <th className="border-b p-4 font-semibold text-gray-700">
                      狀態
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {allTournaments.map((tournament, index) => (
                  <tr key={index}>
                    <td className="border-b p-4">{tournament.tournament_id}</td>
                    <td className="border-b p-4">
                      {tournament.tournament_name}
                    </td>
                    <td className="border-b p-4">
                      {formatDate(tournament.start_date)} ~{" "}
                      {formatDate(tournament.end_date)}
                    </td>
                    <td className="border-b p-4">
                      {tournament.location || "待定"}
                    </td>
                    <td className="border-b p-4">
                      {String(tournament.organizer_id) ===
                        String(userInfo.user_id) &&
                      tournament.status === "進行中" ? (
                        <Link
                          href={`/arrange_competition/${tournament.tournament_id}`}
                        >
                          <span className="text-green-500 cursor-pointer hover:underline">
                            安排賽程
                          </span>
                        </Link>
                      ) : tournament.status === "進行中" ? (
                        <Link
                          href={`/search_competition/${tournament.tournament_id}`}
                        >
                          <span className="text-blue-500 cursor-pointer hover:underline">
                            查看賽程
                          </span>
                        </Link>
                      ) : (
                        <span className="text-gray-400">尚未開放</span>
                      )}
                    </td>
                    {userInfo.is_organizer ? (
                      String(tournament.organizer_id) ===
                      String(userInfo.user_id) ? (
                        <td className="border-b p-4">
                          <select
                            className="p-2 border rounded"
                            value={getStatusValue(tournament.status)}
                            onChange={(e) =>
                              handleStatusChange(
                                tournament.tournament_id,
                                e.target.value
                              )
                            }
                          >
                            <option value="報名中">報名中</option>
                            <option value="進行中">進行中</option>
                            <option value="已結束">已結束</option>
                          </select>
                        </td>
                      ) : (
                        <td className="border-b p-4"></td> // 填充空欄位
                      )
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">尚未參加或主辦任何比賽。</p>
        )}

        {/* 申請成為主辦方按鈕 */}
        <div className="mt-8">
          {userInfo.is_organizer ? (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md cursor-not-allowed"
            >
              你已經是主辦方了
            </button>
          ) : userInfo.is_applying ? (
            <button
              disabled
              className="bg-gray-400 text-white px-6 py-3 rounded-lg shadow-md cursor-not-allowed"
            >
              你的申請正在審核中，請稍候
            </button>
          ) : (
            <button
              onClick={handleApplyOrganizer}
              className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition"
            >
              申請成為主辦方
            </button>
          )}
        </div>

        {/* 管理使用者按鈕 */}
        {userInfo.name === "Admin" && (
          <div className="mt-8">
            <button
              onClick={() => (window.location.href = "/admin")}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
            >
              管理使用者
            </button>
          </div>
        )}

        {/* 登出按鈕 */}
        <div className="flex justify-center mt-12">
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
          >
            登出
          </button>
        </div>
      </div>
    </div>
  );
}

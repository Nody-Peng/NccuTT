"use client";
import { useEffect, useState } from "react";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin");
        if (!res.ok) throw new Error("無法載入使用者資料");

        const data = await res.json();
        setUsers(data.users || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <p>載入中...</p>;
  if (error) return <p>錯誤：{error}</p>;

  const handleAcceptApplication = async (userId) => {
    try {
      const res = await fetch("/api/admin/accept_applying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error("接受申請失敗");

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId
            ? { ...user, is_organizer: 1, is_applying: 0 }
            : user
        )
      );
      alert("已接受申請！");
    } catch (error) {
      console.error("接受申請失敗：", error.message);
      alert("接受申請失敗，請稍後再試");
    }
  };

  const handleRejectApplication = async (userId) => {
    try {
      const res = await fetch("/api/admin/reject_applying", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error("拒絕申請失敗");

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, is_applying: 0 } : user
        )
      );
      alert("已拒絕申請！");
    } catch (error) {
      console.error("拒絕申請失敗：", error.message);
      alert("拒絕申請失敗，請稍後再試");
    }
  };

  const handleUpgradeToOrganizer = async (userId) => {
    try {
      const res = await fetch("/api/admin/ascend_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error("升級為主辦方用戶失敗");

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, is_organizer: 1 } : user
        )
      );
      alert("已升級為主辦方用戶！");
    } catch (error) {
      console.error("升級失敗：", error.message);
      alert("升級失敗，請稍後再試");
    }
  };

  const handleDowngradeToUser = async (userId) => {
    try {
      const res = await fetch("/api/admin/descend_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!res.ok) throw new Error("降級為一般用戶失敗");

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId ? { ...user, is_organizer: 0 } : user
        )
      );
      alert("已降級為一般用戶！");
    } catch (error) {
      console.error("降級失敗：", error.message);
      alert("降級失敗，請稍後再試");
    }
  };

  const applyingUsers = users.filter((user) => user.is_applying);
  const nonApplyingUsers = users.filter((user) => !user.is_applying);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full h-40 bg-[url('/DBMS_Background.png')] bg-cover bg-center rounded-b-3xl shadow-md"></div>

      <div className="w-full max-w-4xl bg-white p-8 mt-12 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">管理使用者</h1>

        {/* 申請中的用戶 */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">申請要求</h2>
          {applyingUsers.length > 0 ? (
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b p-4 font-semibold text-gray-700">姓名</th>
                  <th className="border-b p-4 font-semibold text-gray-700">電子郵件</th>
                  <th className="border-b p-4 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {applyingUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="border-b p-4">{user.name}</td>
                    <td className="border-b p-4">{user.email}</td>
                    <td className="border-b p-4 flex space-x-4">
                      <button
                        onClick={() => handleAcceptApplication(user.user_id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                      >
                        接受
                      </button>
                      <button
                        onClick={() => handleRejectApplication(user.user_id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                      >
                        拒絕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">目前沒有申請要求。</p>
          )}
        </div>

        {/* 非申請中的用戶 */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">所有用戶</h2>
          {nonApplyingUsers.length > 0 ? (
            <table className="w-full text-left border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-b p-4 font-semibold text-gray-700">姓名</th>
                  <th className="border-b p-4 font-semibold text-gray-700">電子郵件</th>
                  <th className="border-b p-4 font-semibold text-gray-700">角色</th>
                  <th className="border-b p-4 font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {nonApplyingUsers.map((user) => (
                  <tr key={user.user_id}>
                    <td className="border-b p-4">{user.name}</td>
                    <td className="border-b p-4">{user.email}</td>
                    <td className="border-b p-4">
                      {user.is_organizer ? "主辦方用戶" : "一般用戶"}
                    </td>
                    <td className="border-b p-4">
                      {user.is_organizer ? (
                        <button
                          onClick={() => handleDowngradeToUser(user.user_id)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                        >
                          降級為一般用戶
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgradeToOrganizer(user.user_id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
                        >
                          升級為主辦方用戶
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">目前沒有使用者。</p>
          )}
        </div>
      </div>
    </div>
  );
}

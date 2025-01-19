'use client'
import React from 'react'
import { useState, useEffect } from 'react'

export default function ScheduleDisplay() {
  const [tournamentId, setTournamentId] = useState('1')
  const [category, setCategory] = useState<string>('大專組')
  const [division, setDivision] = useState<string>('個人賽')
  const [gender, setGender] = useState<string>('')
  const [matchType, setMatchType] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [schedule, setSchedule] = useState<any[]>([])

  // 處理組別切換
  const handleCategoryClick = (value: string) => {
    setCategory(value)
    setMatchType('')
  }

  // 處理賽別切換
  const handleDivisionClick = (value: string) => {
    setDivision(value)
    setGender('')
    setMatchType('')
  }

  // 處理性別切換
  const handleGenderClick = (value: string) => {
    setGender(value)
  }

  // 處理比賽形式切換
  const handleMatchTypeClick = (value: string) => {
    setMatchType(value)
  }

  // 查詢賽程資料
  const handleScheduleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/getSchedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tournament_id: tournamentId,
          division: division,
          gender: gender,
          matchType: matchType,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      if (data.schedule) {
        setSchedule(data.schedule)
        setSuccess('賽程資料載入成功！')
      } else {
        setError('無法取得賽程資料')
      }
    } catch (err: any) {
      setError(err.message || '無法取得賽程資料，請稍後再試')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          查詢賽程
        </h2>
        <p className="text-gray-600 text-center mb-6">
          請選擇比賽資訊來查詢賽程
        </p>

        {/* 錯誤訊息 */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 成功訊息 */}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        {/* 查詢表單 */}
        <form onSubmit={handleScheduleSubmit}>
          {/* 比賽 ID */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">比賽 ID</label>
            <input
              type="text"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              placeholder="請輸入比賽 ID"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* 組別 */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">組別</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleDivisionClick('大專組')}
                className={`p-2 rounded ${
                  division === '大專組'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                大專組
              </button>
              <button
                type="button"
                onClick={() => handleDivisionClick('社會組')}
                className={`p-2 rounded ${
                  division === '社會組'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                社會組
              </button>
            </div>
          </div>

          {/* 性別選項 */}
          {division === '大專組' && (
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">性別</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleGenderClick('男子')}
                  className={`p-2 rounded ${
                    gender === '男子' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  男子
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderClick('女子')}
                  className={`p-2 rounded ${
                    gender === '女子' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  女子
                </button>
              </div>
            </div>
          )}

          {/* 比賽類別 */}
          <div className="mb-4">
            <label className="block text-gray-600 mb-1">比賽類別</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleCategoryClick('個人賽')}
                className={`p-2 rounded ${
                  category === '個人賽'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                個人賽
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick('團體賽')}
                className={`p-2 rounded ${
                  category === '團體賽'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                團體賽
              </button>
            </div>
          </div>

          {/* 單打雙打選項 */}
          {category === '個人賽' && (
            <div className="mb-4">
              <label className="block text-gray-600 mb-1">比賽形式</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => handleMatchTypeClick('單打')}
                  className={`p-2 rounded ${
                    matchType === '單打'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  單打
                </button>
                <button
                  type="button"
                  onClick={() => handleMatchTypeClick('雙打')}
                  className={`p-2 rounded ${
                    matchType === '雙打'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  雙打
                </button>
              </div>
            </div>
          )}

          <button className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
            查詢賽程
          </button>
        </form>

        {/* 顯示賽程 */}
        {schedule.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              賽程資料
            </h3>
            <table className="w-full table-auto border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border-b">比賽編號</th>
                  <th className="px-4 py-2 text-left border-b">選手 1</th>
                  <th className="px-4 py-2 text-left border-b">選手 2</th>
                  <th className="px-4 py-2 text-left border-b">賽程時間</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((match, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border-b">{match.match_number}</td>
                    <td className="px-4 py-2 border-b">
                      {match.player_one_name}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {match.player_two_name}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {match.schedule_time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

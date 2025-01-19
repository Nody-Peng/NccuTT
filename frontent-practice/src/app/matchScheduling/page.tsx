'use client'

import { useState } from 'react'

export default function ScheduleArrangement() {
  const [tournamentId, setTournamentId] = useState('1')
  const [category, setCategory] = useState<string>('大專組')
  const [division, setDivision] = useState<string>('個人賽')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [gender, setGender] = useState('')
  const [matchType, setMatchType] = useState('')
  const [participants, setParticipants] = useState([])

  const handleCategoryClick = (value: string) => {
    setCategory(value)
    setMatchType('')
  }

  const handleDivisionClick = (value: string) => {
    setDivision(value)
    setGender('')
    setMatchType('')
  }

  const handleGenderClick = (value: string) => {
    setGender(value)
  }

  const handleMatchTypeClick = (value: string) => {
    setMatchType(value)
  }

  const handleScheduleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/matchScheduling', {
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
      if (data.participants) {
        setParticipants(data.participants)
      } else {
        console.error('Error: participants data not found')
      }

      setSuccess('賽程安排成功！')
      // setTournamentId('')
      // setCategory('')
      // setDivision('')
      // setGender('')
      // setMatchType('')
    } catch (err: any) {
      setError(err.message || '無法安排賽程，請稍後再試')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-lg">
        {/* 標題 */}
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          安排賽程
        </h2>
        <p className="text-gray-600 text-center mb-6">
          請輸入比賽資訊以安排賽程
        </p>

        {/* 錯誤訊息 */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        {/* 成功訊息 */}
        {success && (
          <p className="text-green-500 text-center mb-4">{success}</p>
        )}

        {/* 賽程安排表單 */}
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
            安排賽程
          </button>
        </form>
      </div>
    </div>
  )
}
